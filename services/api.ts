// app/services/api.ts
import { API_BASE_URL } from "../utils/config";
import * as SecureStore from "expo-secure-store";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function authHeaders() {
  const token = await SecureStore.getItemAsync("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T>(
  path: string,
  method: Method,
  body?: any,
  token?: string
): Promise<T> {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : await authHeaders();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || "Request failed";
    throw new Error(msg);
  }
  return data as T;
}

// Session APIs
export async function startSession(payload: any) {
  return request("/sessions", "POST", payload);
}

export async function sendMessage(payload: any) {
  return request("/messages", "POST", payload);
}
