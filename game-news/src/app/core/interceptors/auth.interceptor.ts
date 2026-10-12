import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { Store } from '@ngrx/store';

import {
  catchError,
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

  // Không xử lý các endpoint xác thực.
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Lấy access token hiện tại.
  const accessToken = store.selectSignal(
    AuthSelectors.selectAccessToken,
  )();

  // Không có token thì gửi request bình thường.
  if (!accessToken) {
    return next(req);
  }

  // Thêm access token.
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
        console.error('========== HTTP ERROR ==========');
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Status:', error.status);
    console.error('Response body:', error.error);
    console.error('================================');
      // Chỉ xử lý lỗi 401.
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Request retry vẫn trả về 401.
      if (req.headers.has('X-Retry')) {
        store.dispatch(
          AuthActions.refreshFailure({
            error: error.error as ApiErrorResponse,
          }),
        );

        return throwError(() => error);
      }

      // Tạo một refresh request dùng chung.
      if (!refreshRequest$) {
        refreshRequest$ = authService.refresh();
      }

      return refreshRequest$.pipe(
        switchMap((response) => {
          // Xóa refresh request dùng chung.
          refreshRequest$ = null;

          // Lưu access token mới.
          store.dispatch(
            AuthActions.refreshSuccess({
              response,
            }),
          );

          // Gửi lại request ban đầu với token mới.
          const retryReq = req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${response.data.accessToken}`,
              'X-Retry': 'true',
            },
          });

          return next(retryReq);
        }),

        catchError((refreshError: HttpErrorResponse) => {
          // Refresh thất bại: xóa request dùng chung.
          refreshRequest$ = null;

          // Lấy nội dung lỗi từ API refresh.
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
    url.includes('/auth/logout')
  );
}