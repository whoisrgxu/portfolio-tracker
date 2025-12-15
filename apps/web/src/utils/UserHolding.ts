
class UserHoldingsService {

    private userId: string;
    private baseUrl: string;
    constructor(userId: string, baseUrl: string = (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:8000") {
        this.userId = userId;
        this.baseUrl = baseUrl;
    }

    async getUserHoldings() {
        const response = await fetch(`${this.baseUrl}/holdings?user_id=${this.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user holdings');
        }
        return response.json();
    }

    async addUserHolding(holding: { symbol: string; shares: number; averagePrice: number;}) {
        const response = await fetch(`${this.baseUrl}/holdings?user_id=${this.userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({symbol: holding.symbol, quantity: holding.shares, avg_cost: holding.averagePrice}),
        });
        if (!response.ok) {
            throw new Error('Failed to add user holding');
        }
        return response.json();
    }

    async removeUserHolding(holdingId: string) {
        const response = await fetch(`api/holdings/${holdingId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove user holding');
        }
        return response.json();
    }

    async updateUserHolding(holdingId: string, updates: { shares?: number; avgCost?: number; currentPrice?: number; dayChange?: number; dayChangePercent?: number; }) {
        const response = await fetch(`api/holdings/${holdingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error('Failed to update user holding');
        }
        return response.json();
    }

    async getUserHolding(holdingId: string) {
        const response = await fetch(`api/holdings/${holdingId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user holding');
        }
        return response.json();
    }
}

export default UserHoldingsService;