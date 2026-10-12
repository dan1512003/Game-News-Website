import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import { UserState } from './users.state';

export const USER_FEATURE_KEY = 'user';

export const selectUserState =
  createFeatureSelector<UserState>(USER_FEATURE_KEY);

// Dashboard
export const selectUserDashboardStats = createSelector(
  selectUserState,
  (state) => state.dashboardStats,
);

export const selectUserDashboardStatsLoading = createSelector(
  selectUserState,
  (state) => state.dashboardStatsLoading,
);

// Danh sách
export const selectAllUsers = createSelector(
  selectUserState,
  (state) => state.users,
);

// Chi tiết
export const selectSelectedUser = createSelector(
  selectUserState,
  (state) => state.selectedUser,
);

// Phân trang
export const selectUserMeta = createSelector(
  selectUserState,
  (state) => state.meta,
);

export const selectUserPage = createSelector(
  selectUserMeta,
  (meta) => meta.page,
);

export const selectUserLimit = createSelector(
  selectUserMeta,
  (meta) => meta.limit,
);

export const selectUserTotal = createSelector(
  selectUserMeta,
  (meta) => meta.total,
);

export const selectUserTotalPages = createSelector(
  selectUserMeta,
  (meta) => meta.totalPages,
);

export const selectUserCounts = createSelector(
  selectUserState,
  (state) => state.counts,
);

// Trạng thái xử lý
export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.loading,
);

export const selectUserSubmitting = createSelector(
  selectUserState,
  (state) => state.submitting,
);

export const selectUserDeleting = createSelector(
  selectUserState,
  (state) => state.deleting,
);

// Thông báo
export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error,
);

export const selectUserSuccessMessage = createSelector(
  selectUserState,
  (state) => state.successMessage,
);

// Selector tiện ích
export const selectHasUsers = createSelector(
  selectAllUsers,
  (users) => users.length > 0,
);