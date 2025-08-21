// app/services/chatService.ts
import { request } from "./api";

export interface Message {
  sender: "user" | "bot";
  text: string;
  createdAt?: string; // optional since backend returns timestamps
}
export interface Session {
  _id: string;
  user: string;
  startedAt: string;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
// Start a new chat session
export async function startSession() {
  return request<{ sessionId: string }>("/sessions", "POST");
}

// End an existing session
export async function endSession(sessionId: string) {
  return request(`/sessions/${sessionId}/end`, "PATCH",  { finalScores: {} });
}

// Send a message in a session
export async function sendMessage(sessionId: string, message: string) {
  return request<{ reply: string }>("/chat/send", "POST", { sessionId, message });
}

// Fetch chat history for a session (matches backend route /chat/history/:sessionId)
export async function fetchHistory(sessionId: string) {
  return request<Message[]>(`/chat/history/${sessionId}`, "GET");
}

// List sessions (new)
export async function listSessions() {
  return request<Session[]>("/sessions", "GET");
}
