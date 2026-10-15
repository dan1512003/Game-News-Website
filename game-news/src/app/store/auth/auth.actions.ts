
import {
  createAction,
  props,
} from '@ngrx/store';

import {
  ApiErrorResponse,

  LoginRequest,
  LoginResponse,

  LogoutResponse,

  RefreshResponse,

  RegisterRequest,
  RegisterResponse,

  UserLogin,

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
} from '../../shared/models/auth/auth.model';


// =====================================================
// REGISTER
// =====================================================

export const register = createAction(
  '[Auth] Register',

  props<{
    data: RegisterRequest;
  }>(),
);

export const registerSuccess = createAction(
  '[Auth] Register Success',

  props<{
    response: RegisterResponse;
  }>(),
);

export const registerFailure = createAction(
  '[Auth] Register Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// LOGIN
// =====================================================

export const login = createAction(
  '[Auth] Login',

  props<{
    data: LoginRequest;
  }>(),
);

export const loginSuccess = createAction(
  '[Auth] Login Success',

  props<{
    response: LoginResponse;
  }>(),
);

export const loginFailure = createAction(
  '[Auth] Login Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// REFRESH
// =====================================================

export const refresh = createAction(
  '[Auth] Refresh',
);

export const refreshSuccess = createAction(
  '[Auth] Refresh Success',

  props<{
    response: RefreshResponse;
  }>(),
);

export const refreshFailure = createAction(
  '[Auth] Refresh Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// LOGOUT
// =====================================================

export const logout = createAction(
  '[Auth] Logout',
);

export const logoutSuccess = createAction(
  '[Auth] Logout Success',

  props<{
    response: LogoutResponse;
  }>(),
);

export const logoutFailure = createAction(
  '[Auth] Logout Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// INITIALIZE / RESET
// =====================================================

export const authInitialized = createAction(
  '[Auth] Initialized',
);

export const resetAuth = createAction(
  '[Auth] Reset Auth',
);


// =====================================================
// GET CURRENT USER
// =====================================================

export const getMe = createAction(
  '[Auth] Get Me',
);

export const getMeSuccess = createAction(
  '[Auth] Get Me Success',

  props<{
    user: UserLogin;
  }>(),
);

export const getMeFailure = createAction(
  '[Auth] Get Me Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// CLEAR FLAGS / ERROR
// =====================================================

export const clearLogin = createAction(
  '[Auth] Clear Login',
);

export const clearRegister = createAction(
  '[Auth] Clear Register',
);

export const clearAuthError = createAction(
  '[Auth] Clear Auth Error',
);


// =====================================================
// UPDATE USERNAME
// =====================================================

export const updateUsername = createAction(
  '[Auth] Update Username',

  props<{
    data: UpdateUsernameRequest;
  }>(),
);

export const updateUsernameSuccess = createAction(
  '[Auth] Update Username Success',

  props<{
    response: UpdateUsernameResponse;
  }>(),
);

export const updateUsernameFailure = createAction(
  '[Auth] Update Username Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = createAction(
  '[Auth] Change Password',

  props<{
    data: ChangePasswordRequest;
  }>(),
);

export const changePasswordSuccess = createAction(
  '[Auth] Change Password Success',

  props<{
    response: ChangePasswordResponse;
  }>(),
);

export const changePasswordFailure = createAction(
  '[Auth] Change Password Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// SEND EMAIL RESET OTP
// =====================================================

export const sendEmailResetOtp = createAction(
  '[Auth] Send Email Reset OTP',

  props<{
    data: SendEmailResetOtpRequest;
  }>(),
);

export const sendEmailResetOtpSuccess = createAction(
  '[Auth] Send Email Reset OTP Success',

  props<{
    response: SendEmailResetOtpResponse;
  }>(),
);

export const sendEmailResetOtpFailure = createAction(
  '[Auth] Send Email Reset OTP Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// RESET EMAIL
// =====================================================

export const resetEmail = createAction(
  '[Auth] Reset Email',

  props<{
    data: ResetEmailRequest;
  }>(),
);

export const resetEmailSuccess = createAction(
  '[Auth] Reset Email Success',

  props<{
    response: ResetEmailResponse;
  }>(),
);

export const resetEmailFailure = createAction(
  '[Auth] Reset Email Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// REQUEST PASSWORD RESET
// =====================================================

export const requestPasswordReset = createAction(
  '[Auth] Request Password Reset',

  props<{
    data: RequestPasswordResetRequest;
  }>(),
);

export const requestPasswordResetSuccess = createAction(
  '[Auth] Request Password Reset Success',

  props<{
    response: RequestPasswordResetResponse;
  }>(),
);

export const requestPasswordResetFailure = createAction(
  '[Auth] Request Password Reset Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

export const verifyPasswordResetOtp = createAction(
  '[Auth] Verify Password Reset OTP',

  props<{
    data: VerifyPasswordResetOtpRequest;
  }>(),
);

export const verifyPasswordResetOtpSuccess = createAction(
  '[Auth] Verify Password Reset OTP Success',

  props<{
    response: VerifyPasswordResetOtpResponse;
  }>(),
);

export const verifyPasswordResetOtpFailure = createAction(
  '[Auth] Verify Password Reset OTP Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);


// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = createAction(
  '[Auth] Reset Password',

  props<{
    data: ResetPasswordRequest;
  }>(),
);

export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success',

  props<{
    response: ResetPasswordResponse;
  }>(),
);

export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',

  props<{
    error: ApiErrorResponse;
  }>(),
);
