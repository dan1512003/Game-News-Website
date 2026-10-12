// ========================================
// GENERIC API RESPONSE
// ========================================

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}


// ========================================
// API ERROR
// ========================================

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


// ========================================
// REGISTER REQUEST
// ========================================

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
}


// ========================================
// REGISTER USER
// ========================================

export interface RegisterUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
}


// ========================================
// REGISTER RESPONSE
// ========================================

export type RegisterResponse =
  ApiResponse<RegisterUser>;


// ========================================
// LOGIN REQUEST
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}


// ========================================
// LOGIN USER
// ========================================

export interface LoginUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
}


// ========================================
// LOGIN RESPONSE DATA
// ========================================

export interface LoginResponseData {
  user: LoginUser;

  /**
   * Access token được frontend giữ trong memory.
   *
   * Không lưu localStorage.
   * Không lưu sessionStorage.
   */
  accessToken: string;
}

export interface CurrentUser {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

// ========================================
// GET ME RESPONSE DATA
// ========================================

export interface GetMeResponseData {
  user: CurrentUser;
}

// ========================================
// GET ME RESPONSE
// ========================================

export type GetMeResponse =
  ApiResponse<GetMeResponseData>;
// ========================================
// LOGIN RESPONSE
// ========================================

export type LoginResponse =
  ApiResponse<LoginResponseData>;


// ========================================
// REFRESH RESPONSE
// ========================================

export interface RefreshResponseData {
  user: LoginUser;
  accessToken: string;
}


export type RefreshResponse =
  ApiResponse<RefreshResponseData>;


// ========================================
// LOGOUT RESPONSE
// ========================================

export interface LogoutResponseData {
  message: string;
}


export type LogoutResponse =
  ApiResponse<LogoutResponseData>;