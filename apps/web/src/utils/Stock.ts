// api/Stock.ts
import {StockInfo} from "../Types/StockInfo";
export class StockInfoService {
  public symbol: string;
  public info: StockInfo | null = null;
  public price: number | null = null;
  public dayChange: number | null = null;
  public dayChangePercent: number | null = null;
  private baseUrl: string;

  constructor(symbol: string, baseUrl: string = (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:8000") {
    this.symbol = symbol;
    this.baseUrl = baseUrl;
  }

  async fetchInfo(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/quotes/search/${this.symbol}`);
      if (!res.ok) throw new Error("Failed to fetch info");
      const data = await res.json();
      console.log("Fetched stock info:", data);
      this.info = data[0];
    } catch (error) {
      console.error("Error fetching stock info:", error);
    }
  }

  async fetchPriceAndChange(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/quotes?symbol=${this.symbol}`);
      if (!res.ok) throw new Error("Failed to fetch price");
      const data = await res.json();
      this.price = data.price;
      this.dayChange = data.day_change;
      this.dayChangePercent = data.day_change_percent;
    } catch (error) {
      console.error("Error fetching stock price:", error);
    }
  }

  async fetchAll(): Promise<void> {
    await Promise.all([this.fetchInfo(), this.fetchPriceAndChange()]);
  }
}
