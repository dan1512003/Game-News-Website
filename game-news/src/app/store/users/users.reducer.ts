import {
  createReducer,
  on,
} from '@ngrx/store';

import { initialUserState } from './users.state';
import * as UserActions from './users.actions';

export const userReducer = createReducer(
  initialUserState,

  // Dashboard: bắt đầu tải
  on(UserActions.loadUserDashboardStats, (state) => ({
    ...state,
    dashboardStatsLoading: true,
  })),

  // Dashboard: tải thành công
  on(
    UserActions.loadUserDashboardStatsSuccess,
    (state, { stats }) => ({
      ...state,
      dashboardStats: stats,
      dashboardStatsLoading: false,
    }),
  ),

  // Dashboard: tải thất bại
  on(
    UserActions.loadUserDashboardStatsFailure,
    (state, { error }) => ({
      ...state,
      dashboardStatsLoading: false,
      error,
    }),
  ),

  // Danh sách
  on(UserActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
    successMessage: null,
  })),

  on(UserActions.loadUsersSuccess, (state, { response }) => ({
    ...state,
    users: response.items,
    meta: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
    },
    counts: response.counts,
    loading: false,
  })),

  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Chi tiết
  on(UserActions.loadUserById, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadUserByIdSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    loading: false,
    error: null,
  })),

  on(UserActions.loadUserByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cập nhật
  on(UserActions.updateUser, (state) => ({
    ...state,
    submitting: true,
    error: null,
    successMessage: null,
  })),

  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,

    users: state.users.map((item) =>
      item.user_id === user.user_id ? user : item,
    ),

    selectedUser:
      state.selectedUser?.user_id === user.user_id
        ? {
            ...state.selectedUser,
            ...user,
          }
        : state.selectedUser,

    submitting: false,
    error: null,
    successMessage: 'Cập nhật người dùng thành công',
  })),

  on(UserActions.updateUserFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    error,
  })),

  // Xóa
  on(UserActions.deleteUser, (state) => ({
    ...state,
    deleting: true,
    error: null,
    successMessage: null,
  })),

  on(
    UserActions.deleteUserSuccess,
    (state, { response }) => {
      const users = state.users.filter(
        (user) => user.user_id !== response.user_id,
      );

      const total = Math.max(0, state.meta.total - 1);

      return {
        ...state,
        users,

        selectedUser:
          state.selectedUser?.user_id === response.user_id
            ? null
            : state.selectedUser,

        meta: {
          ...state.meta,
          total,
          totalPages: Math.ceil(total / state.meta.limit),
        },

        deleting: false,
        error: null,
        successMessage: response.message,
      };
    },
  ),

  on(UserActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    deleting: false,
    error,
  })),

  // Thông báo
  on(UserActions.clearUserMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null,
  })),
);