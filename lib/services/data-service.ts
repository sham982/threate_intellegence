/**
 * Data Service - Manages caching, aggregation, and persistence of threat data
 */

export interface CachedData {
  key: string;
  value: unknown;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface DataAggregation {
  totalChecks: number;
  threatsDetected: number;
  avgRiskScore: number;
  riskDistribution: Record<string, number>;
  topThreats: Array<{ name: string; count: number }>;
}

class DataService {
  private cache: Map<string, CachedData> = new Map();
  private storage = typeof window !== 'undefined' ? window.localStorage : null;

  /**
   * Get data from cache with TTL validation
   */
  get(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Set data in cache with TTL
   */
  set(key: string, value: unknown, ttl: number = 3600000): void {
    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get all cached keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Persist data to localStorage
   */
  persist(key: string, data: unknown): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(`seccheck:${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }

  /**
   * Retrieve persisted data from localStorage
   */
  retrieve<T>(key: string): T | null {
    if (!this.storage) return null;
    try {
      const data = this.storage.getItem(`seccheck:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Clear persisted data
   */
  clearPersisted(key: string): void {
    if (!this.storage) return;
    this.storage.removeItem(`seccheck:${key}`);
  }

  /**
   * Generate aggregated statistics
   */
  aggregateCheckHistory(checks: Array<any>): DataAggregation {
    const totalChecks = checks.length;
    let threatsDetected = 0;
    let totalRiskScore = 0;
    const riskDistribution: Record<string, number> = {
      safe: 0,
      low: 0,
      medium: 0,
      high: 0,
    };

    checks.forEach((check) => {
      if (check.riskLevel !== 'safe' && check.riskLevel !== 'benign') {
        threatsDetected++;
      }
      totalRiskScore += check.riskScore || 0;
      riskDistribution[check.riskLevel] = (riskDistribution[check.riskLevel] || 0) + 1;
    });

    return {
      totalChecks,
      threatsDetected,
      avgRiskScore: totalChecks > 0 ? totalRiskScore / totalChecks : 0,
      riskDistribution,
      topThreats: this.getTopThreats(checks),
    };
  }

  /**
   * Extract top threats from check history
   */
  private getTopThreats(checks: Array<any>): Array<{ name: string; count: number }> {
    const threatCounts: Record<string, number> = {};

    checks.forEach((check) => {
      if (check.type && check.riskLevel !== 'safe') {
        threatCounts[check.type] = (threatCounts[check.type] || 0) + 1;
      }
    });

    return Object.entries(threatCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Filter checks by criteria
   */
  filterChecks(
    checks: Array<any>,
    criteria: {
      type?: string;
      riskLevel?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Array<any> {
    return checks.filter((check) => {
      if (criteria.type && check.type !== criteria.type) return false;
      if (criteria.riskLevel && check.riskLevel !== criteria.riskLevel) return false;
      if (criteria.startDate && new Date(check.timestamp) < criteria.startDate) return false;
      if (criteria.endDate && new Date(check.timestamp) > criteria.endDate) return false;
      return true;
    });
  }

  /**
   * Batch process checks for bulk operations
   */
  async batchProcess<T>(
    items: Array<T>,
    processor: (item: T) => Promise<void>,
    batchSize: number = 10
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(processor));
    }
  }
}

export const dataService = new DataService();
