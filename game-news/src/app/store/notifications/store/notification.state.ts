import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';
import {
  DashboardActivity,
  DailyViews,
} from '../models/notification.model';



export interface NotificationState {
  activities: DashboardActivity[];

  dailyViews: DailyViews[];

  loading: boolean;

  dailyViewsLoading: boolean;

  error: ApiErrorResponse | null;

  dailyViewsError: ApiErrorResponse | null;
}

export const initialNotificationState: NotificationState = {
  activities: [],

  dailyViews: [],

  loading: false,

  dailyViewsLoading: false,

  error: null,

  dailyViewsError: null,
};

export const notificationFeatureKey = 'notifications';