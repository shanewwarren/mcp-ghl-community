const BASE_URL = "https://services.leadconnectorhq.com/communities";

export class GhlClient {
  private token: string;
  private locationId?: string;

  constructor(token: string, locationId?: string) {
    this.token = token;
    this.locationId = locationId;
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Token-Id": this.token,
      "Content-Type": "application/json",
    };
    if (this.locationId) {
      h["x-location-id"] = this.locationId;
    }
    return h;
  }

  async get(path: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
    const res = await fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: this.headers(),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GET ${path} failed (${res.status}): ${body}`);
    }
    return res.json();
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(this.buildUrl(path), {
      method: "POST",
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }

  async patch(path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(this.buildUrl(path), {
      method: "PATCH",
      headers: this.headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PATCH ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }

  async delete(path: string): Promise<unknown> {
    const res = await fetch(this.buildUrl(path), {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DELETE ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }
}
