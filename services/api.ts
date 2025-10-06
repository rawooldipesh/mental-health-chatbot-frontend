// app/services/api.ts
import { API_BASE_URL } from "../utils/config";
import { storage } from "../utils/storage";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/* ---------- Auth header helper ---------- */
async function authHeaders() {
  const token = await storage.getItemAsync("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


/* ---------- Core request helper ---------- */
export async function request<T>(
  path: string,
  method: Method,
  body?: any,
  tokenOverride?: string
): Promise<T> {
  const headers = tokenOverride
    ? { "Content-Type": "application/json", Authorization: `Bearer ${tokenOverride}` }
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

/* ---------- Types that match backend ---------- */
export type MoodScores = {
  depression?: number;
  stress?: number;
  anxiety?: number;
};

export type Session = {
  _id: string;
  user: string;
  startedAt: string;
  endedAt?: string | null;
  initialScores?: MoodScores;
  finalScores?: MoodScores;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  _id: string;
  session: string;
  user: string;
  role: "user" | "assistant" | "system";
  content: string;
  sentiment?: "pos" | "neu" | "neg";
  categories?: string[];
  scores?: MoodScores;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Small response normalizer ---------- */
function unwrap<T>(data: any, key: string): T {
  // supports both { success, [key]: ... } and raw payloads
  if (data && typeof data === "object" && key in data) return data[key] as T;
  return data as T;
}

/* ---------- Sessions API ---------- */
export async function startSession(payload?: {
  initialScores?: MoodScores;
  tags?: string[];
  notes?: string;
}): Promise<Session> {
  const data = await request<any>("/sessions", "POST", payload || {});
  return unwrap<Session>(data, "session");
}

export async function listSessions(): Promise<Session[]> {
  const data = await request<any>("/sessions", "GET");
  return unwrap<Session[]>(data, "sessions");
}

export async function endSession(
  sessionId: string,
  finalScores: MoodScores
): Promise<Session> {
  const data = await request<any>(`/sessions/${sessionId}/end`, "PATCH", { finalScores });
  return unwrap<Session>(data, "session");
}

/* ---------- Messages (history) API ---------- */
export async function getMessages(sessionId: string): Promise<Message[]> {
  const data = await request<any>(`/messages?sessionId=${encodeURIComponent(sessionId)}`, "GET");
  return unwrap<Message[]>(data, "messages"); // or raw array
}

/* ---------- Chat API (stores both sides) ---------- */
export async function sendChat(payload: {
  sessionId: string;
  message: string;
}): Promise<{ reply: string }> {
  // backend returns { reply }
  return request<{ reply: string }>("/chat/send", "POST", payload);
}

/* ---------- Optional: create message manually (rarely needed now) ---------- */
// Kept for flexibility; chat/send already stores user+assistant automatically.
export async function createMessage(payload: {
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  categories?: string[];
  scores?: MoodScores;
  sentiment?: "pos" | "neu" | "neg";
}): Promise<Message> {
  return request<Message>("/messages", "POST", payload);
}
