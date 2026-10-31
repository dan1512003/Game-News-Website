import {
  createReducer,
  on,
} from '@ngrx/store';

import * as NotificationActions from './notification.actions';

import {
  initialNotificationState,
} from './notification.state';

export const notificationReducer = createReducer(

  initialNotificationState,

  // =====================================================
  // LOAD ACTIVITIES
  // =====================================================

  on(
    NotificationActions.loadActivities,
    (state) => ({
      ...state,
      loading: true,
      error: null,
    }),
  ),

  on(
    NotificationActions.loadActivitiesSuccess,
    (state, { activities }) => ({
      ...state,
      activities,
      loading: false,
      error: null,
    }),
  ),

  on(
    NotificationActions.loadActivitiesFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),

  // =====================================================
  // LOAD DAILY VIEWS
  // =====================================================

  on(
    NotificationActions.loadDailyViews,
    (state) => ({
      ...state,
      dailyViewsLoading: true,
      dailyViewsError: null,
    }),
  ),

  on(
    NotificationActions.loadDailyViewsSuccess,
    (state, { dailyViews }) => ({
      ...state,
      dailyViews,
      dailyViewsLoading: false,
      dailyViewsError: null,
    }),
  ),

  on(
    NotificationActions.loadDailyViewsFailure,
    (state, { error }) => ({
      ...state,
      dailyViewsLoading: false,
      dailyViewsError: error,
    }),
  ),

  // =====================================================
  // ADD ACTIVITY FROM WEBSOCKET
  // =====================================================

  on(
    NotificationActions.addActivity,
    (state, { activity }) => {
      const exists = state.activities.some(
        item => item.id === activity.id,
      );

      if (exists) {
        return state;
      }

      return {
        ...state,

        activities: [
          activity,
          ...state.activities,
        ].slice(0, 20),
      };
    },
  ),

  // =====================================================
  // UPDATE DAILY VIEWS FROM WEBSOCKET
  // =====================================================

  on(
    NotificationActions.updateDailyViews,
    (state, { dailyViews }) => ({
      ...state,
      dailyViews,
      dailyViewsLoading: false,
      dailyViewsError: null,
    }),
  ),
);