import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  Repository,
} from 'typeorm';

import { CommentEntity } from './entities/comment.entity/comment.entity.js';
import { QueryCommentsDto } from './dto/query-comments.dto/query-comments.dto.js';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
  ) {}

  /**
   * Chuẩn hóa dữ liệu trả về cho Angular.
   * Không trả toàn bộ entity hoặc các quan hệ không cần thiết.
   */
  private toResponse(comment: CommentEntity) {
    return {
      comment_id: comment.commentId,
      news_id: comment.newsId,
      user_id: comment.userId,
      parent_comment_id: comment.parentId,
      content: comment.content,
      status: comment.status,
      likes: comment.likes,
      created_at: comment.createdAt,

      user: comment.user
        ? {
            username: comment.user.username,
            email: comment.user.email,
          }
        : null,

      news: comment.news
        ? {
            title: comment.news.title,
            slug: comment.news.slug,
            thumbnail: comment.news.thumbnail,
            status: comment.news.status,
            published_at: comment.news.publishedAt,
            views: comment.news.views,
            category_id: comment.news.categoryId,
            author: comment.news.author?.username ?? null,
          }
        : null,

      parent: comment.parent
        ? {
            comment_id: comment.parent.commentId,
            user_id: comment.parent.userId,
            username: comment.parent.user?.username ?? null,
            content: comment.parent.content,
          }
        : null,
    };
  }

  /**
   * GET /comments
   * Danh sách + tìm kiếm + lọc + phân trang.
   */
async findAll(query: QueryCommentsDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const qb = this.commentsRepository
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoinAndSelect('comment.news', 'news')
    .leftJoinAndSelect('news.author', 'newsAuthor')
    .leftJoinAndSelect('comment.parent', 'parent')
    .leftJoinAndSelect('parent.user', 'parentUser');

  if (query.status) {
    qb.andWhere('comment.status = :status', {
      status: query.status,
    });
  }

  if (query.newsId) {
    qb.andWhere('comment.newsId = :newsId', {
      newsId: query.newsId,
    });
  }

  if (query.userId) {
    qb.andWhere('comment.userId = :userId', {
      userId: query.userId,
    });
  }

  if (query.search?.trim()) {
    const keyword = `%${query.search.trim()}%`;

    qb.andWhere(
      new Brackets((subQuery) => {
        subQuery
          .where('comment.content ILIKE :keyword', {
            keyword,
          })
          .orWhere('user.username ILIKE :keyword', {
            keyword,
          })
          .orWhere('news.title ILIKE :keyword', {
            keyword,
          });
      }),
    );
  }

  qb.orderBy('comment.createdAt', 'DESC')
    .addOrderBy('comment.commentId', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [comments, total] = await qb.getManyAndCount();

  // ==================================================
  // THỐNG KÊ COUNTS
  // Giữ search, newsId, userId
  // Không áp dụng status và phân trang
  // ==================================================
  const countQb = this.commentsRepository
    .createQueryBuilder('comment')
    .leftJoin('comment.user', 'user')
    .leftJoin('comment.news', 'news');

  if (query.newsId) {
    countQb.andWhere('comment.newsId = :newsId', {
      newsId: query.newsId,
    });
  }

  if (query.userId) {
    countQb.andWhere('comment.userId = :userId', {
      userId: query.userId,
    });
  }

  if (query.search?.trim()) {
    const keyword = `%${query.search.trim()}%`;

    countQb.andWhere(
      new Brackets((subQuery) => {
        subQuery
          .where('comment.content ILIKE :keyword', {
            keyword,
          })
          .orWhere('user.username ILIKE :keyword', {
            keyword,
          })
          .orWhere('news.title ILIKE :keyword', {
            keyword,
          });
      }),
    );
  }

  const countRows = await countQb
    .select('comment.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('comment.status')
    .getRawMany<{ status: string; count: string }>();

  const byStatus: Record<string, number> = {
    pending: 0,
    approved: 0,
    spam: 0,
  };

  let all = 0;

  for (const row of countRows) {
    const count = Number(row.count);

    all += count;
    byStatus[row.status] = count;
  }

  return {
    items: comments.map((comment) =>
      this.toResponse(comment),
    ),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    counts: {
      all,
      byStatus,
    },
  };
}


  /**
   * GET /comments/:id
   * Xem chi tiết bình luận, bài viết và bình luận cha.
   */
  async findOne(id: string) {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.news', 'news')
      .leftJoinAndSelect('news.author', 'newsAuthor')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .where('comment.commentId = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(
        'Không tìm thấy bình luận',
      );
    }

    return this.toResponse(comment);
  }

  /**
   * GET /comments/:id/parent
   * Lấy bình luận cha nếu có.
   */
  async findParent(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id },
      relations: {
        parent: {
          user: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(
        'Không tìm thấy bình luận',
      );
    }

    if (!comment.parent) {
      return null;
    }

    return {
      comment_id: comment.parent.commentId,
      user_id: comment.parent.userId,
      username: comment.parent.user?.username ?? null,
      content: comment.parent.content,
      status: comment.parent.status,
      created_at: comment.parent.createdAt,
    };
  }

  /**
   * PATCH /comments/:id/status
   * Duyệt bình luận hoặc đánh dấu spam.
   */
  async approve(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id },
    });

    if (!comment) {
      throw new NotFoundException(
        'Không tìm thấy bình luận',
      );
    }

    comment.status = 'approved';

    const updated = await this.commentsRepository.save(
      comment,
    );

    return {
      comment_id: updated.commentId,
      status: updated.status,
      message: 'Đã duyệt bình luận hợp lệ',
    };
  }

  /**
   * PATCH /comments/:id/reject
   * Từ chối bình luận không hợp lệ.
   */
  async reject(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id },
    });

    if (!comment) {
      throw new NotFoundException(
        'Không tìm thấy bình luận',
      );
    }

    comment.status = 'spam';

    const updated = await this.commentsRepository.save(
      comment,
    );

    return {
      comment_id: updated.commentId,
      status: updated.status,
      message: 'Đã từ chối bình luận không hợp lệ',
    };
  }


  /**
   * DELETE /comments/:id
   */
  async remove(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id },
    });

    if (!comment) {
      throw new NotFoundException(
        'Không tìm thấy bình luận',
      );
    }

    await this.commentsRepository.remove(comment);

    return {
      message: 'Xóa bình luận thành công',
      comment_id: id,
    };
  }
  
async getDashboardStats() {
  const rows = await this.commentsRepository
    .createQueryBuilder('comment')
    .select('comment.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .groupBy('comment.status')
    .getRawMany<{ status: string; count: string }>();

  const byStatus: Record<string, number> = {
    pending: 0,
    approved: 0,
    spam: 0,
  };

  let total = 0;

  for (const row of rows) {
    const count = Number(row.count);

    total += count;
    byStatus[row.status] = count;
  }

  return {
    total,
    pending: byStatus['pending'],
    approved: byStatus['approved'],
    spam: byStatus['spam'],
  };
}
}