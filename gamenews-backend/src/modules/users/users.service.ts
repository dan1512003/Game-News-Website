import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
} from 'typeorm';

import { UserEntity } from './entities/user.entity/user.entity.js';
import { QueryUsersDto } from './dto/query-users.dto/query-users.dto.js';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto.js';
import { NewsEntity } from '../news/entities/news.entity/news.entity.js';
import { CommentEntity } from '../comments/entities/comment.entity/comment.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Chỉ trả về các trường an toàn cho frontend.
   * Không trả passwordHash hoặc các verification token.
   */
  private toResponse(user: UserEntity) {
    return {
      user_id: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.createdAt,
    };
  }

  /**
   * GET /users
   * Tìm kiếm, lọc và phân trang.
   */


async findAll(query: QueryUsersDto) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const search = query.search?.trim();

  // ============================================
  // 1. QUERY DANH SÁCH USER
  // Áp dụng tất cả bộ lọc
  // ============================================
  const usersQb = this.usersRepository.createQueryBuilder('user');

  if (search) {
    usersQb.andWhere(
      '(user.username ILIKE :search OR user.email ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (query.role) {
    usersQb.andWhere('user.role = :role', {
      role: query.role,
    });
  }

  if (query.status) {
    usersQb.andWhere('user.status = :status', {
      status: query.status,
    });
  }

  const [users, total] = await usersQb
    .clone()
    .select([
      'user.userId',
      'user.username',
      'user.email',
      'user.role',
      'user.status',
      'user.createdAt',
      'user.updatedAt',
    ])
    .orderBy('user.userId', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  // ============================================
  // 2. THỐNG KÊ THEO STATUS
  // Chỉ lọc theo search + role
  // Không lọc theo status đang chọn
  // ============================================
  const statusQb = this.usersRepository.createQueryBuilder('user');

  if (search) {
    statusQb.andWhere(
      '(user.username ILIKE :search OR user.email ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (query.role) {
    statusQb.andWhere('user.role = :role', {
      role: query.role,
    });
  }

  const statusRows = await statusQb
    .select('user.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.status')
    .getRawMany<{ status: string; count: string }>();

  const byStatus: Record<string, number> = {
    pending_verification: 0,
    active: 0,
    banned: 0,
  };

  for (const row of statusRows) {
    byStatus[row.status] = Number(row.count);
  }

  // ============================================
  // 3. THỐNG KÊ THEO ROLE
  // Chỉ lọc theo search + status
  // Không lọc theo role đang chọn
  // ============================================
  const roleQb = this.usersRepository.createQueryBuilder('user');

  if (search) {
    roleQb.andWhere(
      '(user.username ILIKE :search OR user.email ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  if (query.status) {
    roleQb.andWhere('user.status = :status', {
      status: query.status,
    });
  }

  const roleRows = await roleQb
    .select('user.role', 'role')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.role')
    .getRawMany<{ role: string; count: string }>();

  const byRole: Record<string, number> = {};

  for (const row of roleRows) {
    byRole[row.role] = Number(row.count);
  }

  // ============================================
  // 4. TRẢ KẾT QUẢ
  // ============================================
  return {
    items: users.map((user) => this.toResponse(user)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    counts: {
      all: total,
      byStatus,
      byRole,
    },
  };
}


async findByRole(query: QueryUsersDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const filters = {
    ...(query.role ? { role: query.role } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const [users, total] =
    await this.usersRepository.findAndCount({
      where: filters,

      select: {
        userId: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },

      order: {
        userId: 'DESC',
      },

      skip: (page - 1) * limit,
      take: limit,
    });

  return {
    items: users.map(user => this.toResponse(user)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
  /**
   * GET /users/:id
   */
async findOne(id: string) {
  const user = await this.usersRepository.findOne({
    where: { userId: id },
    select: {
      userId: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundException('Không tìm thấy người dùng');
  }

  // Lấy status các bình luận của người dùng
  const comments = await this.usersRepository.manager
    .getRepository(CommentEntity)
    .createQueryBuilder('comment')
    .select(['comment.status'])
    .where('comment.userId = :id', { id })
    .orderBy('comment.createdAt', 'DESC')
    .getMany();

  // Lấy status bài viết do người dùng làm tác giả
  const authoredNews = await this.usersRepository.manager
    .getRepository(NewsEntity)
    .createQueryBuilder('news')
    .select(['news.status'])
    .where('news.authorId = :id', { id })
    .orderBy('news.newsId', 'DESC')
    .getMany();

  // Lấy status bài viết người dùng đã duyệt
  const reviewedNews = await this.usersRepository.manager
    .getRepository(NewsEntity)
    .createQueryBuilder('news')
    .select(['news.status'])
    .where('news.reviewerId = :id', { id })
    .orderBy('news.newsId', 'DESC')
    .getMany();

  return {
    ...this.toResponse(user),

    comments: comments.map((comment) => ({
      status: comment.status,
    })),
    comment_total: comments.length,

    authored_news: authoredNews.map((news) => ({
      status: news.status,
    })),
    news_total: authoredNews.length,

    reviewed_news: reviewedNews.map((news) => ({
      status: news.status,
    })),
    reviewed_news_total: reviewedNews.length,
  };
}
  /**
   * PATCH /users/:id
   */
async update(
  id: string,
  dto: UpdateUserDto,
  currentUser: {
    userId: string;
    role: string;
  },
) {
  // Chỉ admin và super_admin được sửa role, status
  if (!['admin', 'super_admin'].includes(currentUser.role)) {
    throw new ForbiddenException(
      'Bạn không có quyền cập nhật người dùng',
    );
  }

  const user = await this.usersRepository.findOneBy({
    userId: id,
  });

  if (!user) {
    throw new NotFoundException(
      'Không tìm thấy người dùng',
    );
  }

  // Admin không được sửa chính mình
  if (
    currentUser.role === 'admin' &&
    user.userId === currentUser.userId
  ) {
    throw new ForbiddenException(
      'Admin không được thay đổi role hoặc status của chính mình',
    );
  }

  // Admin không được sửa super_admin
  if (
    currentUser.role === 'admin' &&
    user.role === 'super_admin'
  ) {
    throw new ForbiddenException(
      'Admin không được thay đổi role hoặc status của super_admin',
    );
  }

  // Không cho kích hoạt tài khoản chưa xác thực email
  if (
    user.status === 'pending_verification' &&
    dto.status === 'active'
  ) {
    throw new BadRequestException(
      'Tài khoản phải xác thực email trước khi kích hoạt',
    );
  }

  // Chỉ cập nhật trường được gửi lên
  if (dto.role !== undefined) {
    user.role = dto.role;
  }

  if (dto.status !== undefined) {
    user.status = dto.status;
  }

  const updated = await this.usersRepository.save(user);

  return this.toResponse(updated);
}
  /**
   * DELETE /users/:id
   */
  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({
      userId: id,
    });

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng',
      );
    }

    await this.usersRepository.remove(user);

    return {
      message: 'Xóa người dùng thành công',
      user_id: id,
    };
  }


  
async getDashboardStats() {
  const [total, banned] = await Promise.all([
    this.usersRepository.count(),
    this.usersRepository.count({
      where: { status: 'banned' },
    }),
  ]);

  const roleRows = await this.usersRepository
    .createQueryBuilder('user')
    .select('user.role', 'role')
    .addSelect('COUNT(*)', 'count')
    .groupBy('user.role')
    .getRawMany<{ role: string; count: string }>();

  const byRole: Record<string, number> = {
    admin: 0,
    super_admin: 0,
    editor: 0,
    author: 0,
    user: 0,
  };

  for (const row of roleRows) {
    byRole[row.role] = Number(row.count);
  }

  return {
    total,
    admin: byRole['admin'],
    superAdmin: byRole['super_admin'],
    editor: byRole['editor'],
    author: byRole['author'],
    user: byRole['user'],
    banned,
  };
}
}