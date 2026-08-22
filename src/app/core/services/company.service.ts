import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Company, CompanyUser,
  CreateCompanyPayload, CreateCompanyUserPayload, UpdateCompanyPayload
} from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly baseUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl);
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateCompanyPayload): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateCompanyPayload): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, payload);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getUsers(companyId: number): Observable<CompanyUser[]> {
    return this.http.get<CompanyUser[]>(`${this.baseUrl}/${companyId}/users`);
  }

  createUser(companyId: number, payload: CreateCompanyUserPayload): Observable<CompanyUser> {
    return this.http.post<CompanyUser>(`${this.baseUrl}/${companyId}/users`, payload);
  }

  deactivateUser(companyId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${companyId}/users/${userId}`);
  }
}
