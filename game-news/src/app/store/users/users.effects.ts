
import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';

import { UserService } from './services/users.service';
import * as UserActions from './users.actions';

import { ApiErrorResponse } from '../../shared/models/auth/auth.model';

// Chuyển lỗi API thành ApiErrorResponse
function toApiError(error: unknown): ApiErrorResponse {
  if (error instanceof HttpErrorResponse) {
    // Backend không hoạt động hoặc mất kết nối
    if (error.status === 0) {
      return {
        statusCode: 0,
        message: 'Không thể kết nối đến máy chủ.',
        timestamp: new Date().toISOString(),
        path: '',
      };
    }

    const body = error.error;

    const message = body?.message;

    return {
      statusCode:
        typeof body?.statusCode === 'number'
          ? body.statusCode
          : error.status,

      message: Array.isArray(message)
        ? message.join(', ')
        : typeof message === 'string'
          ? message
          : error.message || 'Đã xảy ra lỗi khi gọi API.',

      errors: Array.isArray(body?.errors)
        ? body.errors
        : undefined,

      timestamp:
        typeof body?.timestamp === 'string'
          ? body.timestamp
          : new Date().toISOString(),

      path:
        typeof body?.path === 'string'
          ? body.path
          : '',
    };
  }

  return {
    statusCode: 500,
    message:
      error instanceof Error
        ? error.message
        : 'Đã xảy ra lỗi không xác định.',

    timestamp: new Date().toISOString(),
    path: '',
  };
}

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);

  // Dashboard stats
  loadUserDashboardStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserDashboardStats),

      exhaustMap(() =>
        this.userService.getDashboardStats().pipe(
          map((stats) =>
            UserActions.loadUserDashboardStatsSuccess({
              stats,
            }),
          ),

          catchError((error: unknown) =>
            of(
              UserActions.loadUserDashboardStatsFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Danh sách + tìm kiếm + lọc + phân trang
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),

      switchMap(({ query }) =>
        this.userService.getAll(query).pipe(
          map((response) =>
            UserActions.loadUsersSuccess({
              response,
            }),
          ),

          catchError((error: unknown) =>
            of(
              UserActions.loadUsersFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Chi tiết
  loadUserById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserById),

      mergeMap(({ id }) =>
        this.userService.getById(id).pipe(
          map((user) =>
            UserActions.loadUserByIdSuccess({
              user,
            }),
          ),

          catchError((error: unknown) =>
            of(
              UserActions.loadUserByIdFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Cập nhật role/status
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),

      exhaustMap(({ id, dto }) =>
        this.userService.update(id, dto).pipe(
          map((user) =>
            UserActions.updateUserSuccess({
              user,
            }),
          ),

          catchError((error: unknown) =>
            of(
              UserActions.updateUserFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Xóa
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),

      exhaustMap(({ id }) =>
        this.userService.delete(id).pipe(
          map((response) =>
            UserActions.deleteUserSuccess({
              response,
            }),
          ),

          catchError((error: unknown) =>
            of(
              UserActions.deleteUserFailure({
                error: toApiError(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
