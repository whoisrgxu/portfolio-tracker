"""
Service responsible for maintaining a single long-lived connection to Finnhub's
streaming WebSocket and fan-out price updates to any connected dashboard
clients via our own FastAPI WebSocket endpoint.

Keeping the provider connection here (instead of directly in the HTTP route)
lets every app server instance reuse the same upstream stream, hide the API key
from browsers, and keep subscribe/unsubscribe logic in one place.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, Set

import websockets
from websockets.exceptions import ConnectionClosed
import logging


logger = logging.getLogger("live_prices")


def get_finnhub_ws_url() -> str | None:
    token = os.getenv("FINNHUB_API_KEY")
    if not token:
        return None
    return f"wss://ws.finnhub.io?token={token}"


@dataclass
class ClientSession:
    """Small container for the state we keep per connected dashboard client."""

    id: str
    symbols: Set[str] = field(default_factory=set)
    queue: asyncio.Queue[dict[str, Any]] = field(
        default_factory=lambda: asyncio.Queue(maxsize=100)
    )


class FinnhubStreamManager:
    """
    Coordinates a background task that keeps Finnhub's WebSocket alive and
    dispatches each trade event to the matching UI subscribers.
    """

    def __init__(self) -> None:
        self._clients: Dict[str, ClientSession] = {}
        self._symbol_clients: Dict[str, Set[str]] = defaultdict(set)
        self._connection_task: asyncio.Task | None = None
        self._ws_lock = asyncio.Lock()
        self._send_queue: asyncio.Queue[str] = asyncio.Queue()
        self._connected_event = asyncio.Event()
        self._shutdown_event = asyncio.Event()

    async def start(self) -> None:
        """Launch the connection manager once FastAPI finishes booting."""
        ws_url = get_finnhub_ws_url()
        if not ws_url:
            logger.warning(
                "FINNHUB_API_KEY is not set; real-time price streaming is disabled."
            )
            return
        if self._connection_task is None or self._connection_task.done():
            self._connection_task = asyncio.create_task(self._connection_loop())

    async def stop(self) -> None:
        """Signal the background task to stop and wait for a graceful exit."""
        self._shutdown_event.set()
        if self._connection_task:
            self._connection_task.cancel()
            try:
                await self._connection_task
            except asyncio.CancelledError:
                pass

    async def register_client(self, client_id: str) -> ClientSession:
        """Create a new session bucket for a frontend connection."""
        session = ClientSession(id=client_id)
        self._clients[client_id] = session
        return session

    async def unregister_client(self, client_id: str) -> None:
        """Drop the client and clean up subscriptions that nobody else uses."""
        session = self._clients.pop(client_id, None)
        if not session:
            return

        for symbol in list(session.symbols):
            await self._remove_client_symbol(client_id, symbol)

    async def subscribe(self, client_id: str, symbols: Iterable[str]) -> None:
        """Attach a client to a list of tickers, subscribing upstream as needed."""
        session = self._clients.get(client_id)
        if not session:
            return

        for raw_symbol in symbols:
            symbol = raw_symbol.upper().strip()
            if not symbol or symbol in session.symbols:
                continue
            session.symbols.add(symbol)
            self._symbol_clients[symbol].add(client_id)
            # Tell Finnhub only when this is the very first watcher.
            if len(self._symbol_clients[symbol]) == 1:
                await self._send_command({"type": "subscribe", "symbol": symbol})

    async def unsubscribe(self, client_id: str, symbols: Iterable[str]) -> None:
        """Detach a client from specific tickers."""
        for raw_symbol in symbols:
            symbol = raw_symbol.upper().strip()
            await self._remove_client_symbol(client_id, symbol)

    async def _remove_client_symbol(self, client_id: str, symbol: str) -> None:
        session = self._clients.get(client_id)
        if not session or symbol not in session.symbols:
            return

        session.symbols.discard(symbol)
        clients = self._symbol_clients.get(symbol)
        if clients and client_id in clients:
            clients.remove(client_id)
        if clients is not None and len(clients) == 0:
            self._symbol_clients.pop(symbol, None)
            await self._send_command({"type": "unsubscribe", "symbol": symbol})

    async def forward_client_messages(self, client_id: str, websocket_send) -> None:
        """
        Continuously drain the client's queue and push events into its WebSocket.

        `websocket_send` is injected by the FastAPI route so this service remains
        framework-agnostic; it simply has to be an `await`-able callable that
        accepts a JSON-serializable dict.
        """
        session = self._clients.get(client_id)
        if not session:
            return

        while True:
            payload = await session.queue.get()
            await websocket_send(payload)

    async def _send_command(self, payload: dict[str, Any]) -> None:
        """Queue an instruction (`subscribe`/`unsubscribe`/`pong`)."""
        await self._send_queue.put(json.dumps(payload))

    async def _connection_loop(self) -> None:
        """
        Keep the Finnhub connection alive forever, backing off if we get kicked.
        """
        backoff = 1.0
        while not self._shutdown_event.is_set():
            ws_url = get_finnhub_ws_url()
            if not ws_url:
                await asyncio.sleep(5)
                continue
            try:
                async with websockets.connect(ws_url) as ws:
                    self._connected_event.set()
                    backoff = 1.0  # Reset once we successfully connect.
                    await self._resubscribe_all()
                    sender = asyncio.create_task(self._sender(ws))
                    receiver = asyncio.create_task(self._receiver(ws))
                    await asyncio.wait(
                        [sender, receiver],
                        return_when=asyncio.FIRST_COMPLETED,
                    )
                    sender.cancel()
                    receiver.cancel()
            except Exception as exc:
                # Log + retry with a capped exponential backoff.
                print(f"[FinnhubStreamManager] connection error: {exc}")
            finally:
                self._connected_event.clear()

            if self._shutdown_event.is_set():
                break

            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)

    async def _resubscribe_all(self) -> None:
        """When we reconnect, replay all active subscriptions."""
        active_symbols = list(self._symbol_clients.keys())
        for symbol in active_symbols:
            await self._send_command({"type": "subscribe", "symbol": symbol})

    async def _sender(self, ws: websockets.WebSocketClientProtocol) -> None:
        """Forward queued commands to Finnhub."""
        while True:
            payload = await self._send_queue.get()
            await ws.send(payload)

    async def _receiver(self, ws: websockets.WebSocketClientProtocol) -> None:
        """Parse Finnhub events and broadcast the useful ones."""
        try:
            async for message in ws:
                await self._handle_message(message)
        except ConnectionClosed:
            # The main loop will reconnect for us.
            pass

    async def _handle_message(self, message: str) -> None:
        """Downstream fan-out of trades (and keep the ping/pong alive)."""
        try:
            payload = json.loads(message)
        except json.JSONDecodeError:
            print(f"[FinnhubStreamManager] unable to decode message: {message}")
            return

        msg_type = payload.get("type")
        if msg_type == "ping":
            await self._send_command({"type": "pong"})
            return

        if msg_type != "trade":
            return

        for trade in payload.get("data", []):
            symbol = trade.get("s")
            price = trade.get("p")
            ts = trade.get("t")
            volume = trade.get("v")
            if not symbol or price is None:
                continue
            await self._broadcast_trade(symbol, price, ts, volume)

    async def _broadcast_trade(
        self, symbol: str, price: float, timestamp: int | None, volume: float | None
    ) -> None:
        """Push a normalized trade payload into every interested client's queue."""
        clients = self._symbol_clients.get(symbol)
        if not clients:
            return

        event = {
            "type": "trade",
            "symbol": symbol,
            "price": price,
            "volume": volume,
            "timestamp": timestamp or int(time.time() * 1000),
            "source": "finnhub",
        }

        for client_id in list(clients):
            connection = self._clients.get(client_id)
            if not connection:
                continue
            try:
                connection.queue.put_nowait(event)
            except asyncio.QueueFull:
                # Drop the oldest item to keep latency low if a client is slow.
                try:
                    connection.queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
                connection.queue.put_nowait(event)


price_stream_manager = FinnhubStreamManager()
