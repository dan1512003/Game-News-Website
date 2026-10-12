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

const ADMIN_ROLES = [
  'super_admin',
  'admin',
  'editor',
  'author',
] as const;

export const adminGuard: CanActivateFn = () => {
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
      if (loading && user === null) {
        return true;
      }

      // Chưa xác thực: cho phép truy cập theo yêu cầu.
      if (!isAuthenticated) {
        return true;
      }

      // Đã xác thực nhưng không có user hợp lệ.
      if (user === null) {
        return router.createUrlTree(['/forbidden']);
      }

      // Kiểm tra quyền truy cập.
      const role = user.role;

      if (
        !role ||
        !ADMIN_ROLES.includes(
          role as (typeof ADMIN_ROLES)[number],
        )
      ) {
        return router.createUrlTree(['/forbidden']);
      }

      // Đã xác thực và có quyền phù hợp.
      return true;
    }),
  );
};