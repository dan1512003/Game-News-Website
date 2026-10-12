import {
  createAction,
  props,
} from '@ngrx/store';

import {
  ApiErrorResponse,
  CurrentUser,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
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
// RESET AUTH
// =====================================================

export const resetAuth = createAction(
  '[Auth] Reset Auth',
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
export const authInitialized = createAction(
  '[Auth] Initialized',
);

// =====================================================
// CLEAR LOGIN
// =====================================================

export const clearLogin = createAction(
  '[Auth] Clear Login',
);


// =====================================================
// CLEAR REGISTER
// =====================================================

export const clearRegister = createAction(
  '[Auth] Clear Register',
);


// =====================================================
// CLEAR ERROR
// =====================================================

export const clearAuthError = createAction(
  '[Auth] Clear Auth Error',
);


// ========================================
// GET CURRENT USER
// ========================================

// Bắt đầu lấy thông tin người dùng hiện tại
export const getMe = createAction(
  '[Auth] Get Me'
);

// Lấy thông tin người dùng thành công
export const getMeSuccess = createAction(
  '[Auth] Get Me Success',
  props<{ user: CurrentUser }>(),
);

// Lấy thông tin người dùng thất bại
export const getMeFailure = createAction(
  '[Auth] Get Me Failure',
  props<{ error?: string }>(),
);