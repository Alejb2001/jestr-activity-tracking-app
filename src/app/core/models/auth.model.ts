export interface LoginPayload {
  username: string;
  password: string;
  companyCode?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  name?: string;
  role: string;
  companyId?: number;
  companyName?: string;
  expiresAt: string;
}
