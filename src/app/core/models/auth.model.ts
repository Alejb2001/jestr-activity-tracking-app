export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}
