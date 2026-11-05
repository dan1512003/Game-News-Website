
import {
  createAction,
  props,
} from '@ngrx/store';

import {
  DashboardActivity,
  DailyViews,
} from '../models/notification.model';
import { ApiErrorResponse } from '../../../shared/models/auth/auth.model';



// =====================================================
// LOAD ACTIVITIES
// =====================================================

export const loadActivities = createAction(
  '[Notifications] Load Activities',
);

export const loadActivitiesSuccess = createAction(
  '[Notifications] Load Activities Success',
  props<{
    activities: DashboardActivity[];
  }>(),
);

export const loadActivitiesFailure = createAction(
  '[Notifications] Load Activities Failure',
  props<{
    error: ApiErrorResponse;
  }>(),
);

// =====================================================
// LOAD DAILY VIEWS
// =====================================================

export const loadDailyViews = createAction(
  '[Notifications] Load Daily Views',
);

export const loadDailyViewsSuccess = createAction(
  '[Notifications] Load Daily Views Success',
  props<{
    dailyViews: DailyViews[];
  }>(),
);

export const loadDailyViewsFailure = createAction(
  '[Notifications] Load Daily Views Failure',
  props<{
    error: ApiErrorResponse;
  }>(),
);

// =====================================================
// WEBSOCKET
// =====================================================

export const connectNotifications = createAction(
  '[Notifications] Connect WebSocket',
);

export const disconnectNotifications = createAction(
  '[Notifications] Disconnect WebSocket',
);

export const addActivity = createAction(
  '[Notifications] Add Activity',
  props<{
    activity: DashboardActivity;
  }>(),
);

export const updateDailyViews = createAction(
  '[Notifications] Update Daily Views',
  props<{
    dailyViews: DailyViews[];
  }>(),
);
