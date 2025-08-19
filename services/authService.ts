// app/services/authService.ts
import { request } from "./api";

type LoginBody = { email: string; password: string };
type RegisterBody = { name?: string; email: string; password: string };

export interface LoginResponse {
  token: string;
  user?: { id: string; email: string };
}

export async function login(payload: LoginBody) {
  return request<LoginResponse>("/auth/login", "POST", payload);
}

export async function register(payload: RegisterBody) {
  return request<{ id: string; email: string }>("/auth/register", "POST", payload);
}
