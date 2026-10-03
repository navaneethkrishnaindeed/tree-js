import { rateLimit } from "./config";

const stamps: number[] = [];

async function acquireSlot(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (stamps.length > 0 && now - stamps[0]! >= rateLimit.windowMs) {
      stamps.shift();
    }
    if (stamps.length < rateLimit.maxRequests) {
      stamps.push(now);
      return;
    }
    const wait = rateLimit.windowMs - (now - stamps[0]!) + 15;
    await new Promise((resolve) => {
      window.setTimeout(resolve, wait);
    });
  }
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async getJson<T>(path: string): Promise<T> {
    await acquireSlot();
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${path}`);
    }
    return (await response.json()) as T;
  }
}
