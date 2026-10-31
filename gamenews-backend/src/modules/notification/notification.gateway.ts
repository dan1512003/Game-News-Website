
import {
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import {
  Server,
  Socket,
} from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import type { DailyViews, DashboardActivity } from './notification.types.js';
import { UserEntity } from '../users/entities/user.entity/user.entity.js';
import { WebSocketJwtStrategy } from './strategies/websocket-jwt.strategy.js';
import { NewsView } from './entities/news-view.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const DASHBOARD_ROOM = 'admin_dashboard';

const ALLOWED_ROLES = [
  'admin',
  'super_admin',
  'editor',
  'author',
];

@WebSocketGateway({
  namespace: '/dashboard',
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly webSocketJwtStrategy: WebSocketJwtStrategy,
      @InjectRepository(NewsView)
    private readonly newsViewRepository: Repository<NewsView>,
  ) {}

  // Tạo JWT riêng dành cho WebSocket.
  async createWebSocketToken(
    user: UserEntity,
  ): Promise<{
    websocketToken: string;
    expiresIn: number;
  }> {
    this.logger.log(
      `[CREATE TOKEN] Bắt đầu tạo token cho user: ${user?.username}`,
    );

    if (
      !user?.userId ||
      user.status !== 'active' ||
      !ALLOWED_ROLES.includes(user.role)
    ) {
      this.logger.warn(
        '[CREATE TOKEN] User không đủ quyền truy cập Dashboard',
      );

      throw new UnauthorizedException(
        'Bạn không có quyền kết nối Dashboard',
      );
    }

    const secret = this.configService.get<string>(
      'WS_JWT_SECRET',
    );

    if (!secret) {
      this.logger.error(
        '[CREATE TOKEN] WS_JWT_SECRET chưa được cấu hình',
      );

      throw new Error(
        'WS_JWT_SECRET chưa được cấu hình',
      );
    }

    const websocketToken = await this.jwtService.signAsync(
      {
        purpose: 'dashboard_socket',
      },
      {
        secret,
        subject: String(user.userId),
        expiresIn: '5m',
      },
    );

    this.logger.log(
      `[CREATE TOKEN] Thành công - userId: ${user.userId}, expiresIn: 300s`,
    );

    return {
      websocketToken,
      expiresIn: 300,
    };
  }

  // Xác thực khi client kết nối WebSocket.
  async handleConnection(client: Socket): Promise<void> {
    this.logger.log('========== WEBSOCKET CONNECTING ==========');

    this.logger.log(`Socket ID: ${client.id}`);
    this.logger.log(`Namespace: ${client.nsp.name}`);
    this.logger.log(`Transport: ${client.conn.transport.name}`);
    this.logger.log(`Client address: ${client.handshake.address}`);

    // Lắng nghe lý do ngắt kết nối thực tế từ Socket.IO.
    client.on('disconnect', (reason, description) => {
      this.logger.warn(
        `[DISCONNECT EVENT] Socket: ${client.id}`,
      );

      this.logger.warn(
        `[DISCONNECT EVENT] Reason: ${reason}`,
      );

      if (description) {
        this.logger.warn(
          `[DISCONNECT EVENT] Description: ${JSON.stringify(description)}`,
        );
      }
    });

    try {
      const token = client.handshake.auth?.token;
this.logger.debug(
  `[AUTH DEBUG] Handshake auth: ${JSON.stringify(
    client.handshake.auth,
  )}`,
);

this.logger.debug(
  `[AUTH DEBUG] Token exists: ${
    !!client.handshake.auth?.token
  }`,
);
      this.logger.log(
        `[AUTH] Kiểm tra token - Socket: ${client.id}`,
      );

      if (!token) {
        this.logger.warn(
          `[AUTH FAILED] Không tìm thấy token - Socket: ${client.id}`,
        );

        client.disconnect();
        return;
      }

      this.logger.log(
        `[AUTH] Đã nhận token - Socket: ${client.id}`,
      );

      this.logger.log(
        '[AUTH] Bắt đầu xác thực WebSocket JWT',
      );

      const user = await this.webSocketJwtStrategy.validate(
        token,
      );

      this.logger.log(
        `[AUTH SUCCESS] User: ${user.username}, ID: ${user.userId}, Role: ${user.role}`,
      );

      client.data.user = user;

      this.logger.log(
        `[ROOM] Đang tham gia room: ${DASHBOARD_ROOM}`,
      );

      await client.join(DASHBOARD_ROOM);

      this.logger.log(
        `[ROOM SUCCESS] Socket ${client.id} đã tham gia ${DASHBOARD_ROOM}`,
      );

      this.logger.log(
        `[CONNECTED] Dashboard connected: ${client.id} - ${user.username}`,
      );

      this.logger.log('========== WEBSOCKET CONNECTED ==========');
    } catch (error) {
      this.logger.error(
        `[AUTH ERROR] Socket: ${client.id}`,
        error instanceof Error
          ? error.stack
          : String(error),
      );

      this.logger.warn(
        `[DISCONNECT] Server chủ động ngắt Socket: ${client.id}`,
      );

      client.disconnect();
    }
  }

  // Theo dõi ngắt kết nối.
  handleDisconnect(client: Socket): void {
    this.logger.warn(
      '========== WEBSOCKET DISCONNECTED ==========',
    );

    this.logger.warn(`Socket ID: ${client.id}`);

    this.logger.warn(
      `Namespace: ${client.nsp.name}`,
    );

    this.logger.warn(
      `User: ${client.data?.user?.username ?? 'Không xác định'}`,
    );

    this.logger.warn(
      `User ID: ${client.data?.user?.userId ?? 'Không xác định'}`,
    );

    this.logger.warn(
      `Connected: ${client.connected}`,
    );

    this.logger.warn(
      `Transport: ${client.conn.transport.name}`,
    );

    this.logger.warn(
      '============================================',
    );
  }

  
// Gửi hoạt động đến tất cả Dashboard đang kết nối.
async sendActivity(activity: DashboardActivity): Promise<void> {
  if (!this.server) {
    this.logger.error(
      '[EMIT ACTIVITY] WebSocket server chưa được khởi tạo',
    );
    return;
  }

  try {
    // Lấy danh sách socket trong room admin_dashboard.
    const clients = await this.server
      .in(DASHBOARD_ROOM)
      .fetchSockets();

    this.logger.log(
      '[EMIT ACTIVITY] Namespace: /dashboard',
    );

    this.logger.log(
      `[EMIT ACTIVITY] Room: ${DASHBOARD_ROOM}`,
    );

    this.logger.log(
      `[EMIT ACTIVITY] Số client trong room: ${clients.length}`,
    );

    this.logger.debug(
      `[EMIT ACTIVITY] Nội dung: ${JSON.stringify(activity)}`,
    );

    // Gửi sự kiện đến room.
    this.server
      .to(DASHBOARD_ROOM)
      .emit('dashboard:activity', activity);

    this.logger.log(
      `[EMIT ACTIVITY SUCCESS] Đã gửi sự kiện vào room: ${DASHBOARD_ROOM}`,
    );
  } catch (error) {
    this.logger.error(
      '[EMIT ACTIVITY ERROR]',
      error instanceof Error
        ? error.stack
        : String(error),
    );
  }
}

 // ============================================================
  // LẤY THỐNG KÊ LƯỢT XEM 30 NGÀY
  // ============================================================

 async getDailyViewsLast30Days(): Promise<DailyViews[]> {
    const result = await this.newsViewRepository.query(`
      WITH date_series AS (
        SELECT generate_series(
          (
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
          )::date - 29,
          (
            CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'
          )::date,
          INTERVAL '1 day'
        )::date AS view_date
      )

      SELECT
        TO_CHAR(ds.view_date, 'YYYY-MM-DD') AS date,
        COUNT(nv.id)::int AS "totalViews"

      FROM date_series ds

      LEFT JOIN news_views nv
        ON nv.viewed_at >= (
          ds.view_date::timestamp
          AT TIME ZONE 'Asia/Ho_Chi_Minh'
        )
        AND nv.viewed_at < (
          (ds.view_date + INTERVAL '1 day')::timestamp
          AT TIME ZONE 'Asia/Ho_Chi_Minh'
        )

      GROUP BY ds.view_date
      ORDER BY ds.view_date ASC
    `);

    return result.map((item: DailyViews) => ({
      date: item.date,
      totalViews: Number(item.totalViews),
    }));
  }

  // ============================================================
  // PHÁT THỐNG KÊ KHI CÓ LƯỢT XEM MỚI
  // ============================================================

  async emitDailyViews(): Promise<void> {
    if (!this.server) {
      this.logger.error(
        '[DAILY VIEWS] WebSocket server chưa được khởi tạo',
      );
      return;
    }

    try {
      const dailyViews = await this.getDailyViewsLast30Days();

      this.server
        .to(DASHBOARD_ROOM)
        .emit('dashboard:daily-views', dailyViews);

      this.logger.log(
        `[DAILY VIEWS] Đã cập nhật thống kê 30 ngày cho ${DASHBOARD_ROOM}`,
      );
    } catch (error) {
      this.logger.error(
        '[DAILY VIEWS EMIT ERROR]',
        error instanceof Error
          ? error.stack
          : String(error),
      );
    }
  }



}
