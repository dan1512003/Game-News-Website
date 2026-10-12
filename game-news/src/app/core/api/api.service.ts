
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'http://localhost:3001';

  get<T>(
    endpoint: string,
    params?: HttpParams,
  ): Observable<T> {
    return this.http.get<T>(
      `${this.API_URL}${endpoint}`,
      { params },
    );
  }

  post<T>(
    endpoint: string,
    body: unknown,
  ): Observable<T> {
    return this.http.post<T>(
      `${this.API_URL}${endpoint}`,
      body,
    );
  }

  patch<T>(
    endpoint: string,
    body: unknown,
  ): Observable<T> {
    return this.http.patch<T>(
      `${this.API_URL}${endpoint}`,
      body,
    );
  }

  put<T>(
    endpoint: string,
    body: unknown,
  ): Observable<T> {
    return this.http.put<T>(
      `${this.API_URL}${endpoint}`,
      body,
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(
      `${this.API_URL}${endpoint}`,
    );
  }
}
