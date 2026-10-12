import {
  User,
  UserCounts,
  UserDashboardStats,
  UserDetail,
} from './models/users.model';

export interface UserState {
  users: User[];
  selectedUser: UserDetail | null;

  // Dashboard
  dashboardStats: UserDashboardStats | null;
  dashboardStatsLoading: boolean;

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  counts: UserCounts;

  loading: boolean;
  submitting: boolean;
  deleting: boolean;

  error: string | null;
  successMessage: string | null;
}

export const initialUserState: UserState = {
  users: [],
  selectedUser: null,

  dashboardStats: null,
  dashboardStatsLoading: false,

  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  counts: {
    all: 0,
    byStatus: {
      pending_verification: 0,
      active: 0,
      banned: 0,
    },
    byRole: {},
  },

  loading: false,
  submitting: false,
  deleting: false,

  error: null,
  successMessage: null,
};