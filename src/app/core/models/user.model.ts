export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  department: string;
}

export interface UpdateUserPayload extends CreateUserPayload {
  isActive: boolean;
}
