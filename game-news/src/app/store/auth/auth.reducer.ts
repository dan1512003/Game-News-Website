import {
  createReducer,
  on,
} from '@ngrx/store';

import * as AuthActions
  from './auth.actions';

import {
  initialAuthState,
} from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // =====================================================
  // REGISTER
  // =====================================================

  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    registerSuccess: false,
    registerResponse: null,
    error: null,
  })),

  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    registerSuccess: true,
    registerResponse: response,
    error: null,
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    registerSuccess: false,
    registerResponse: null,
    error,
  })),

  // =====================================================
  // LOGIN
  // =====================================================

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    loginSuccess: false,
    logoutSuccess: false,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    loginSuccess: true,
    user: response.data.user,
    accessToken: response.data.accessToken,
    isAuthenticated: true,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loginSuccess: false,
    user: null,
    accessToken: null,
    isAuthenticated: false,
    error,
  })),
on(AuthActions.authInitialized, (state) => ({
  ...state,
  initialized: true,
})),
  // =====================================================
  // REFRESH START
  // =====================================================

  on(AuthActions.refresh, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // =====================================================
  // REFRESH SUCCESS
  // =====================================================

  on(AuthActions.refreshSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    initialized: true,
    user: response.data.user,
    accessToken: response.data.accessToken,
    isAuthenticated: true,
    error: null,
  })),

  // =====================================================
  // REFRESH FAILURE
  // =====================================================

  on(AuthActions.refreshFailure, (state, { error }) => ({
    ...state,
    loading: false,
    initialized: true,
    user: null,
    accessToken: null,
    isAuthenticated: false,
    error,
  })),

  // =====================================================
  // LOGOUT
  // =====================================================

  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
    logoutSuccess: false,
    error: null,
  })),

  on(AuthActions.logoutSuccess, (state) => ({
    ...state,
    loading: false,
    user: null,
    accessToken: null,
    isAuthenticated: false,
    logoutSuccess: true,
    loginSuccess: false,
    error: null,
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    user: null,
    accessToken: null,
    isAuthenticated: false,
    logoutSuccess: false,
    error,
  })),

  // =====================================================
  // CLEAR LOGIN
  // =====================================================

  on(AuthActions.clearLogin, (state) => ({
    ...state,
    loading: false,
    loginSuccess: false,
    error: null,
  })),

  // =====================================================
  // CLEAR REGISTER
  // =====================================================

  on(AuthActions.clearRegister, (state) => ({
    ...state,
    loading: false,
    registerSuccess: false,
    registerResponse: null,
    error: null,
  })),

  // =====================================================
  // CLEAR AUTH ERROR
  // =====================================================

  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  })),
);