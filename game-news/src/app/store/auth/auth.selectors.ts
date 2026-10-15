
import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import {
  AuthState,
} from './auth.state';


export const selectAuthState =
  createFeatureSelector<AuthState>(
    'auth',
  );


// =====================================================
// GENERAL
// =====================================================

export const selectLoading =
  createSelector(
    selectAuthState,
    (state) =>
      state.loading,
  );


export const selectAuthInitialized =
  createSelector(
    selectAuthState,
    (state) =>
      state.initialized,
  );


// =====================================================
// USER
// =====================================================

export const selectAuthUser =
  createSelector(
    selectAuthState,
    (state) =>
      state.user,
  );


export const selectAccessToken =
  createSelector(
    selectAuthState,
    (state) =>
      state.accessToken,
  );


export const selectIsAuthenticated =
  createSelector(
    selectAuthState,
    (state) =>
      state.isAuthenticated,
  );


// =====================================================
// LOGIN
// =====================================================

export const selectLoginSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.loginSuccess,
  );


// =====================================================
// REGISTER
// =====================================================

export const selectRegisterSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.registerSuccess,
  );


export const selectRegisterResponse =
  createSelector(
    selectAuthState,
    (state) =>
      state.registerResponse,
  );


// =====================================================
// LOGOUT
// =====================================================

export const selectLogoutSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.logoutSuccess,
  );


// =====================================================
// ERROR
// =====================================================

export const selectAuthError =
  createSelector(
    selectAuthState,
    (state) =>
      state.error,
  );


export const selectAuthErrorMessage =
  createSelector(
    selectAuthState,
    (state) =>
      state.error?.message ?? null,
  );


export const selectAuthFieldErrors =
  createSelector(
    selectAuthState,
    (state) =>
      state.error?.errors ?? [],
  );


// =====================================================
// ACCOUNT OPERATIONS
// =====================================================

export const selectUpdateUsernameSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.updateUsernameSuccess,
  );


export const selectChangePasswordSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.changePasswordSuccess,
  );


// =====================================================
// EMAIL RESET
// =====================================================

export const selectSendEmailResetOtpSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.sendEmailResetOtpSuccess,
  );


export const selectResetEmailSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.resetEmailSuccess,
  );


export const selectEmailResetSessionId =
  createSelector(
    selectAuthState,
    (state) =>
      state.emailResetSessionId,
  );


// =====================================================
// PASSWORD RESET
// =====================================================

export const selectRequestPasswordResetSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.requestPasswordResetSuccess,
  );


export const selectVerifyPasswordResetOtpSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.verifyPasswordResetOtpSuccess,
  );


export const selectResetPasswordSuccess =
  createSelector(
    selectAuthState,
    (state) =>
      state.resetPasswordSuccess,
  );


export const selectPasswordResetSessionId =
  createSelector(
    selectAuthState,
    (state) =>
      state.passwordResetSessionId,
  );
