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

  UpdateUsernameRequest,
  UpdateUsernameResponse,

  ChangePasswordRequest,
  ChangePasswordResponse,

  SendEmailResetOtpRequest,
  SendEmailResetOtpResponse,

  ResetEmailRequest,
  ResetEmailResponse,

  RequestPasswordResetRequest,
  RequestPasswordResetResponse,

  VerifyPasswordResetOtpRequest,
  VerifyPasswordResetOtpResponse,

  ResetPasswordRequest,
  ResetPasswordResponse,
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


  // ========================================
  // GET CURRENT USER
  // GET /auth/me
  // ========================================

  getMe(): Observable<GetMeResponse> {

    return this.http.get<GetMeResponse>(
      `${this.API_URL}/me`,
    );
  }


  // ========================================
  // UPDATE USERNAME
  // PATCH /auth/username
  // ========================================

  updateUsername(
    data: UpdateUsernameRequest,
  ): Observable<UpdateUsernameResponse> {

    return this.http.patch<UpdateUsernameResponse>(
      `${this.API_URL}/username`,
      data,
      {
        withCredentials: true,
      },
    );
  }


  // ========================================
  // CHANGE PASSWORD
  // PATCH /auth/password
  // ========================================

  changePassword(
    data: ChangePasswordRequest,
  ): Observable<ChangePasswordResponse> {

    return this.http.patch<ChangePasswordResponse>(
      `${this.API_URL}/password`,
      data,
      {
        withCredentials: true,
      },
    );
  }


  // ========================================
  // SEND OTP TO NEW EMAIL
  // POST /auth/email-reset/send-otp
  // ========================================

  sendEmailResetOtp(
    data: SendEmailResetOtpRequest,
  ): Observable<SendEmailResetOtpResponse> {

    return this.http.post<SendEmailResetOtpResponse>(
      `${this.API_URL}/email-reset/send-otp`,
      data,
      {
        withCredentials: true,
      },
    );
  }


  // ========================================
  // VERIFY OTP AND CHANGE EMAIL
  // POST /auth/email-reset/verify
  // ========================================

  resetEmail(
    data: ResetEmailRequest,
  ): Observable<ResetEmailResponse> {

    return this.http.post<ResetEmailResponse>(
      `${this.API_URL}/email-reset/verify`,
      data,
      {
        withCredentials: true,
      },
    );
  }


  // ========================================
  // REQUEST PASSWORD RESET
  // POST /auth/password-reset/request
  // ========================================

  requestPasswordReset(
    data: RequestPasswordResetRequest,
  ): Observable<RequestPasswordResetResponse> {

    return this.http.post<RequestPasswordResetResponse>(
      `${this.API_URL}/password-reset/request`,
      data,
    );
  }


  // ========================================
  // VERIFY PASSWORD RESET OTP
  // POST /auth/password-reset/verify
  // ========================================

  verifyPasswordResetOtp(
    data: VerifyPasswordResetOtpRequest,
  ): Observable<VerifyPasswordResetOtpResponse> {

    return this.http.post<VerifyPasswordResetOtpResponse>(
      `${this.API_URL}/password-reset/verify`,
      data,
          {
      withCredentials: true,
    },

    );
  }


  // ========================================
  // RESET PASSWORD
  // POST /auth/password-reset/reset
  // ========================================

  resetPassword(
    data: ResetPasswordRequest,
  ): Observable<ResetPasswordResponse> {

    return this.http.post<ResetPasswordResponse>(
      `${this.API_URL}/password-reset/reset`,
      data,
          {
      withCredentials: true,
    },

    );
  }

}