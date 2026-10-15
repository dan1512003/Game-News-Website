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

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;

    return Array.isArray(message)
      ? message.join(', ')
      : message ?? error.message ?? 'Đã xảy ra lỗi khi gọi API';
  }

  return error instanceof Error
    ? error.message
    : 'Đã xảy ra lỗi không xác định';
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
            UserActions.loadUserDashboardStatsSuccess({ stats }),
          ),
          catchError((error: unknown) =>
            of(
              UserActions.loadUserDashboardStatsFailure({
                error: getErrorMessage(error),
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
            UserActions.loadUsersSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              UserActions.loadUsersFailure({
                error: getErrorMessage(error),
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
            UserActions.loadUserByIdSuccess({ user }),
          ),
          catchError((error: unknown) =>
            of(
              UserActions.loadUserByIdFailure({
                error: getErrorMessage(error),
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
            UserActions.updateUserSuccess({ user }),
          ),
          catchError((error: unknown) =>
            of(
              UserActions.updateUserFailure({
                error: getErrorMessage(error),
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
            UserActions.deleteUserSuccess({ response }),
          ),
          catchError((error: unknown) =>
            of(
              UserActions.deleteUserFailure({
                error: getErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}