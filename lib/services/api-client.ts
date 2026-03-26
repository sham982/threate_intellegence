/**
 * API Client Service - Centralized HTTP request handling with retry logic and rate limiting
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  headers: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;
  private rateLimitStore: Map<string, number[]> = new Map();

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a generic HTTP request with retry logic
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = 3,
      retryDelay = 1000,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

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

        // Check rate limit
        const rateLimit = response.headers.get('X-RateLimit-Remaining');
        if (rateLimit) {
          this.updateRateLimitStore(endpoint, parseInt(rateLimit, 10));
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        if (!response.ok) {
          if (response.status === 429 && attempt < retries) {
            // Rate limited, retry with exponential backoff
            await this.delay(retryDelay * Math.pow(2, attempt));
            continue;
          }

          const error = await response.text();
          return {
            error: error || `HTTP ${response.status}`,
            status: response.status,
            headers: responseHeaders,
          };
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: responseHeaders,
        };
      } catch (error) {
        if (attempt === retries) {
          return {
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 0,
            headers: {},
          };
        }

        // Exponential backoff
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    return {
      error: 'Max retries exceeded',
      status: 0,
      headers: {},
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Check rate limit status
   */
  getRateLimitStatus(endpoint: string): { remaining: number; resetAt?: Date } {
    const times = this.rateLimitStore.get(endpoint) || [];
    const oneMinuteAgo = Date.now() - 60000;

    // Clean up old timestamps
    const recentTimes = times.filter((t) => t > oneMinuteAgo);
    if (recentTimes.length !== times.length) {
      this.rateLimitStore.set(endpoint, recentTimes);
    }

    return {
      remaining: 60 - recentTimes.length,
      resetAt: new Date(Math.max(...recentTimes) + 60000),
    };
  }

  /**
   * Update rate limit store
   */
  private updateRateLimitStore(endpoint: string, remaining: number): void {
    if (remaining === 0) {
      const time = Date.now();
      const times = this.rateLimitStore.get(endpoint) || [];
      times.push(time);
      this.rateLimitStore.set(endpoint, times.slice(-60)); // Keep last 60 requests
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const apiClient = new ApiClient();
