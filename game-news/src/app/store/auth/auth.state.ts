import {
  ApiErrorResponse,
  RegisterResponse,
  UserLogin,
} from '../../shared/models/auth/auth.model';

export interface AuthState {
  loading: boolean;
  initialized: boolean;

  user: UserLogin | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  registerSuccess: boolean;
  registerResponse: RegisterResponse | null;
  loginSuccess: boolean;
  logoutSuccess: boolean;

  updateUsernameSuccess: boolean;
  changePasswordSuccess: boolean;

  sendEmailResetOtpSuccess: boolean;
  resetEmailSuccess: boolean;
  emailResetSessionId: string | null;

  requestPasswordResetSuccess: boolean;
  verifyPasswordResetOtpSuccess: boolean;
  resetPasswordSuccess: boolean;
  passwordResetSessionId: string | null;

  error: ApiErrorResponse | null;
}

export function getSavedUser(): UserLogin | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedUser = sessionStorage.getItem('auth_user');

    if (!savedUser) {
      return null;
    }

    return JSON.parse(savedUser) as UserLogin;
  } catch (error) {
    console.error('[getSavedUser] Lỗi đọc user:', error);
    return null;
  }
}
export const initialAuthState: AuthState = {
  loading: false,
  initialized: false,

  // Khôi phục user tạm thời để hiển thị username sau F5
  user: getSavedUser(),
  accessToken: null,
  isAuthenticated: false,

  registerSuccess: false,
  registerResponse: null,
  loginSuccess: false,
  logoutSuccess: false,

  updateUsernameSuccess: false,
  changePasswordSuccess: false,

  sendEmailResetOtpSuccess: false,
  resetEmailSuccess: false,
  emailResetSessionId: null,

  requestPasswordResetSuccess: false,
  verifyPasswordResetOtpSuccess: false,
  resetPasswordSuccess: false,
  passwordResetSessionId: null,

  error: null,
};