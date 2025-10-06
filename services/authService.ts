// app/services/authService.ts
import { request } from "./api";

type LoginBody = { email: string; password: string };
type RegisterBody = { name: string; email: string; password: string };

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

// ✅ updated: include token (optional in case backend sometimes omits it)
export interface RegisterResponse {
  success: boolean;
  token?: string;
  user: User;
}

export async function login(payload: LoginBody) {
  return request<LoginResponse>("/auth/login", "POST", payload);
}

export async function register(payload: RegisterBody) {
  return request<RegisterResponse>("/auth/register", "POST", payload);
}
