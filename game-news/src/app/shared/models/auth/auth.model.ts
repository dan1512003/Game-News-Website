// ============================================================
// GENERIC API RESPONSE
// ============================================================

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiFieldError {
  field: string;
  messages: string[];
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
  path: string;
}


// ============================================================
// USER MODEL
// ============================================================

export interface UserLogin {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
}


// ============================================================
// AUTH REQUESTS
// ============================================================

// Đăng ký
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
}


// Đăng nhập
export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}


// ============================================================
// USER REQUESTS
// ============================================================

// Cập nhật username
export interface UpdateUsernameRequest {
  userId: string;
  username: string;
}


// Đổi mật khẩu khi đã đăng nhập
export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}


// ============================================================
// EMAIL RESET REQUESTS
// ============================================================

// Gửi OTP đổi email
export interface SendEmailResetOtpRequest {
  email: string;
  emailNew: string;
}


// Xác nhận OTP và đổi email
export interface ResetEmailRequest {
  email: string;
  newEmail: string;
  otp: string;
  sessionId: string;
}


// ============================================================
// PASSWORD RESET REQUESTS
// ============================================================

// Yêu cầu gửi OTP đặt lại mật khẩu
export interface RequestPasswordResetRequest {
  email: string;
}


// Xác minh OTP đặt lại mật khẩu
export interface VerifyPasswordResetOtpRequest {
  email: string;
  otp: string;
  sessionId: string;
}


// Đặt lại mật khẩu
export interface ResetPasswordRequest {
  email: string;
  sessionId: string;
  newPassword: string;
  confirmPassword: string;
}


// ============================================================
// RESPONSE DATA
// ============================================================

// Response thông thường
export interface MessageResponseData {
  message: string;
  expiresIn?: number;
}


// Response tạo session
export interface SessionResponseData {
  sessionId: string;
  message: string;
  expiresIn?: number;
}


// ============================================================
// PASSWORD RESET OTP RESPONSE
// ============================================================

export interface VerifyPasswordResetOtpData {
  resetToken: string | null;
  expireResetTokenAt: string | null;
  message: string;
}


// ============================================================
// LOGIN / REGISTER RESPONSES
// ============================================================

export interface LoginResponseData {
  user: UserLogin;
  accessToken: string;
}


// ============================================================
// LOGOUT
// ============================================================

export interface LogoutResponseData {
  message: string;
}


// ============================================================
// GET ME
// ============================================================

export interface GetMeResponseData {
  user: UserLogin;
}


// ============================================================
// REFRESH
// ============================================================

export interface RefreshResponseData {
  user: UserLogin;
  accessToken: string;
}


// ============================================================
// USER RESPONSE
// ============================================================

export interface UserResponseData {
  user: UserLogin;
  message?: string;
}


// ============================================================
// AUTH API RESPONSES
// ============================================================

export type RegisterResponse =
  ApiResponse<UserLogin>;

export type LoginResponse =
  ApiResponse<LoginResponseData>;

export type GetMeResponse =
  ApiResponse<GetMeResponseData>;

export type RefreshResponse =
  ApiResponse<RefreshResponseData>;

export type LogoutResponse =
  ApiResponse<LogoutResponseData>;


// ============================================================
// USER API RESPONSES
// ============================================================

export type UpdateUsernameResponse =
  ApiResponse<UserResponseData>;

export type ChangePasswordResponse =
  ApiResponse<
    MessageResponseData | UserResponseData
  >;


// ============================================================
// EMAIL RESET API RESPONSES
// ============================================================

export type SendEmailResetOtpResponse =
  ApiResponse<SessionResponseData>;

export type ResetEmailResponse =
  ApiResponse<UserResponseData>;


// ============================================================
// PASSWORD RESET API RESPONSES
// ============================================================

export type RequestPasswordResetResponse =
  ApiResponse<SessionResponseData>;

export type VerifyPasswordResetOtpResponse =
  ApiResponse<VerifyPasswordResetOtpData>;

export type ResetPasswordResponse =
  ApiResponse<MessageResponseData>;