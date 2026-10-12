import {
  ApiErrorResponse,
  LoginUser,
  RegisterResponse,
} from '../../shared/models/auth/auth.model';


// =====================================================
// AUTH STATE
// =====================================================

export interface AuthState {

  // -----------------------------------------------
  // GLOBAL
  // -----------------------------------------------

  loading: boolean;

  // -----------------------------------------------
  // AUTH INITIALIZATION
  // -----------------------------------------------

  /*
   * false:
   * Angular chưa kiểm tra session.
   *
   * true:
   * Đã kiểm tra refresh session xong.
   */
  initialized: boolean;

  // -----------------------------------------------
  // AUTHENTICATED USER
  // -----------------------------------------------

  user: LoginUser | null;

  accessToken: string | null;

  isAuthenticated: boolean;

  // -----------------------------------------------
  // REGISTER
  // -----------------------------------------------

  registerSuccess: boolean;

  registerResponse: RegisterResponse | null;

  // -----------------------------------------------
  // LOGIN
  // -----------------------------------------------

  loginSuccess: boolean;

  // -----------------------------------------------
  // LOGOUT
  // -----------------------------------------------

  logoutSuccess: boolean;

  // -----------------------------------------------
  // ERROR
  // -----------------------------------------------

  error: ApiErrorResponse | null;
}


// =====================================================
// INITIAL STATE
// =====================================================

export const initialAuthState: AuthState = {

  loading: false,

  initialized: false,

  user: null,

  accessToken: null,

  isAuthenticated: false,

  registerSuccess: false,

  registerResponse: null,

  loginSuccess: false,

  logoutSuccess: false,

  error: null,

};