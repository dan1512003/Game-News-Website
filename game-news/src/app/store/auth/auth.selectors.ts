import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import {
  AuthState,
} from './auth.state';


// =====================================================
// AUTH STATE
// =====================================================

export const selectAuthState =
  createFeatureSelector<AuthState>(
    'auth',
  );


// =====================================================
// LOADING
// =====================================================

export const selectLoading =
  createSelector(

    selectAuthState,

    (state) =>
      state.loading,

  );
export const selectAuthInitialized = createSelector(
  selectAuthState,
  (state) => state.initialized,
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


// =====================================================
// ACCESS TOKEN
// =====================================================

export const selectAccessToken =
  createSelector(

    selectAuthState,

    (state) =>
      state.accessToken,

  );


// =====================================================
// AUTHENTICATED
// =====================================================

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


// =====================================================
// ERROR MESSAGE
// =====================================================

export const selectAuthErrorMessage =
  createSelector(

    selectAuthState,

    (state) =>
      state.error?.message ?? null,

  );


// =====================================================
// FIELD ERRORS
// =====================================================

export const selectAuthFieldErrors =
  createSelector(

    selectAuthState,

    (state) =>
      state.error?.errors ?? [],

  );


// =====================================================
// REGISTER ERRORS
// =====================================================

export const selectRegisterErrors =
  createSelector(

    selectAuthState,

    (state) =>
      state.error?.errors ?? [],

  );


// =====================================================
// LOGIN ERRORS
// =====================================================

export const selectLoginErrors =
  createSelector(

    selectAuthState,

    (state) =>
      state.error?.errors ?? [],

  );