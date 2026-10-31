import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
  Subject,
  Subscription,
  take,
} from 'rxjs';

import {
  io,
  Socket,
} from 'socket.io-client';

import {
  DashboardActivity,
  DailyViews,
  WebSocketTokenResponse,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3001/notifications';

  private readonly socketUrl =
    'http://localhost:3001/dashboard';

  private socket: Socket | null = null;

  private connecting = false;

  private tokenRequest?: Subscription;

  // Hoạt động Dashboard.
  private readonly activitySubject =
    new Subject<DashboardActivity>();

  readonly activity$ =
    this.activitySubject.asObservable();

  // Thống kê lượt xem.
  private readonly dailyViewsSubject =
    new Subject<DailyViews[]>();

  readonly dailyViews$ =
    this.dailyViewsSubject.asObservable();

  // =====================================================
  // GET RECENT ACTIVITIES
  // =====================================================

  getRecentActivities(): Observable<DashboardActivity[]> {
    return this.http.get<DashboardActivity[]>(
      `${this.apiUrl}/recent`,
    );
  }

  // =====================================================
  // GET DAILY VIEWS
  // =====================================================

  getDailyViews(): Observable<DailyViews[]> {
    return this.http.get<DailyViews[]>(
      `${this.apiUrl}/daily-views`,
    );
  }

  // =====================================================
  // GET WEBSOCKET TOKEN
  // =====================================================

  getWebSocketToken(): Observable<WebSocketTokenResponse> {
    return this.http.post<WebSocketTokenResponse>(
      `${this.apiUrl}/websocket-token`,
      {},
    );
  }

  // =====================================================
  // WEBSOCKET CONNECT
  // =====================================================

  connect(): void {
    if (this.socket || this.connecting) {
      return;
    }

    this.connecting = true;

    console.log(
      '[WS CLIENT] Đang lấy WebSocket Token...',
    );

    this.tokenRequest = this.getWebSocketToken()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.connecting = false;

          const websocketToken =
            response?.websocketToken;

          if (!websocketToken) {
            console.error(
              '[WS CLIENT] Không nhận được websocketToken',
            );
            return;
          }

          if (this.socket) {
            return;
          }

          console.log(
            '[WS CLIENT] Đã nhận token:',
            websocketToken.length,
            'ký tự',
          );

          this.socket = io(this.socketUrl, {
            auth: {
              token: websocketToken,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

          this.registerSocketEvents();
        },

        error: (error) => {
          this.connecting = false;

          console.error(
            '[WS CLIENT] Không thể lấy WebSocket Token:',
            error,
          );
        },
      });
  }

  // =====================================================
  // REGISTER SOCKET EVENTS
  // =====================================================

  private registerSocketEvents(): void {
    if (!this.socket) {
      return;
    }

    // Nhận hoạt động mới.
    this.socket.on(
      'dashboard:activity',
      (activity: DashboardActivity) => {
        console.log(
          '[WS CLIENT] Nhận hoạt động mới:',
          activity,
        );

        this.activitySubject.next(activity);
      },
    );

    // Nhận thống kê lượt xem 30 ngày.
    this.socket.on(
      'dashboard:daily-views',
      (dailyViews: DailyViews[]) => {
        console.log(
          '[WS CLIENT] Nhận thống kê lượt xem:',
          dailyViews,
        );

        this.dailyViewsSubject.next(dailyViews);
      },
    );

    
    this.socket.on('connect', () => {
      console.log(
        '[WS CLIENT] Dashboard WebSocket connected:',
        this.socket?.id,
      );
    });

   
    this.socket.on('disconnect', (reason) => {
      console.log(
        '[WS CLIENT] Dashboard WebSocket disconnected:',
        reason,
      );
    });

    // Lỗi kết nối.
    this.socket.on('connect_error', (error) => {
      console.error(
        '[WS CLIENT] Dashboard WebSocket error:',
        error.message,
      );
    });
  }

  // =====================================================
  // DISCONNECT
  // =====================================================

  disconnect(): void {
    this.tokenRequest?.unsubscribe();
    this.tokenRequest = undefined;

    this.connecting = false;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }



  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}