const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ReadyResponse {
  status: string;
  checks: {
    postgres: boolean;
    redis: boolean;
    openai: boolean;
    whatsapp: boolean;
  };
  timestamp: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/health"),
  ready: () => request<ReadyResponse>("/health/ready"),
};
