"""
WebSocket endpoint that frontends connect to for real-time price updates.

All heavy lifting (connecting to Finnhub, subscription fan-out, retries, etc.)
is handled in `services.live_prices`. The route only takes care of managing the
FastAPI `WebSocket` object and translating client messages into subscription
calls on the manager.
"""

from __future__ import annotations

import asyncio
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.live_prices import get_finnhub_ws_url, price_stream_manager

router = APIRouter()


@router.websocket("/prices")
async def price_stream(websocket: WebSocket) -> None:
    """
    Accept a dashboard client, keep it wired to the stream manager, and translate
    `subscribe`/`unsubscribe` messages into Finnhub subscriptions.
    """

    await websocket.accept()

    if not get_finnhub_ws_url():
        await websocket.send_json(
            {
                "type": "error",
                "message": "Live streaming is disabled on the server (missing FINNHUB_API_KEY).",
            }
        )
        await websocket.close()
        return
    client_id = str(uuid4())
    await price_stream_manager.register_client(client_id)

    async def websocket_send(payload: dict[str, Any]) -> None:
        await websocket.send_json(payload)

    sender_task = asyncio.create_task(
        price_stream_manager.forward_client_messages(client_id, websocket_send)
    )

    # Let the client know the server connection is up before we start reading.
    await websocket_send({"type": "ready", "clientId": client_id})

    try:
        while True:
            message = await websocket.receive_json()
            action = message.get("action")
            symbols = message.get("symbols", [])

            if not isinstance(symbols, list):
                symbols = []

            if action == "subscribe":
                await price_stream_manager.subscribe(client_id, symbols)
            elif action == "unsubscribe":
                await price_stream_manager.unsubscribe(client_id, symbols)
            else:
                await websocket_send(
                    {
                        "type": "error",
                        "message": "Unknown action. Use 'subscribe' or 'unsubscribe'.",
                    }
                )
    except WebSocketDisconnect:
        # User closed the tab or lost connection; clean up gracefully.
        pass
    finally:
        sender_task.cancel()
        try:
            await sender_task
        except asyncio.CancelledError:
            pass
        await price_stream_manager.unregister_client(client_id)
