export type NotificationType = 'NEWS' | 'USER' | 'COMMENT';

export interface DashboardActivity {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
}

export interface DailyViews {
  date: string;
  totalViews: number;
}

export interface WebSocketTokenResponse {
  websocketToken: string;
  expiresIn: number;
}