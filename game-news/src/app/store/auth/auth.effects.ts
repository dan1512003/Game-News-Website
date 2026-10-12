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
  catchError,
  exhaustMap,
  map,
  of,
  tap,
} from 'rxjs';

import * as AuthActions
  from './auth.actions';

import {
  AuthService,
} from '../../core/services/auth/auth.service';

import {
  ApiErrorResponse,
} from '../../shared/models/auth/auth.model';


@Injectable()
export class AuthEffects {

  private readonly actions$ =
    inject(Actions);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


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
              ) => {

                const apiError:
                  ApiErrorResponse =
                    error.error;

                return of(

                  AuthActions.registerFailure({
                    error: apiError,
                  }),

                );

              },
            ),

          ),

      ),

    ),

  );


  // =====================================================
  // REGISTER SUCCESS
  // =====================================================

  registerSuccess$ = createEffect(

    () =>

      this.actions$.pipe(

        ofType(
          AuthActions.registerSuccess,
        ),

        tap(() => {

          this.router.navigate([
            '/login',
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

          tap((response) => {

            console.log(
              '====================================',
            );

            console.log(
              '✅ LOGIN BACKEND RESPONSE:',
              response,
            );

            console.log(
              '🔑 ACCESS TOKEN:',
              response.data.accessToken,
            );

            console.log(
              '👤 USER:',
              response.data.user,
            );

            console.log(
              '====================================',
            );

          }),

          map((response) =>

            AuthActions.loginSuccess({
              response,
            }),

          ),

          catchError(
            (
              error: HttpErrorResponse,
            ) => {

              const apiError:
                ApiErrorResponse =
                  error.error;

              return of(

                AuthActions.loginFailure({
                  error: apiError,
                }),

              );

            },
          ),

        ),

    ),

  ),

);

  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  loginSuccess$ = createEffect(

    () =>

      this.actions$.pipe(

        ofType(
          AuthActions.loginSuccess,
        ),

        tap(() => {

          this.router.navigate([
            '/',
          ]);

        }),

      ),

    {
      dispatch: false,
    },

  );

getMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.getMe),

      exhaustMap(() =>
        this.authService.getMe().pipe(
          map(response =>
            AuthActions.getMeSuccess({
              user: response.data.user,
            }),
          ),

          catchError(error =>
            of(
              AuthActions.getMeFailure({
                error:
                  error?.error?.message ??
                  'Không thể lấy thông tin người dùng',
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
              ) => {

                const apiError:
                  ApiErrorResponse =
                    error.error;

                return of(

                  AuthActions.refreshFailure({
                    error: apiError,
                  }),

                );

              },
            ),

          ),

      ),

    ),

  );


  // =====================================================
  // REFRESH FAILURE
  // =====================================================

  // refreshFailure$ = createEffect(

  //   () =>

  //     this.actions$.pipe(

  //       ofType(
  //         AuthActions.refreshFailure,
  //       ),

  //       tap(() => {

  //         this.router.navigate([
  //           '/login',
  //         ]);

  //       }),

  //     ),

  //   {
  //     dispatch: false,
  //   },

  // );


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
              ) => {

                const apiError:
                  ApiErrorResponse =
                    error.error;

                return of(

                  AuthActions.logoutFailure({
                    error: apiError,
                  }),

                );

              },
            ),

          ),

      ),

    ),

  );


  // =====================================================
  // LOGOUT SUCCESS
  // =====================================================

  logoutSuccess$ = createEffect(

    () =>

      this.actions$.pipe(

        ofType(
          AuthActions.logoutSuccess,
        ),

        tap(() => {

          this.router.navigate([
            '/login',
          ]);

        }),

      ),

    {
      dispatch: false,
    },

  );

}