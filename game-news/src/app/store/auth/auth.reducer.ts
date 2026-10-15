
import {
  createReducer,
  on,
} from '@ngrx/store';

import * as AuthActions from './auth.actions';

import {
  initialAuthState,
} from './auth.state';


export const authReducer =
  createReducer(

    initialAuthState,


    // =====================================================
    // REGISTER
    // =====================================================

    on(
      AuthActions.register,
      (state) => ({
        ...state,

        loading: true,

        registerSuccess: false,

        registerResponse: null,

        error: null,
      }),
    ),


    on(
      AuthActions.registerSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        registerSuccess: true,

        registerResponse: response,

        error: null,
      }),
    ),


    on(
      AuthActions.registerFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        registerSuccess: false,

        registerResponse: null,

        error,
      }),
    ),


    // =====================================================
    // LOGIN
    // =====================================================

    on(
      AuthActions.login,
      (state) => ({
        ...state,

        loading: true,

        loginSuccess: false,

        logoutSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.loginSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        loginSuccess: true,

        user:
          response.data.user,

        accessToken:
          response.data.accessToken,

        isAuthenticated: true,

        initialized: true,

        error: null,
      }),
    ),


    on(
      AuthActions.loginFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        loginSuccess: false,

        user: null,

        accessToken: null,

        isAuthenticated: false,

        error,
      }),
    ),


    // =====================================================
    // AUTH INITIALIZED
    // =====================================================

    on(
      AuthActions.authInitialized,
      (state) => ({
        ...state,

        initialized: true,
      }),
    ),


    // =====================================================
    // GET CURRENT USER
    // =====================================================

    on(
      AuthActions.getMe,
      (state) => ({
        ...state,

        loading: true,

        error: null,
      }),
    ),


    on(
      AuthActions.getMeSuccess,
      (state, { user }) => ({
        ...state,

        loading: false,

        initialized: true,

        user,

        isAuthenticated: true,

        error: null,
      }),
    ),


    on(
      AuthActions.getMeFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        error,
      }),
    ),


    // =====================================================
    // REFRESH
    // =====================================================

    on(
      AuthActions.refresh,
      (state) => ({
        ...state,

        loading: true,

        error: null,
      }),
    ),


    on(
      AuthActions.refreshSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        initialized: true,

        user:
          response.data.user,

        accessToken:
          response.data.accessToken,

        isAuthenticated: true,

        error: null,
      }),
    ),


    on(
      AuthActions.refreshFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        initialized: true,

        user: null,

        accessToken: null,

        isAuthenticated: false,

        error,
      }),
    ),


    // =====================================================
    // LOGOUT
    // =====================================================

    on(
      AuthActions.logout,
      (state) => ({
        ...state,

        loading: true,

        logoutSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.logoutSuccess,
      (state) => ({
        ...state,

        loading: false,

        user: null,

        accessToken: null,

        isAuthenticated: false,

        logoutSuccess: true,

        loginSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.logoutFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        user: null,

        accessToken: null,

        isAuthenticated: false,

        logoutSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // UPDATE USERNAME
    // =====================================================

    on(
      AuthActions.updateUsername,
      (state) => ({
        ...state,

        loading: true,

        updateUsernameSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.updateUsernameSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        updateUsernameSuccess: true,

        user:
          response.data.user
            ? {
                ...state.user,
                ...response.data.user,
              }
            : state.user,

        error: null,
      }),
    ),


    on(
      AuthActions.updateUsernameFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        updateUsernameSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    on(
      AuthActions.changePassword,
      (state) => ({
        ...state,

        loading: true,

        changePasswordSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.changePasswordSuccess,
      (state) => ({
        ...state,

        loading: false,

        changePasswordSuccess: true,

        error: null,
      }),
    ),


    on(
      AuthActions.changePasswordFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        changePasswordSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // SEND EMAIL RESET OTP
    // =====================================================

    on(
      AuthActions.sendEmailResetOtp,
      (state) => ({
        ...state,

        loading: true,

        sendEmailResetOtpSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.sendEmailResetOtpSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        sendEmailResetOtpSuccess: true,

        emailResetSessionId:
          response.data.sessionId,

        error: null,
      }),
    ),


    on(
      AuthActions.sendEmailResetOtpFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        sendEmailResetOtpSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // RESET EMAIL
    // =====================================================

    on(
      AuthActions.resetEmail,
      (state) => ({
        ...state,

        loading: true,

        resetEmailSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.resetEmailSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        resetEmailSuccess: true,

        emailResetSessionId: null,

        user:
          response.data.user
            ? {
                ...state.user,
                ...response.data.user,
              }
            : state.user,

        error: null,
      }),
    ),


    on(
      AuthActions.resetEmailFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        resetEmailSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // REQUEST PASSWORD RESET
    // =====================================================

    on(
      AuthActions.requestPasswordReset,
      (state) => ({
        ...state,

        loading: true,

        requestPasswordResetSuccess:
          false,

        error: null,
      }),
    ),


    on(
      AuthActions.requestPasswordResetSuccess,
      (state, { response }) => ({
        ...state,

        loading: false,

        requestPasswordResetSuccess:
          true,

        passwordResetSessionId:
          response.data.sessionId,

        error: null,
      }),
    ),


    on(
      AuthActions.requestPasswordResetFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        requestPasswordResetSuccess:
          false,

        error,
      }),
    ),


    // =====================================================
    // VERIFY PASSWORD RESET OTP
    // =====================================================

    on(
      AuthActions.verifyPasswordResetOtp,
      (state) => ({
        ...state,

        loading: true,

        verifyPasswordResetOtpSuccess:
          false,

        error: null,
      }),
    ),


    on(
      AuthActions.verifyPasswordResetOtpSuccess,
      (state) => ({
        ...state,

        loading: false,

        verifyPasswordResetOtpSuccess:
          true,

        error: null,
      }),
    ),


    on(
      AuthActions.verifyPasswordResetOtpFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        verifyPasswordResetOtpSuccess:
          false,

        error,
      }),
    ),


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    on(
      AuthActions.resetPassword,
      (state) => ({
        ...state,

        loading: true,

        resetPasswordSuccess: false,

        error: null,
      }),
    ),


    on(
      AuthActions.resetPasswordSuccess,
      (state) => ({
        ...state,

        loading: false,

        resetPasswordSuccess: true,

        passwordResetSessionId: null,

        error: null,
      }),
    ),


    on(
      AuthActions.resetPasswordFailure,
      (state, { error }) => ({
        ...state,

        loading: false,

        resetPasswordSuccess: false,

        error,
      }),
    ),


    // =====================================================
    // CLEAR LOGIN
    // =====================================================

    on(
      AuthActions.clearLogin,
      (state) => ({
        ...state,

        loading: false,

        loginSuccess: false,

        error: null,
      }),
    ),


    // =====================================================
    // CLEAR REGISTER
    // =====================================================

    on(
      AuthActions.clearRegister,
      (state) => ({
        ...state,

        loading: false,

        registerSuccess: false,

        registerResponse: null,

        error: null,
      }),
    ),


    // =====================================================
    // CLEAR ERROR
    // =====================================================

    on(
      AuthActions.clearAuthError,
      (state) => ({
        ...state,

        error: null,
      }),
    ),


    // =====================================================
    // RESET AUTH
    // =====================================================

    on(
      AuthActions.resetAuth,
      () => ({
        ...initialAuthState,
      }),
    ),
  );
