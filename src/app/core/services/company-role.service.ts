import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyRole, CreateCompanyRolePayload, UpdateCompanyRolePayload } from '../models/company-role.model';

@Injectable({ providedIn: 'root' })
export class CompanyRoleService {
  private readonly baseUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getRoles(companyId: number): Observable<CompanyRole[]> {
    return this.http.get<CompanyRole[]>(`${this.baseUrl}/${companyId}/roles`);
  }

  createRole(companyId: number, payload: CreateCompanyRolePayload): Observable<CompanyRole> {
    return this.http.post<CompanyRole>(`${this.baseUrl}/${companyId}/roles`, payload);
  }

  updateRole(companyId: number, roleId: number, payload: UpdateCompanyRolePayload): Observable<CompanyRole> {
    return this.http.put<CompanyRole>(`${this.baseUrl}/${companyId}/roles/${roleId}`, payload);
  }

  deleteRole(companyId: number, roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${companyId}/roles/${roleId}`);
  }
}
