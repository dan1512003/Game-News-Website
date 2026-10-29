import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  EntityManager,
  In,
  Repository,
} from 'typeorm';

import { CommentEntity } from './entities/comment.entity/comment.entity.js';
import { QueryCommentsDto } from './dto/query-comments.dto/query-comments.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto/create-comment.dto.js';
import { UserEntity } from '../users/entities/user.entity/user.entity.js';
import { NewsEntity } from '../news/entities/news.entity/news.entity.js';
import { CommentSort } from './pipes/comment-sort.pipe.js';
import { CommentLikeEntity } from './entities/comment-like.entity/comment-like.entity.js';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepository: Repository<CommentEntity>,
       @InjectRepository(NewsEntity)
    private readonly newsRepo: Repository<NewsEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
      private readonly dataSource: DataSource,
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



  // 1. CREATE COMMENT

  async create(
    newsId: string,
    dto: CreateCommentDto,
    currentUser: UserEntity,
  ) {
    const content = dto.content?.trim();

    if (!content) {
      throw new BadRequestException(
        'Nội dung bình luận không được để trống',
      );
    }

    const created = await this.dataSource.transaction(
      async (manager) => {
        const newsRepository =
          manager.getRepository(NewsEntity);

        const userRepository =
          manager.getRepository(UserEntity);

        const commentRepository =
          manager.getRepository(CommentEntity);

        // Kiểm tra bài viết đã xuất bản.
        const news = await newsRepository.findOne({
          where: {
            newsId,
            status: 'published',
          },
        });

        if (!news) {
          throw new NotFoundException(
            'Không tìm thấy bài viết đã xuất bản',
          );
        }

        // Kiểm tra tài khoản đang hoạt động.
        const user = await userRepository.findOne({
          where: {
            userId: currentUser.userId,
            status: 'active',
          },
        });

        if (!user) {
          throw new NotFoundException(
            'Tài khoản không tồn tại hoặc không hoạt động',
          );
        }

        // Kiểm tra bình luận cha nếu là trả lời.
        const parentId = dto.parentId ?? null;
        let parent: CommentEntity | null = null;

        if (parentId !== null) {
          parent = await commentRepository.findOne({
            where: {
              commentId: parentId,
              newsId,
            },
          });

          if (!parent || parent.status === 'spam') {
            throw new NotFoundException(
              'Không tìm thấy bình luận cha hợp lệ',
            );
          }
        }

        // Tạo bình luận mới.
        // pending vẫn được hiển thị vì chỉ ẩn spam.
        let comment = commentRepository.create({
          newsId: news.newsId,
          userId: user.userId,
          parentId: parent?.commentId ?? null,
          rootId: parent
            ? parent.rootId ?? parent.commentId
            : null,
          content,
          status: 'pending',
          likes: 0,
        });

        comment = await commentRepository.save(comment);

        // Bình luận gốc tự tham chiếu rootId.
        if (!parent) {
          comment.rootId = comment.commentId;
          comment = await commentRepository.save(comment);
        }

        return {
          id: String(comment.commentId),
          newsId: String(comment.newsId),
          userId: String(comment.userId),
          parentId: comment.parentId
            ? String(comment.parentId)
            : null,
          rootId: comment.rootId
            ? String(comment.rootId)
            : null,
          content: comment.content,
          status: comment.status,
          likes: comment.likes,
          liked: false,
          createdAt: comment.createdAt,
          user: {
            id: String(user.userId),
            username: user.username,
          },
        };
      },
    );

    // Lấy danh sách sau khi transaction đã hoàn tất.
    const comments = await this.findByNews(
      newsId,
      'newest',
      String(currentUser.userId),
    );

    return {
      message: 'Đã gửi bình luận',
      created,
      comments,
    };
  }


  // 2. FIND COMMENTS BY NEWS
 
  async findByNews(
    newsId: string,
    sortBy: CommentSort = 'newest',
    currentUserId?: string,
  ) {
    const news = await this.dataSource
      .getRepository(NewsEntity)
      .findOne({
        where: {
          newsId,
          status: 'published',
        },
      });

    if (!news) {
      throw new NotFoundException(
        'Không tìm thấy bài viết đã xuất bản',
      );
    }

    return this.getCommentsByNews(
      newsId,
      sortBy,
      currentUserId,
    );
  }


  // 3. TOGGLE LIKE

  async toggleLike(
    newsId: string,
    commentId: string,
    currentUser: UserEntity,
    sortBy: CommentSort = 'newest',
  ) {
    const result = await this.dataSource.transaction(
      async (manager) => {
        const newsRepository =
          manager.getRepository(NewsEntity);

        const userRepository =
          manager.getRepository(UserEntity);

        const commentRepository =
          manager.getRepository(CommentEntity);

        const likeRepository =
          manager.getRepository(CommentLikeEntity);

        // Kiểm tra bài viết.
        const news = await newsRepository.findOne({
          where: {
            newsId,
            status: 'published',
          },
        });

        if (!news) {
          throw new NotFoundException(
            'Không tìm thấy bài viết đã xuất bản',
          );
        }

        // Kiểm tra người dùng.
        const user = await userRepository.findOne({
          where: {
            userId: currentUser.userId,
            status: 'active',
          },
        });

        if (!user) {
          throw new NotFoundException(
            'Tài khoản không tồn tại hoặc không hoạt động',
          );
        }

        // Khóa dòng bình luận trong transaction.
        const comment = await commentRepository.findOne({
          where: {
            commentId,
            newsId,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!comment || comment.status === 'spam') {
          throw new NotFoundException(
            'Không tìm thấy bình luận',
          );
        }

        // Kiểm tra lượt like hiện có.
        const existingLike = await likeRepository.findOne({
          where: {
            commentId: comment.commentId,
            userId: String(user.userId),
          },
        });

        let liked: boolean;

        if (existingLike) {
          await likeRepository.delete({
            id: existingLike.id,
          });

          liked = false;
        } else {
          await likeRepository.insert({
            commentId: comment.commentId,
            userId: String(user.userId),
          });

          liked = true;
        }

        // Tính lại số like từ bảng comment_likes.
        const likes = await likeRepository.count({
          where: {
            commentId: comment.commentId,
          },
        });

        await commentRepository.update(
          {
            commentId: comment.commentId,
          },
          {
            likes,
          },
        );

        return {
          commentId: String(comment.commentId),
          liked,
          likes,
        };
      },
    );

    // Trả danh sách đã cập nhật sau khi transaction hoàn tất.
    const comments = await this.findByNews(
      newsId,
      sortBy,
      String(currentUser.userId),
    );

    return {
      ...result,
      comments,
    };
  }


  // PRIVATE: DÙNG CHUNG CHO VIỆC LẤY DANH SÁCH

  private async getCommentsByNews(
    newsId: string,
    sortBy: CommentSort = 'newest',
    currentUserId?: string,
    manager?: EntityManager,
  ) {
    const commentRepository = manager
      ? manager.getRepository(CommentEntity)
      : this.dataSource.getRepository(CommentEntity);

    const likeRepository = manager
      ? manager.getRepository(CommentLikeEntity)
      : this.dataSource.getRepository(CommentLikeEntity);

    const query = commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select([
        'comment.commentId',
        'comment.newsId',
        'comment.userId',
        'comment.parentId',
        'comment.rootId',
        'comment.content',
        'comment.status',
        'comment.likes',
        'comment.createdAt',
      ])
      .addSelect([
        'user.userId',
        'user.username',
      ])
      .where('comment.newsId = :newsId', { newsId })
      .andWhere('comment.status <> :spam', {
        spam: 'spam',
      });

    if (sortBy === 'popular') {
      query
        .orderBy('comment.likes', 'DESC')
        .addOrderBy('comment.createdAt', 'DESC')
        .addOrderBy('comment.commentId', 'DESC');
    } else {
      query
        .orderBy('comment.createdAt', 'DESC')
        .addOrderBy('comment.commentId', 'DESC');
    }

    const comments = await query.getMany();

    // Mặc định chưa like nếu người xem chưa đăng nhập.
    const likedIds = new Set<string>();

    const commentIds = comments.map(
      (comment) => String(comment.commentId),
    );

    // Một truy vấn lấy tất cả lượt like của người hiện tại.
    if (currentUserId && commentIds.length > 0) {
      const likedRows = await likeRepository.find({
        select: {
          commentId: true,
        },
        where: {
          userId: currentUserId,
          commentId: In(commentIds),
        },
      });

      for (const row of likedRows) {
        likedIds.add(String(row.commentId));
      }
    }

    return comments.map((comment) => ({
      id: String(comment.commentId),
      newsId: String(comment.newsId),
      userId: String(comment.userId),

      parentId: comment.parentId
        ? String(comment.parentId)
        : null,

      rootId: comment.rootId
        ? String(comment.rootId)
        : null,

      content: comment.content,
      status: comment.status,
      likes: comment.likes,

      liked: currentUserId
        ? likedIds.has(String(comment.commentId))
        : false,

      createdAt: comment.createdAt,

      user: comment.user
        ? {
            id: String(comment.user.userId),
            username: comment.user.username,
             role: comment.user.role,
          }
        : null,
    }));
  }
}