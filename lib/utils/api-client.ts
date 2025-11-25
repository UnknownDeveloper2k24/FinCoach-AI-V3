/**
 * FinPilot API Client
 * Centralized API communication layer
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  range?: {
    lower: number;
    upper: number;
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        confidence: data.confidence,
        range: data.range,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Income endpoints
  async getIncome(userId: string) {
    return this.request(`/api/v1/income?userId=${userId}`);
  }

  async getIncomeForecast(userId: string, days: number = 30) {
    return this.request(`/api/v1/income/forecast?userId=${userId}&days=${days}`);
  }

  // Spending endpoints
  async getSpending(userId: string, period: string = 'month') {
    return this.request(`/api/v1/spending?userId=${userId}&period=${period}`);
  }

  async parseSMS(userId: string, message: string) {
    return this.request(`/api/v1/sms`, {
      method: 'POST',
      body: { userId, message },
    });
  }

  // Cashflow endpoints
  async getCashflow(userId: string) {
    return this.request(`/api/v1/cashflow?userId=${userId}`);
  }

  // Budget endpoints
  async getBudget(userId: string) {
    return this.request(`/api/v1/budget?userId=${userId}`);
  }

  // Goals endpoints
  async getGoals(userId: string) {
    return this.request(`/api/v1/goals?userId=${userId}`);
  }

  // Alerts endpoints
  async getAlerts(userId: string) {
    return this.request(`/api/v1/alerts?userId=${userId}`);
  }

  // Coach endpoints
  async getCoach(userId: string) {
    return this.request(`/api/v1/coach?userId=${userId}`);
  }

  // Voice endpoints
  async processVoice(userId: string, audioData: string) {
    return this.request(`/api/v1/voice`, {
      method: 'POST',
      body: { userId, audioData },
    });
  }

  // Market endpoints
  async getMarket(symbol: string) {
    return this.request(`/api/v1/market?symbol=${symbol}`);
  }

  // Assets endpoints
  async getAssets(userId: string) {
    return this.request(`/api/v1/assets?userId=${userId}`);
  }

  // Jars endpoints
  async getJars(userId: string) {
    return this.request(`/api/v1/jars?userId=${userId}`);
  }

  async getJar(userId: string, jarId: string) {
    return this.request(`/api/v1/jars/${jarId}?userId=${userId}`);
  }

  async updateJar(userId: string, jarId: string, data: any) {
    return this.request(`/api/v1/jars/${jarId}`, {
      method: 'PUT',
      body: { userId, ...data },
    });
  }

  async deleteJar(userId: string, jarId: string) {
    return this.request(`/api/v1/jars/${jarId}`, {
      method: 'DELETE',
      body: { userId },
    });
  }

  // Users endpoints
  async getUser(userId: string) {
    return this.request(`/api/v1/users?userId=${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
