export type NotificationType =
  | 'NEWS'
  | 'USER'
  | 'COMMENT';

export interface DashboardActivity {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
}
export interface DailyViews {
  date: string;
  totalViews: number;
}