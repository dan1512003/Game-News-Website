
import {
  Injectable,
  inject,
} from '@angular/core';

import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';

import {
  catchError,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import * as NotificationActions from './notification.actions';

import {
  NotificationService,
} from '../services/notifications.service';

@Injectable()
export class NotificationEffects {

  private readonly actions$ = inject(Actions);

  private readonly notificationService =
    inject(NotificationService);

  // =====================================================
  // LOAD ACTIVITIES
  // =====================================================

  loadActivities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.loadActivities),

      tap(() => {
        console.log('====================================');
        console.log('[NotificationEffects] LOAD ACTIVITIES');
        console.log('[LOAD ACTIVITIES] Bắt đầu gọi API');
      }),

      switchMap(() =>
        this.notificationService
          .getRecentActivities()
          .pipe(
            tap(response => {
              console.log('[LOAD ACTIVITIES] API response:', response);
            }),

            map((response: any) => {
              const activities = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];

              console.log('[LOAD ACTIVITIES] Dữ liệu sau xử lý:', activities);
              console.log('[LOAD ACTIVITIES] Tổng số hoạt động:', activities.length);

              return NotificationActions.loadActivitiesSuccess({
                activities,
              });
            }),

            catchError(error => {
              console.error('[LOAD ACTIVITIES] API ERROR:', error);
              console.error('[LOAD ACTIVITIES] Error message:', error.error?.message);

              return of(
                NotificationActions.loadActivitiesFailure({
                  error:
                    error.error?.message ??
                    'Không thể tải danh sách hoạt động',
                }),
              );
            }),
          ),
      ),
    ),
  );

  // =====================================================
  // LOAD DAILY VIEWS
  // =====================================================

  loadDailyViews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.loadDailyViews),

      tap(() => {
        console.log('====================================');
        console.log('[NotificationEffects] LOAD DAILY VIEWS');
        console.log('[LOAD DAILY VIEWS] Bắt đầu gọi API');
      }),

      switchMap(() =>
        this.notificationService
          .getDailyViews()
          .pipe(
            tap(response => {
              console.log('[LOAD DAILY VIEWS] API response:', response);
            }),

            map((response: any) => {
              const dailyViews = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];

              console.log('[LOAD DAILY VIEWS] Dữ liệu sau xử lý:', dailyViews);
              console.log('[LOAD DAILY VIEWS] Tổng số ngày:', dailyViews.length);
              console.log(
                '[LOAD DAILY VIEWS] Tổng lượt xem:',
                dailyViews.reduce(
                  (total: number, item: any) =>
                    total + (Number(item.totalViews) || 0),
                  0,
                ),
              );

              return NotificationActions.loadDailyViewsSuccess({
                dailyViews,
              });
            }),

            catchError(error => {
              console.error('[LOAD DAILY VIEWS] API ERROR:', error);
              console.error('[LOAD DAILY VIEWS] Error message:', error.error?.message);

              return of(
                NotificationActions.loadDailyViewsFailure({
                  error:
                    error.error?.message ??
                    'Không thể tải thống kê lượt xem',
                }),
              );
            }),
          ),
      ),
    ),
  );

  // =====================================================
  // CONNECT WEBSOCKET
  // =====================================================

  connectWebSocket$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NotificationActions.connectNotifications),

        tap(() => {
          console.log('====================================');
          console.log('[WEBSOCKET] Nhận action connectNotifications');
          console.log('[WEBSOCKET] Bắt đầu kết nối');
          this.notificationService.connect();
        }),
      ),
    {
      dispatch: false,
    },
  );

  // =====================================================
  // DISCONNECT WEBSOCKET
  // =====================================================

  disconnectWebSocket$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(NotificationActions.disconnectNotifications),

        tap(() => {
          console.log('====================================');
          console.log('[WEBSOCKET] Nhận action disconnectNotifications');
          console.log('[WEBSOCKET] Bắt đầu ngắt kết nối');
          this.notificationService.disconnect();
        }),
      ),
    {
      dispatch: false,
    },
  );

  // =====================================================
  // RECEIVE ACTIVITY FROM WEBSOCKET
  // =====================================================

  receiveActivity$ = createEffect(() =>
    this.notificationService.activity$.pipe(
      tap(activity => {
        console.log('====================================');
        console.log('[WEBSOCKET] Nhận hoạt động mới:', activity);
      }),

      map(activity => {
        console.log('[WEBSOCKET] Dispatch addActivity');
        return NotificationActions.addActivity({
          activity,
        });
      }),
    ),
  );

  // =====================================================
  // RECEIVE DAILY VIEWS FROM WEBSOCKET
  // =====================================================

  receiveDailyViews$ = createEffect(() =>
    this.notificationService.dailyViews$.pipe(
      tap(dailyViews => {
        console.log('====================================');
        console.log('[WEBSOCKET] Nhận thống kê lượt xem:', dailyViews);
        console.log(
          '[WEBSOCKET] Kiểu dữ liệu:',
          Array.isArray(dailyViews) ? 'Array' : typeof dailyViews,
        );
      }),

      map(dailyViews => {
        console.log('[WEBSOCKET] Dispatch updateDailyViews');

        return NotificationActions.updateDailyViews({
          dailyViews,
        });
      }),
    ),
  );
}
