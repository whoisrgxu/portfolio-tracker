# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from routes import portfolio
from services.live_prices import price_stream_manager

import time
time.sleep(12)  # Between requests
# Load env variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Portfolio API")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routes import quotes, holdings, health, stream, chatbot

app.include_router(holdings.router, prefix="/holdings", tags=["Holdings"])
app.include_router(quotes.router, prefix="/quotes", tags=["Quotes"])
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(portfolio.router, prefix="/portfolio")
app.include_router(stream.router, prefix="/stream", tags=["Stream"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])


@app.on_event("startup")
async def start_streaming():
    # Spawn the Finnhub stream bridge as soon as the API process is ready.
    await price_stream_manager.start()


@app.on_event("shutdown")
async def stop_streaming():
    await price_stream_manager.stop()




# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# import requests
# from dotenv import load_dotenv
# import os
# from pathlib import Path
# import finnhub
# from sqlalchemy import create_engine, Column, Integer, String, Float

# env_path = Path(__file__).resolve().parent / ".env"
# load_dotenv(dotenv_path=env_path)

# DATABASE_URL = os.getenv("DATABASE_URL")
# engine = create_engine(DATABASE_URL)

# app = FastAPI(title="Portfolio API")

# # allow frontend dev origin
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class HoldingIn(BaseModel):
#     symbol: str
#     quantity: float
#     avgCost: float

# class HoldingOut(HoldingIn):
#     id: str

# _DB: list[HoldingOut] = []

# @app.get("/health")
# def health():
#     return {"status": "ok"}

# @app.get("/holdings", response_model=List[HoldingOut])
# def list_holdings(userId: str):
#     # Filter holdings for the specific user
#     user_holdings = [h for h in _DB if h.userId == userId]
#     return user_holdings

# @app.post("/holdings", response_model=HoldingOut)
# def create_holding(h: HoldingIn):
#     new = HoldingOut(id=str(len(_DB)+1), **h.model_dump())
#     _DB.append(new)
#     return new
# @app.delete("/holdings/{holding_id}", response_model=dict)
# def delete_holding(holding_id: str):
#     global _DB
#     _DB = [h for h in _DB if h.id != holding_id]
#     return {"status": "ok"}
# @app.get("/holdings/{holding_id}", response_model=HoldingOut)
# def get_holding(holding_id: str):
#     for h in _DB:
#         if h.id == holding_id:
#             return h
#     return None
# @app.put("/holdings/{holding_id}", response_model=HoldingOut)
# def update_holding(holding_id: str, h: HoldingIn):
#     for i, existing in enumerate(_DB):
#         if existing.id == holding_id:
#             updated = HoldingOut(id=holding_id, **h.model_dump())
#             _DB[i] = updated
#             return updated
#     return None
# @app.get("/")
# def root():
#     return {"message": "Welcome to the Portfolio API"}

# # Example endpoint to get stock quotes
# # Should batch requests in production? Look at twelvedata docs to see if they support batch requests
# # https://twelvedata.com/docs#price


# # API_KEY = os.getenv("QUOTE_API_KEY")
# # @app.get("/quote")
# # def get_quote(symbol: str):
# #     # Example with Twelve Data
# #     url = f"https://api.twelvedata.com/price?symbol={symbol}&apikey={API_KEY}"
# #     r = requests.get(url)
# #     data = r.json()
# #     return {
# #         "symbol": symbol,
# #         "price": float(data["price"]),
# #     }
# FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
# finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)
# @app.get("/quote")
# def get_quote(symbol: str):
#     upper_symbol = symbol.upper()
#     try:
#         data = finnhub_client.quote(upper_symbol)
#         return {
#             "symbol": upper_symbol,
#             "price": data.get("c"),
#             "day_change": data.get("d"),
#             "day_change_percent": data.get("dp"),
#         }
#     except Exception as e:
#         print("Finnhub quote error:", e)
#         raise HTTPException(status_code=500, detail="Failed to fetch quote data")

# @app.get("/search/{symbol}")
# def search_symbol(symbol: str):
#     try:
#         data = finnhub_client.symbol_lookup(symbol)
#         results = [
#             {
#             "symbol": item["symbol"],
#             "description": item["description"],
#             }
#             for item in data.get("result", [])[:1]
#         ]
#         return results
#     except Exception as e:
#         print("Error during symbol lookup:", e)
#         return {"error": "Failed to fetch symbol data from Finnhub."}
