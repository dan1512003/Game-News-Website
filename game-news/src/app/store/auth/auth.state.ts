
import {
  ApiErrorResponse,
  RegisterResponse,
  UserLogin,
} from '../../shared/models/auth/auth.model';


export interface AuthState {

  loading: boolean;

  initialized: boolean;


  // ==========================================
  // AUTH
  // ==========================================

  user: UserLogin | null;

  accessToken: string | null;

  isAuthenticated: boolean;


  // ==========================================
  // AUTH FLAGS
  // ==========================================

  registerSuccess: boolean;

  registerResponse:
    RegisterResponse | null;

  loginSuccess: boolean;

  logoutSuccess: boolean;


  // ==========================================
  // ACCOUNT OPERATIONS
  // ==========================================

  updateUsernameSuccess: boolean;

  changePasswordSuccess: boolean;


  // ==========================================
  // EMAIL RESET
  // ==========================================

  sendEmailResetOtpSuccess: boolean;

  resetEmailSuccess: boolean;

  emailResetSessionId: string | null;


  // ==========================================
  // PASSWORD RESET
  // ==========================================

  requestPasswordResetSuccess: boolean;

  verifyPasswordResetOtpSuccess: boolean;

  resetPasswordSuccess: boolean;

  passwordResetSessionId: string | null;


  // ==========================================
  // ERROR
  // ==========================================

  error: ApiErrorResponse | null;
}


export const initialAuthState: AuthState = {

  loading: false,

  initialized: false,


  // ==========================================
  // AUTH
  // ==========================================

  user: null,

  accessToken: null,

  isAuthenticated: false,


  // ==========================================
  // AUTH FLAGS
  // ==========================================

  registerSuccess: false,

  registerResponse: null,

  loginSuccess: false,

  logoutSuccess: false,


  // ==========================================
  // ACCOUNT OPERATIONS
  // ==========================================

  updateUsernameSuccess: false,

  changePasswordSuccess: false,


  // ==========================================
  // EMAIL RESET
  // ==========================================

  sendEmailResetOtpSuccess: false,

  resetEmailSuccess: false,

  emailResetSessionId: null,


  // ==========================================
  // PASSWORD RESET
  // ==========================================

  requestPasswordResetSuccess: false,

  verifyPasswordResetOtpSuccess: false,

  resetPasswordSuccess: false,

  passwordResetSessionId: null,


  // ==========================================
  // ERROR
  // ==========================================

  error: null,
};
