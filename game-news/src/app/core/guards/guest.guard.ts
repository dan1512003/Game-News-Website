import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { Store } from '@ngrx/store';

import {
  combineLatest,
  filter,
  map,
  take,
} from 'rxjs';

import { AppState } from '../../app.state';

import * as AuthSelectors
  from '../../store/auth/auth.selectors';

export const guestGuard: CanActivateFn = () => {
  const store = inject(Store<AppState>);
  const router = inject(Router);

  return combineLatest({
    initialized: store.select(
      AuthSelectors.selectAuthInitialized,
    ),

    loading: store.select(
      AuthSelectors.selectLoading,
    ),

    isAuthenticated: store.select(
      AuthSelectors.selectIsAuthenticated,
    ),

    user: store.select(
      AuthSelectors.selectAuthUser,
    ),
  }).pipe(
    // Chờ quá trình khởi tạo xác thực hoàn tất.
    filter(({ initialized }) => initialized),

    // Chỉ kiểm tra một lần.
    take(1),

    map(({ loading, isAuthenticated, user }) => {
      // Đang loading và chưa có user: cho phép truy cập.
      if (loading) {
        return true;
      }

      // Đã đăng nhập và có user: không cho vào trang guest.
      if (isAuthenticated && user !== null) {
        return false;
      }

      // Các trường hợp còn lại: cho phép truy cập.
      return true;
    }),
  );
};