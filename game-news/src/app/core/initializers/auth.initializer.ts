
import {
  inject,
  PLATFORM_ID,
  REQUEST,
  TransferState,
  makeStateKey,
} from '@angular/core';

import {
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { Store } from '@ngrx/store';

import * as AuthActions
  from '../../store/auth/auth.actions';

import {
  getSavedUser,
} from '../../store/auth/auth.state';

import { UserLogin } from '../../shared/models/auth/auth.model';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

import { AuthService } from '../../core/services/auth/auth.service';

const SSR_AUTH_USER_KEY =
  makeStateKey<UserLogin | null>('SSR_AUTH_USER');

const SSR_AUTH_API =
  'http://localhost:3001/auth/ssr-user';

interface SsrAuthResponse {
  statusCode?: number;
  message?: string;

  user?: UserLogin | null;

  data?: UserLogin | {
    user?: UserLogin | null;
  } | null;

  timestamp?: string;
  path?: string;
}

function toApiError(error: unknown): ApiErrorResponse {
  const httpError = error as HttpErrorResponse;

  return {
    statusCode: httpError.status || 500,
    message:
      httpError.error?.message ||
      httpError.message ||
      'Không thể khôi phục phiên đăng nhập.',
    timestamp: new Date().toISOString(),
    path: '',
  };
}

export const authInitializer = async () => {
  const platformId = inject(PLATFORM_ID);
  const store = inject(Store);
  const http = inject(HttpClient);
  const authService = inject(AuthService);
  const transferState = inject(TransferState);
  const request = inject(REQUEST, { optional: true });

  let user: UserLogin | null = null;

  const isServer = isPlatformServer(platformId);
  const isBrowser = isPlatformBrowser(platformId);

 
  // SERVER: lấy user từ refresh cookie

  if (isServer) {
    const cookie = request?.headers.get('cookie');

    if (cookie) {
      try {
        const response = await firstValueFrom(
          http.get<SsrAuthResponse>(
            SSR_AUTH_API,
            {
              headers: new HttpHeaders({
                Cookie: cookie,
              }),
              transferCache: false,
            },
          ),
        );

        const payload = response?.data;

        if (payload && 'user' in payload) {
          user = payload.user ?? null;
        } else if (payload && 'userId' in payload) {
          user = payload as UserLogin;
        } else {
          user = response?.user ?? null;
        }
      } catch (error) {
        console.error(
          '[AuthInitializer] SSR lấy user thất bại:',
          (error as HttpErrorResponse).status,
        );

        user = null;
      }
    }

    transferState.set(SSR_AUTH_USER_KEY, user);

    store.dispatch(
      AuthActions.restoreUser({ user }),
    );

    store.dispatch(
      AuthActions.authInitialized(),
    );

    return;
  }

 
  // BROWSER: khôi phục user và chờ refresh

  if (isBrowser) {
    const hasSSRUser = transferState.hasKey(
      SSR_AUTH_USER_KEY,
    );

    if (hasSSRUser) {
      user = transferState.get(
        SSR_AUTH_USER_KEY,
        null,
      );

      transferState.remove(SSR_AUTH_USER_KEY);
    } else {
      user = getSavedUser();
    }

    store.dispatch(
      AuthActions.restoreUser({ user }),
    );

    try {
      console.log(
        '[AuthInitializer] Bắt đầu khôi phục access token',
      );

      const response = await firstValueFrom(
        authService.refresh(),
      );

      console.log(
        '[AuthInitializer] Refresh thành công',
      );

      store.dispatch(
        AuthActions.refreshSuccess({
          response,
        }),
      );
    } catch (error) {
      console.warn(
        '[AuthInitializer] Refresh thất bại:',
        (error as HttpErrorResponse).status,
      );

      store.dispatch(
        AuthActions.refreshFailure({
          error: toApiError(error),
        }),
      );
    }

    
    store.dispatch(
      AuthActions.authInitialized(),
    );
  }
};
