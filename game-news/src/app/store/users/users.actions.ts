import { createAction, props } from '@ngrx/store';

import {
  DeleteUserResponse,
  UpdateUserDto,
  User,
  UserDashboardStats,
  UserDetail,
  UserListResponse,
  UserQuery,
} from './models/users.model';

// Dashboard stats
export const loadUserDashboardStats = createAction(
  '[Users] Load Dashboard Stats',
);

export const loadUserDashboardStatsSuccess = createAction(
  '[Users] Load Dashboard Stats Success',
  props<{ stats: UserDashboardStats }>(),
);

export const loadUserDashboardStatsFailure = createAction(
  '[Users] Load Dashboard Stats Failure',
  props<{ error: string }>(),
);

// Danh sách
export const loadUsers = createAction(
  '[Users] Load Users',
  props<{ query: UserQuery }>(),
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ response: UserListResponse }>(),
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>(),
);

// Chi tiết
export const loadUserById = createAction(
  '[Users] Load User By Id',
  props<{ id: string }>(),
);

export const loadUserByIdSuccess = createAction(
  '[Users] Load User By Id Success',
  props<{ user: UserDetail }>(),
);

export const loadUserByIdFailure = createAction(
  '[Users] Load User By Id Failure',
  props<{ error: string }>(),
);

// Cập nhật role/status
export const updateUser = createAction(
  '[Users] Update User',
  props<{
    id: string;
    dto: UpdateUserDto;
  }>(),
);

export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: User }>(),
);

export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: string }>(),
);

// Xóa
export const deleteUser = createAction(
  '[Users] Delete User',
  props<{ id: string }>(),
);

export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ response: DeleteUserResponse }>(),
);

export const deleteUserFailure = createAction(
  '[Users] Delete User Failure',
  props<{ error: string }>(),
);

// Xóa thông báo
export const clearUserMessages = createAction(
  '[Users] Clear Messages',
);