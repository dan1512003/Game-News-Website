import {
  Injectable,
  inject,
} from '@angular/core';

import {
  Router,
} from '@angular/router';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  Store,
} from '@ngrx/store';

import {
  catchError,
  exhaustMap,
  map,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';

import * as AuthActions from './auth.actions';

import {
  AuthService,
} from '../../core/services/auth/auth.service';

import {
  ApiErrorResponse,
} from '../../shared/models/auth/auth.model';

import {
  selectAccessToken,
} from './auth.selectors';


// =====================================================
// CONVERT API ERROR
// =====================================================

function toApiError(
  error: HttpErrorResponse,
): ApiErrorResponse {
  const body = error.error;

  if (
    body &&
    typeof body === 'object' &&
    typeof body.statusCode === 'number' &&
    typeof body.message === 'string'
  ) {
    return body as ApiErrorResponse;
  }

  return {
    statusCode: error.status || 500,

    message:
      typeof body?.message === 'string'
        ? body.message
        : error.message ||
          'Đã xảy ra lỗi. Vui lòng thử lại.',

    timestamp:
      new Date().toISOString(),

    path: '',
  };
}


// =====================================================
// AUTH EFFECTS
// =====================================================

@Injectable()
export class AuthEffects {

  private readonly actions$ =
    inject(Actions);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly store =
    inject(Store);


  // =====================================================
  // MISSING ACCESS TOKEN
  // =====================================================

  private missingTokenError():
    ApiErrorResponse {

    return {
      statusCode: 401,

      message:
        'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.',

      timestamp:
        new Date().toISOString(),

      path: '',
    };
  }


  // =====================================================
  // REGISTER
  // =====================================================

  register$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        AuthActions.register,
      ),

      exhaustMap(({ data }) =>

        this.authService
          .register(data)
          .pipe(

            map((response) =>
              AuthActions.registerSuccess({
                response,
              }),
            ),

            catchError(
              (
                error: HttpErrorResponse,
              ) =>
                of(
                  AuthActions.registerFailure({
                    error:
                      toApiError(error),
                  }),
                ),
            ),

          ),
      ),
    ),
  );


  // =====================================================
  // REGISTER SUCCESS
  // =====================================================

  registerSuccess$ =
    createEffect(
      () =>
        this.actions$.pipe(

          ofType(
            AuthActions.registerSuccess,
          ),

          tap(() => {
            void this.router.navigate([
              '/verify-email',
            ]);
          }),

        ),
      {
        dispatch: false,
      },
    );


  // =====================================================
  // LOGIN
  // =====================================================

  login$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        AuthActions.login,
      ),

      exhaustMap(({ data }) =>

        this.authService
          .login(data)
          .pipe(

            map((response) =>
              AuthActions.loginSuccess({
                response,
              }),
            ),

            catchError(
              (
                error: HttpErrorResponse,
              ) =>
                of(
                  AuthActions.loginFailure({
                    error:
                      toApiError(error),
                  }),
                ),
            ),

          ),
      ),
    ),
  );


  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  loginSuccess$ =
    createEffect(
      () =>
        this.actions$.pipe(

          ofType(
            AuthActions.loginSuccess,
          ),

          tap(() => {
            void this.router.navigate([
              '/',
            ]);
          }),

        ),
      {
        dispatch: false,
      },
    );


  // =====================================================
  // GET CURRENT USER
  // =====================================================

  getMe$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        AuthActions.getMe,
      ),

      exhaustMap(() =>

        this.authService
          .getMe()
          .pipe(

            map((response) =>
              AuthActions.getMeSuccess({
                user:
                  response.data.user,
              }),
            ),

            catchError(
              (
                error: HttpErrorResponse,
              ) =>
                of(
                  AuthActions.getMeFailure({
                    error:
                      toApiError(error),
                  }),
                ),
            ),

          ),
      ),
    ),
  );


  // =====================================================
  // REFRESH
  // =====================================================

  refresh$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        AuthActions.refresh,
      ),

      exhaustMap(() =>

        this.authService
          .refresh()
          .pipe(

            map((response) =>
              AuthActions.refreshSuccess({
                response,
              }),
            ),

            catchError(
              (
                error: HttpErrorResponse,
              ) =>
                of(
                  AuthActions.refreshFailure({
                    error:
                      toApiError(error),
                  }),
                ),
            ),

          ),
      ),
    ),
  );


  // =====================================================
  // LOGOUT
  // =====================================================

  logout$ = createEffect(() =>
    this.actions$.pipe(

      ofType(
        AuthActions.logout,
      ),

      exhaustMap(() =>

        this.authService
          .logout()
          .pipe(

            map((response) =>
              AuthActions.logoutSuccess({
                response,
              }),
            ),

            catchError(
              (
                error: HttpErrorResponse,
              ) =>
                of(
                  AuthActions.logoutFailure({
                    error:
                      toApiError(error),
                  }),
                ),
            ),

          ),
      ),
    ),
  );


  // =====================================================
  // LOGOUT SUCCESS
  // =====================================================

  logoutSuccess$ =
    createEffect(
      () =>
        this.actions$.pipe(

          ofType(
            AuthActions.logoutSuccess,
          ),

          tap(() => {
            void this.router.navigate([
              '/login',
            ]);
          }),

        ),
      {
        dispatch: false,
      },
    );


  // =====================================================
  // UPDATE USERNAME
  // =====================================================

  updateUsername$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.updateUsername,
        ),

        withLatestFrom(
          this.store.select(
            selectAccessToken,
          ),
        ),

        exhaustMap(
          ([
            { data },
            accessToken,
          ]) => {

            if (!accessToken) {

              return of(
                AuthActions.updateUsernameFailure({
                  error:
                    this.missingTokenError(),
                }),
              );
            }

            return this.authService
              .updateUsername(
                data
              )
              .pipe(

                map((response) =>
                  AuthActions.updateUsernameSuccess({
                    response,
                  }),
                ),

                catchError(
                  (
                    error: HttpErrorResponse,
                  ) =>
                    of(
                      AuthActions.updateUsernameFailure({
                        error:
                          toApiError(error),
                      }),
                    ),
                ),

              );
          },
        ),
      ),
    );


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  changePassword$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.changePassword,
        ),

        withLatestFrom(
          this.store.select(
            selectAccessToken,
          ),
        ),

        exhaustMap(
          ([
            { data },
            accessToken,
          ]) => {

            if (!accessToken) {

              return of(
                AuthActions.changePasswordFailure({
                  error:
                    this.missingTokenError(),
                }),
              );
            }

            return this.authService
              .changePassword(
                data
              )
              .pipe(

                map((response) =>
                  AuthActions.changePasswordSuccess({
                    response,
                  }),
                ),

                catchError(
                  (
                    error: HttpErrorResponse,
                  ) =>
                    of(
                      AuthActions.changePasswordFailure({
                        error:
                          toApiError(error),
                      }),
                    ),
                ),

              );
          },
        ),
      ),
    );


  // =====================================================
  // SEND EMAIL RESET OTP
  // =====================================================

  sendEmailResetOtp$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.sendEmailResetOtp,
        ),

        withLatestFrom(
          this.store.select(
            selectAccessToken,
          ),
        ),

        exhaustMap(
          ([
            { data },
            accessToken,
          ]) => {

            if (!accessToken) {

              return of(
                AuthActions.sendEmailResetOtpFailure({
                  error:
                    this.missingTokenError(),
                }),
              );
            }

            return this.authService
              .sendEmailResetOtp(
                data
              )
              .pipe(

                map((response) =>
                  AuthActions.sendEmailResetOtpSuccess({
                    response,
                  }),
                ),

                catchError(
                  (
                    error: HttpErrorResponse,
                  ) =>
                    of(
                      AuthActions.sendEmailResetOtpFailure({
                        error:
                          toApiError(error),
                      }),
                    ),
                ),

              );
          },
        ),
      ),
    );


  // =====================================================
  // VERIFY OTP AND CHANGE EMAIL
  // =====================================================

  resetEmail$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.resetEmail,
        ),

        withLatestFrom(
          this.store.select(
            selectAccessToken,
          ),
        ),

        exhaustMap(
          ([
            { data },
            accessToken,
          ]) => {

            if (!accessToken) {

              return of(
                AuthActions.resetEmailFailure({
                  error:
                    this.missingTokenError(),
                }),
              );
            }

            /*
             * data:
             *
             * {
             *   email,
             *   newEmail,
             *   otp,
             *   sessionId
             * }
             */

            return this.authService
              .resetEmail(
                data
              )
              .pipe(

                map((response) =>
                  AuthActions.resetEmailSuccess({
                    response,
                  }),
                ),

                catchError(
                  (
                    error: HttpErrorResponse,
                  ) =>
                    of(
                      AuthActions.resetEmailFailure({
                        error:
                          toApiError(error),
                      }),
                    ),
                ),

              );
          },
        ),
      ),
    );


  // =====================================================
  // REQUEST PASSWORD RESET
  // =====================================================

  requestPasswordReset$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.requestPasswordReset,
        ),

        exhaustMap(({ data }) => {

          /*
           * data:
           *
           * {
           *   email
           * }
           *
           * Backend tạo sessionId.
           */

          return this.authService
            .requestPasswordReset(data)
            .pipe(

              map((response) =>
                AuthActions.requestPasswordResetSuccess({
                  response,
                }),
              ),

              catchError(
                (
                  error: HttpErrorResponse,
                ) =>
                  of(
                    AuthActions.requestPasswordResetFailure({
                      error:
                        toApiError(error),
                    }),
                  ),
              ),

            );
        }),
      ),
    );


  // =====================================================
  // VERIFY PASSWORD RESET OTP
  // =====================================================

  verifyPasswordResetOtp$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.verifyPasswordResetOtp,
        ),

        exhaustMap(({ data }) => {

          /*
           * data:
           *
           * {
           *   email,
           *   otp,
           *   sessionId
           * }
           *
           * HttpOnly Cookie được browser
           * tự gửi nhờ withCredentials: true.
           */

          return this.authService
            .verifyPasswordResetOtp(data)
            .pipe(

              map((response) =>
                AuthActions.verifyPasswordResetOtpSuccess({
                  response,
                }),
              ),

              catchError(
                (
                  error: HttpErrorResponse,
                ) =>
                  of(
                    AuthActions.verifyPasswordResetOtpFailure({
                      error:
                        toApiError(error),
                    }),
                  ),
              ),

            );
        }),
      ),
    );


  // =====================================================
  // RESET PASSWORD
  // =====================================================

  resetPassword$ =
    createEffect(() =>
      this.actions$.pipe(

        ofType(
          AuthActions.resetPassword,
        ),

        exhaustMap(({ data }) => {

          /*
           * HttpOnly Cookie:
           *
           * reset_password_token
           *
           * được browser tự gửi nhờ
           * withCredentials: true.
           */

          return this.authService
            .resetPassword(data)
            .pipe(

              map((response) =>
                AuthActions.resetPasswordSuccess({
                  response,
                }),
              ),

              catchError(
                (
                  error: HttpErrorResponse,
                ) =>
                  of(
                    AuthActions.resetPasswordFailure({
                      error:
                        toApiError(error),
                    }),
                  ),
              ),

            );
        }),
      ),
    );


  // =====================================================
  // RESET PASSWORD SUCCESS
  // =====================================================

  resetPasswordSuccess$ =
    createEffect(
      () =>
        this.actions$.pipe(

          ofType(
            AuthActions.resetPasswordSuccess,
          ),

          tap(() => {
            void this.router.navigate([
              '/login',
            ]);
          }),

        ),
      {
        dispatch: false,
      },
    );

}