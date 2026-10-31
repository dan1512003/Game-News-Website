
import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { Store } from '@ngrx/store';

import {
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

import { AppState } from '../../app.state';

import * as AuthSelectors
  from '../../store/auth/auth.selectors';

import * as AuthActions
  from '../../store/auth/auth.actions';

import { AuthService } from '../services/auth/auth.service';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

let refreshRequest$:
  ReturnType<AuthService['refresh']> | null = null;

export const authInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {
  const store = inject(Store<AppState>);
  const authService = inject(AuthService);

  console.log('[AuthInterceptor] Request:', req.method, req.url);

  // Không gắn access token vào các endpoint xác thực
  // và các endpoint tin tức công khai.
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = store.selectSignal(
    AuthSelectors.selectAccessToken,
  )();

  // Gửi request với token nếu đang có token.
  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  if (!accessToken) {
    console.warn(
      '[AuthInterceptor] Chưa có access token:',
      req.url,
    );
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Request đã retry mà vẫn 401 thì không refresh lần nữa.
      if (req.headers.has('X-Retry')) {
        store.dispatch(
          AuthActions.refreshFailure({
            error: error.error as ApiErrorResponse,
          }),
        );

        return throwError(() => error);
      }

      // Các request cùng sử dụng một HTTP refresh request.
      if (!refreshRequest$) {
        console.log('[AuthInterceptor] Bắt đầu refresh');

        refreshRequest$ = authService.refresh().pipe(
          finalize(() => {
            refreshRequest$ = null;

            console.log(
              '[AuthInterceptor] Đã reset refreshRequest$',
            );
          }),
          shareReplay({
            bufferSize: 1,
            refCount: false,
          }),
        );
      } else {
        console.log(
          '[AuthInterceptor] Dùng chung refresh request',
        );
      }

      const sharedRefresh$ = refreshRequest$;

      return sharedRefresh$.pipe(
        switchMap((response) => {
          const newAccessToken =
            response.data.accessToken;

          if (!newAccessToken) {
            return throwError(
              () => new Error(
                'Refresh thành công nhưng không có access token.',
              ),
            );
          }

          store.dispatch(
            AuthActions.refreshSuccess({
              response,
            }),
          );

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
              'X-Retry': 'true',
            },
          });

          console.log(
            '[AuthInterceptor] Retry request:',
            retryReq.url,
          );

          return next(retryReq);
        }),

        catchError((refreshError: HttpErrorResponse) => {
          const apiError =
            refreshError.error as ApiErrorResponse;

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
