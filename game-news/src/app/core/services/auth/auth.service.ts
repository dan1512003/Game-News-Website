import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  GetMeResponse,
} from '../../../shared/models/auth/auth.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly API_URL =
    'http://localhost:3001/auth';


  constructor(
    private readonly http: HttpClient,
  ) {}


  // ========================================
  // LOGIN
  // ========================================

  login(
    data: LoginRequest,
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.API_URL}/login`,
      data,
      {
        withCredentials: true,
      },
    );

  }


  // ========================================
  // REGISTER
  // ========================================

  register(
    data: RegisterRequest,
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.API_URL}/register`,
      data,
    );

  }


  // ========================================
  // REFRESH
  // ========================================

  refresh(): Observable<RefreshResponse> {

    return this.http.post<RefreshResponse>(
      `${this.API_URL}/refresh`,
      {},
      {
        withCredentials: true,
      },
    );

  }


  // ========================================
  // LOGOUT
  // ========================================

  logout(): Observable<LogoutResponse> {

    return this.http.post<LogoutResponse>(
      `${this.API_URL}/logout`,
      {},
      {
        withCredentials: true,
      },
    );

  }


getMe(): Observable<GetMeResponse> {
  return this.http.get<GetMeResponse>(
    `${this.API_URL}/me`,
  );
}
}