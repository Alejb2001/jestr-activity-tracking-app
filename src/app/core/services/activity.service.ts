import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Activity, ActivityQueryParams, CreateActivityPayload,
  PagedResult, UpdateActivityPayload
} from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly baseUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getAll(params: ActivityQueryParams = {}): Observable<PagedResult<Activity>> {
    let httpParams = new HttpParams();
    if (params.status != null)       httpParams = httpParams.set('status', params.status.toString());
    if (params.assignedUserId)       httpParams = httpParams.set('assignedUserId', params.assignedUserId);
    if (params.startDate)            httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate)              httpParams = httpParams.set('endDate', params.endDate);
    if (params.page != null)         httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null)     httpParams = httpParams.set('pageSize', params.pageSize.toString());
    return this.http.get<PagedResult<Activity>>(this.baseUrl, { params: httpParams });
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
