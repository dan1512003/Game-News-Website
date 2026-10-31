import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';

import {
  NotificationState,
  notificationFeatureKey,
} from './notification.state';

// =====================================================
// NOTIFICATION STATE
// =====================================================

export const selectNotificationState =
  createFeatureSelector<NotificationState>(
    notificationFeatureKey,
  );

// =====================================================
// ACTIVITIES
// =====================================================

export const selectActivities =
  createSelector(
    selectNotificationState,
    state => state.activities,
  );

// =====================================================
// LOADING
// =====================================================

export const selectNotificationLoading =
  createSelector(
    selectNotificationState,
    state => state.loading,
  );

// =====================================================
// ERROR
// =====================================================

export const selectNotificationError =
  createSelector(
    selectNotificationState,
    state => state.error,
  );

// =====================================================
// ACTIVITY COUNT
// =====================================================

export const selectActivityCount =
  createSelector(
    selectActivities,
    activities => activities.length,
  );

// =====================================================
// DAILY VIEWS
// =====================================================

export const selectDailyViews =
  createSelector(
    selectNotificationState,
    state => state.dailyViews,
  );

// =====================================================
// DAILY VIEWS LOADING
// =====================================================

export const selectDailyViewsLoading =
  createSelector(
    selectNotificationState,
    state => state.dailyViewsLoading,
  );

// =====================================================
// DAILY VIEWS ERROR
// =====================================================

export const selectDailyViewsError =
  createSelector(
    selectNotificationState,
    state => state.dailyViewsError,
  );

// =====================================================
// TOTAL VIEWS IN 30 DAYS
// =====================================================

export const selectTotalDailyViews =
  createSelector(
    selectDailyViews,
    dailyViews =>
      dailyViews.reduce(
        (total, item) => total + item.totalViews,
        0,
      ),
  );