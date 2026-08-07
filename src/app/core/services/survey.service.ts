import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Survey, CreateSurveyDto, PaginatedResponse, SurveyAnalytics, LoginRequest, LoginResponse } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitSurvey(data: CreateSurveyDto): Observable<Survey> {
    return this.http.post<Survey>(`${this.apiUrl}/surveys`, data);
  }

  getSurveys(page: number, limit: number, search?: string): Observable<PaginatedResponse<Survey>> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (search) {
      params.search = search;
    }
    return this.http.get<PaginatedResponse<Survey>>(`${this.apiUrl}/surveys`, { params });
  }

  getSurveyById(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/surveys/${id}`);
  }

  getAnalytics(): Observable<SurveyAnalytics> {
    return this.http.get<SurveyAnalytics>(`${this.apiUrl}/surveys/analytics/summary`);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, {
      token,
      newPassword,
    });
  }
}