import { Injectable } from '@nestjs/common';


@Injectable()
export class ScoredCacheService {

  private cache: Map<string, any> = new Map();
  private scores: Map<string, number> = new Map();
  private readonly maxKeys: number = 10000;

  async get(key: string): Promise<any> {

    const value = this.cache.get(key);
    if (value) {
      this.incrementScore(key);

      console.log(`Amount of cache access for prompt: ${this.scores.get(key)}`)

      return value;
    }

    return null;
  }

  async set(key: string, value: any): Promise<void> {
    if (this.cache.size >= this.maxKeys) {
      this.evictLowestScored();
    }
    
    this.cache.set(key, value);
    this.incrementScore(key);
  }

  private incrementScore(key: string): void {
    const currentScore = this.scores.get(key) || 0;
    this.scores.set(key, currentScore + 1);
  }

  private evictLowestScored(): void {
    let lowestScore = Infinity;
    let lowestKey = '';

    for (const [key, score] of this.scores.entries()) {
      if (score < lowestScore) {
        lowestScore = score;
        lowestKey = key;
      }
    }

    if (lowestKey) {
      this.cache.delete(lowestKey);
      this.scores.delete(lowestKey);
    }
  }
}
