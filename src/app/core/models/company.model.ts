export interface Company {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  code: string;
}

export interface UpdateCompanyPayload {
  name: string;
  isActive: boolean;
}

export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  username: string;
  isActive: boolean;
}

export interface CreateCompanyUserPayload {
  name: string;
  email: string;
  department: string;
  role: 'company_admin' | 'company_viewer';
  username: string;
  password: string;
}
