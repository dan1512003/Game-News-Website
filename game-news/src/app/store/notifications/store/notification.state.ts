import {
  DashboardActivity,
  DailyViews,
} from '../models/notification.model';

export interface NotificationState {
  activities: DashboardActivity[];

  dailyViews: DailyViews[];

  loading: boolean;

  dailyViewsLoading: boolean;

  error: string | null;

  dailyViewsError: string | null;
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