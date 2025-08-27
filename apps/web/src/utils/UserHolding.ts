
class UserHoldingsService {

    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    async getUserHoldings() {
        const response = await fetch(`/api/holdings?userId=${this.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user holdings');
        }
        return response.json();
    }

    async addUserHolding(holding: { symbol: string; shares: number; avgCost: number; currency?: "USD" | "CAD"; }) {
        const response = await fetch(`/api/holdings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: this.userId, ...holding }),
        });
        if (!response.ok) {
            throw new Error('Failed to add user holding');
        }
        return response.json();
    }

    async removeUserHolding(holdingId: string) {
        const response = await fetch(`/api/holdings/${holdingId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to remove user holding');
        }
        return response.json();
    }

    async updateUserHolding(holdingId: string, updates: { shares?: number; avgCost?: number; currentPrice?: number; dayChange?: number; dayChangePercent?: number; }) {
        const response = await fetch(`/api/holdings/${holdingId}`, {
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
        const response = await fetch(`/api/holdings/${holdingId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user holding');
        }
        return response.json();
    }
}

export default UserHoldingsService;