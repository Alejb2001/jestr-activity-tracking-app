import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity, CreateActivityPayload, UpdateActivityPayload } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly baseUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.baseUrl);
  }

  getById(id: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateActivityPayload): Observable<Activity> {
    return this.http.post<Activity>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateActivityPayload): Observable<Activity> {
    return this.http.put<Activity>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
