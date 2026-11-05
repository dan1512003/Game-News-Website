import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { Store } from '@ngrx/store';

import {
  catchError,
  map,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { AppState } from '../../app.state';

import * as AuthSelectors
  from '../../store/auth/auth.selectors';

import * as AuthActions
  from '../../store/auth/auth.actions';

import { AuthService } from '../services/auth/auth.service';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {
  const store = inject(Store<AppState>);
  const authService = inject(AuthService);

  console.log(
    '[AuthInterceptor] Request:',
    req.method,
    req.url,
  );

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = store.selectSignal(
    AuthSelectors.selectAccessToken,
  )();

  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Request đã retry mà vẫn 401.
      if (req.headers.has('X-Retry')) {
        store.dispatch(
          AuthActions.refreshFailure({
            error: error.error as ApiErrorResponse,
          }),
        );

        return throwError(() => error);
      }

      console.log(
        '[AuthInterceptor] Sử dụng refreshOnce()',
      );

      return authService.refreshOnce().pipe(
        map((response) => {
          if (!response.data.accessToken) {
            throw new Error(
              'Refresh thành công nhưng không có access token.',
            );
          }

          return response;
        }),

        tap((response) => {
          store.dispatch(
            AuthActions.refreshSuccess({
              response,
            }),
          );
        }),

        switchMap((response) => {
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.data.accessToken}`,
              'X-Retry': 'true',
            },
          });

          console.log(
            '[AuthInterceptor] Retry request:',
            retryReq.url,
          );

          return next(retryReq);
        }),

        catchError((refreshError: unknown) => {
          const apiError =
            refreshError instanceof HttpErrorResponse
              ? refreshError.error as ApiErrorResponse
              : {
                  message:
                    refreshError instanceof Error
                      ? refreshError.message
                      : 'Refresh token thất bại.',
                } as ApiErrorResponse;

          store.dispatch(
            AuthActions.refreshFailure({
              error: apiError,
            }),
          );

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/password-reset/request') ||
    url.includes('/auth/password-reset/verify') ||
    url.includes('/auth/password-reset/reset')
  );
}