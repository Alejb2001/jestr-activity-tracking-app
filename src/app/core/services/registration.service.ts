import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateRegistrationPayload, Registration } from '../models/registration.model';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly baseUrl = `${environment.apiUrl}/registrations`;

  constructor(private http: HttpClient) {}

  submit(payload: CreateRegistrationPayload): Observable<Registration> {
    return this.http.post<Registration>(this.baseUrl, payload);
  }

  getAll(status?: string): Observable<Registration[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Registration[]>(this.baseUrl, { params });
  }

  approve(id: number): Observable<Registration> {
    return this.http.post<Registration>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: number, reason: string): Observable<Registration> {
    return this.http.post<Registration>(`${this.baseUrl}/${id}/reject`, { reason });
  }
}
