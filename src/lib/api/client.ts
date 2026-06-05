/**
 * AIXENTRA API Abstraction Layer – Base Client
 *
 * Centralises all HTTP communication so the same business-logic calls can be
 * routed to different backends (Next.js API routes today, a shared REST/GraphQL
 * server for React Native or Flutter tomorrow).
 *
 * Usage in Next.js web app:
 *   import { apiClient } from '@/lib/api/client';
 *   const data = await apiClient.get('/api/songs');
 *
 * TODO (native):
 *   - React Native: swap `baseUrl` to point at the shared API server.
 *   - Flutter: create an equivalent Dart HttpClient wrapping the same endpoints.
 */

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
  ok: boolean;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(base: string, path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, params, headers: extraHeaders, ...rest } = options;

    const url = buildUrl(this.baseUrl, path, params);

    const headers: HeadersInit = {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...extraHeaders,
    };

    const response = await fetch(url, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data: T;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok) {
      throw new ApiError(response.status, `API error ${response.status}`, data);
    }

    return { data, status: response.status, ok: response.ok };
  }

  get<T>(path: string, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: 'DELETE', body });
  }
}

/**
 * Default singleton API client for the AIXENTRA web app.
 * Points to the same origin (Next.js API routes).
 * For React Native / Flutter, instantiate a new ApiClient with the remote URL.
 */
export const apiClient = new ApiClient(
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
);
