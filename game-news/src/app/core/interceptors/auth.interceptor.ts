
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
  console.log('[AuthInterceptor] ========== REQUEST START ==========');
  console.log('[AuthInterceptor] URL:', req.url);
  console.log('[AuthInterceptor] Method:', req.method);
  console.log('[AuthInterceptor] Headers:', req.headers.keys());
  console.log(
    '[AuthInterceptor] Is auth endpoint:',
    isAuthEndpoint(req.url),
  );

  const store = inject(Store<AppState>);
  const authService = inject(AuthService);


  if (isAuthEndpoint(req.url)) {
    console.log(
      '[AuthInterceptor] Bỏ qua endpoint xác thực:',
      req.url,
    );

    return next(req);
  }

 
  const accessToken = store.selectSignal(
    AuthSelectors.selectAccessToken,
  )();

  console.log(
    '[AuthInterceptor] Có access token:',
    !!accessToken,
  );

  if (!accessToken) {
    console.log(
      '[AuthInterceptor] Không có access token, gửi request không thêm Authorization',
    );

    return next(req);
  }


  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log(
    '[AuthInterceptor] Đã thêm Authorization header',
  );

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(
        '[AuthInterceptor] ========== HTTP ERROR ==========',
      );
      console.error('[AuthInterceptor] URL:', req.url);
      console.error('[AuthInterceptor] Method:', req.method);
      console.error('[AuthInterceptor] Status:', error.status);
      console.error(
        '[AuthInterceptor] Response body:',
        error.error,
      );
      console.error(
        '[AuthInterceptor] Request có X-Retry:',
        req.headers.has('X-Retry'),
      );
      console.error(
        '[AuthInterceptor] =================================',
      );

   
      if (error.status !== 401) {
        console.log(
          '[AuthInterceptor] Không phải lỗi 401, trả lỗi về caller',
        );

        return throwError(() => error);
      }

      console.warn(
        '[AuthInterceptor] Nhận 401, kiểm tra request retry',
      );


      if (req.headers.has('X-Retry')) {
        console.error(
          '[AuthInterceptor] Request retry vẫn nhận 401, không refresh lần nữa',
        );

        store.dispatch(
          AuthActions.refreshFailure({
            error: error.error as ApiErrorResponse,
          }),
        );

        return throwError(() => error);
      }

   
      if (!refreshRequest$) {
        console.log(
          '[AuthInterceptor] Chưa có refresh request, bắt đầu refresh',
        );

        refreshRequest$ = authService.refresh();
      } else {
        console.log(
          '[AuthInterceptor] Đang có refresh request, dùng chung request hiện tại',
        );
      }

      return refreshRequest$.pipe(
        switchMap((response) => {
          console.log(
            '[AuthInterceptor] Refresh thành công',
          );
          console.log(
            '[AuthInterceptor] Refresh response:',
            {
              message: response.message,
              user: response.data.user,
              hasAccessToken: !!response.data.accessToken,
            },
          );

      
          refreshRequest$ = null;

          console.log(
            '[AuthInterceptor] Đã reset refreshRequest$',
          );

       
          store.dispatch(
            AuthActions.refreshSuccess({
              response,
            }),
          );

          console.log(
            '[AuthInterceptor] Đã dispatch refreshSuccess',
          );

     
          const retryReq = req.clone({
            setHeaders: {
              Authorization:
                `Bearer ${response.data.accessToken}`,
              'X-Retry': 'true',
            },
          });

          console.log(
            '[AuthInterceptor] Gửi lại request với access token mới',
          );
          console.log(
            '[AuthInterceptor] Retry URL:',
            retryReq.url,
          );
          console.log(
            '[AuthInterceptor] Retry method:',
            retryReq.method,
          );
          console.log(
            '[AuthInterceptor] Retry headers:',
            retryReq.headers.keys(),
          );

          return next(retryReq);
        }),

        catchError((refreshError: HttpErrorResponse) => {
          console.error(
            '[AuthInterceptor] ========== REFRESH ERROR ==========',
          );
          console.error(
            '[AuthInterceptor] Refresh status:',
            refreshError.status,
          );
          console.error(
            '[AuthInterceptor] Refresh message:',
            refreshError.message,
          );
          console.error(
            '[AuthInterceptor] Refresh response body:',
            refreshError.error,
          );

      
          refreshRequest$ = null;

          console.log(
            '[AuthInterceptor] Đã reset refreshRequest$ sau lỗi',
          );

          const apiError =
            refreshError.error as ApiErrorResponse;

          store.dispatch(
            AuthActions.refreshFailure({
              error: apiError,
            }),
          );

          console.error(
            '[AuthInterceptor] Đã dispatch refreshFailure',
          );
          console.error(
            '[AuthInterceptor] =================================',
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
    url.includes('/auth/refresh')||
     url.includes('auth/password-reset/request') ||
    url.includes('auth/password-reset/verify') ||
    url.includes('auth/password-reset/reset')
  );
}
