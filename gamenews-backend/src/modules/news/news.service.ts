import sanitizeHtml from 'sanitize-html';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { NewsEntity } from './entities/news.entity/news.entity.js';
import { NewsTagEntity } from '../news-tags/entities/news-tag.entity/news-tag.entity.js';
import { ContentBlockEntity } from '../content-blocks/entities/content-block.entity/content-block.entity.js';
import { UserEntity } from '../users/entities/user.entity/user.entity.js';

import type { CreateNewsDto } from './dto/create-news.dto/create-news.dto.js';
import type { UpdateNewsDto } from './dto/update-news.dto/update-news.dto.js';
import type { QueryNewsDto } from './dto/query-news.dto/query-news.dto.js';

import { CommentEntity } from '../comments/entities/comment.entity/comment.entity.js';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { PublicNewsQueryDto } from './dto/public-news-query.dto/public-news-query.dto.js';
import { NotificationService } from '../notification/notification.service.js';
import { NewsView } from '../notification/entities/news-view.entity.js';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepo: Repository<NewsEntity>,

    @InjectRepository(NewsTagEntity)
    private readonly newsTagRepo: Repository<NewsTagEntity>,

    @InjectRepository(ContentBlockEntity)
    private readonly blockRepo: Repository<ContentBlockEntity>,

    private readonly dataSource: DataSource,
     private readonly notificationService: NotificationService,
  ) {}

  // =====================================================
  // HELPERS
  // =====================================================

  private async findOneOrFail(id: string): Promise<NewsEntity> {
    const news = await this.newsRepo.findOne({
      where: { newsId: id },
      relations: {
        category: true,
        author: true,
        reviewer: true,
        newsTags: { tag: true },
        contentBlocks: true,
      },
    });

    if (!news) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return news;
  }

  private isStaff(user: UserEntity): boolean {
    return (
      user.role === 'admin' ||
      user.role === 'editor' ||
      user.role === 'super_admin'
    );
  }

  private assertStaff(user: UserEntity): void {
    if (!this.isStaff(user)) {
      throw new ForbiddenException(
        'Chỉ admin/editor được thực hiện thao tác này',
      );
    }
  }

  private assertAssignedReviewer(
    news: NewsEntity,
    user: UserEntity,
  ): void {
    this.assertStaff(user);

    if (news.reviewerId !== user.userId) {
      throw new ForbiddenException(
        'Bạn không được phân công xử lý bài này',
      );
    }
  }

  /**
   * Quyền chỉnh sửa:
   * - Author: chỉ sửa bài của mình ở draft hoặc returned.
   * - Staff: sửa draft/returned.
   * - Staff ở processing: phải là reviewer được phân công.
   */
  private assertCanEdit(
    news: NewsEntity,
    user: UserEntity,
  ): void {
    if (user.role === 'author') {
      if (news.authorId !== user.userId) {
        throw new ForbiddenException(
          'Không có quyền thao tác bài viết này',
        );
      }

      if (!['draft', 'returned'].includes(news.status)) {
        throw new ForbiddenException(
          'Tác giả chỉ được sửa bài nháp hoặc bài bị trả về',
        );
      }

      return;
    }

    if (this.isStaff(user)) {
      if (news.status === 'processing') {
        this.assertAssignedReviewer(news, user);
        return;
      }

      if (!['draft', 'returned'].includes(news.status)) {
        throw new BadRequestException(
          'Không thể chỉnh sửa bài viết ở trạng thái này',
        );
      }

      return;
    }

    throw new ForbiddenException(
      'Không có quyền chỉnh sửa bài viết này',
    );
  }

  /**
   * Quyền xóa:
   * - Tác giả hoặc reviewer được phân công.
   * - Chỉ xóa khi bài ở draft hoặc processing.
   */
  private assertCanDelete(
    news: NewsEntity,
    user: UserEntity,
  ): void {
    const isAuthor = news.authorId === user.userId;
    const isReviewer = news.reviewerId === user.userId;

    if (!isAuthor && !isReviewer) {
      throw new ForbiddenException(
        'Chỉ tác giả hoặc người review mới được phép xóa bài viết này',
      );
    }

    if (!['draft', 'processing'].includes(news.status)) {
      throw new BadRequestException(
        'Không thể xóa bài ở trạng thái này',
      );
    }
  }

  /**
   * Đổi trạng thái bài viết.
   *
   * - Nếu trạng thái không đổi: giữ nguyên các ghi chú.
   * - Nếu trạng thái thay đổi: xóa editorNote và requirementNote cũ.
   * - Trường hợp returnToAuthor sẽ gán editorNote mới sau khi gọi hàm này.
   */
  private changeStatus(
    news: NewsEntity,
    nextStatus: NewsEntity['status'],
  ): void {
    if (news.status === nextStatus) {
      return;
    }

    news.editorNote = null;
    news.requirementNote = null;
    news.status = nextStatus;
  }

  private toResponse(news: NewsEntity) {
    return {
      news_id: news.newsId,
      title: news.title,
      slug: news.slug,
      summary: news.summary,

      category_id: news.categoryId,
      category: news.category
        ? {
            category_id: news.category.categoryId,
            name: news.category.name,
          }
        : null,

      author_id: news.authorId,
      author: this.toUserResponse(news.author),

      reviewer_id: news.reviewerId,
      reviewer: this.toUserResponse(news.reviewer),

      thumbnail: news.thumbnail,
      status: news.status,
      views: news.views,
      published_at: news.publishedAt,
      scheduled_at: news.scheduledAt,

      // Chỉ hiển thị ghi chú trả bài ở trạng thái returned.
      editor_note:
        news.status === 'returned'
          ? news.editorNote
          : null,

      // Không hiển thị yêu cầu chỉnh sửa khi bài returned.
      requirement_note:
        news.status !== 'returned'
          ? news.requirementNote
          : null,

      review_score: news.reviewScore,

      news_tags: (news.newsTags ?? []).map((newsTag) => ({
        news_id: newsTag.newsId,
        tag_id: newsTag.tagId,
        tag: newsTag.tag
          ? {
              tag_id: newsTag.tag.tagId,
              name: newsTag.tag.name,
            }
          : null,
      })),

      content_blocks: (news.contentBlocks ?? []).map((block) => ({
        block_id: block.blockId,
        news_id: block.newsId,
        type: block.type,
        content: block.content,
        position: block.position,
      })),
    };
  }

  private toUserResponse(
    user: UserEntity | null | undefined,
  ) {
    if (!user) {
      return null;
    }

    return {
      user_id: user.userId,
      username: user.username,
      email: user.email,
      created_at: user.createdAt,
    };
  }

  private createListQuery(): SelectQueryBuilder<NewsEntity> {
    return this.newsRepo
      .createQueryBuilder('news')
      .leftJoinAndSelect('news.category', 'category')
      .leftJoinAndSelect('news.author', 'author')
      .leftJoinAndSelect('news.reviewer', 'reviewer')
      .leftJoinAndSelect('news.newsTags', 'newsTags')
      .leftJoinAndSelect('newsTags.tag', 'tag')
      .leftJoinAndSelect('news.contentBlocks', 'contentBlock');
  }

  // =====================================================
  // FIND ALL
  // =====================================================

  async findAll(query: QueryNewsDto, user: UserEntity) {
    const page = Math.max(
      1,
      Math.trunc(Number(query.page) || 1),
    );

    const limit = Math.min(
      100,
      Math.max(1, Math.trunc(Number(query.limit) || 10)),
    );

    const search = query.search?.trim();
    const userId = user.userId;

    const rawFilter = query.filter;

    const filter =
      !rawFilter || String(rawFilter).trim() === 'all'
        ? undefined
        : rawFilter;

    const rawCategoryId = query.categoryId;
    const normalizedCategoryId = String(
      rawCategoryId ?? '',
    ).trim();

    const parsedCategoryId =
      normalizedCategoryId === '' ||
      normalizedCategoryId === 'all' ||
      normalizedCategoryId === '0'
        ? undefined
        : Number(normalizedCategoryId);

    const categoryId =
      parsedCategoryId !== undefined &&
      Number.isInteger(parsedCategoryId) &&
      parsedCategoryId > 0
        ? parsedCategoryId
        : undefined;

    const createBaseQuery = (): SelectQueryBuilder<NewsEntity> => {
      const qb = this.createListQuery();

      if (search) {
        qb.andWhere('news.title ILIKE :search', {
          search: `%${search}%`,
        });
      }

      return qb;
    };

    const applyCategoryFilter = (
      qb: SelectQueryBuilder<NewsEntity>,
      selectedCategoryId = categoryId,
    ): void => {
      if (selectedCategoryId !== undefined) {
        qb.andWhere('news.categoryId = :categoryId', {
          categoryId: selectedCategoryId,
        });
      }
    };

    const createCategoryQuery = (
      selectedCategoryId = categoryId,
    ): SelectQueryBuilder<NewsEntity> => {
      const qb = createBaseQuery();
      applyCategoryFilter(qb, selectedCategoryId);
      return qb;
    };

    const applyFilter = (
      qb: SelectQueryBuilder<NewsEntity>,
      selectedFilter?: QueryNewsDto['filter'],
    ): void => {
      switch (selectedFilter) {
        case 'published':
          qb.andWhere('news.status = :filterStatus', {
            filterStatus: 'published',
          });
          break;

        case 'mine':
          qb.andWhere('news.authorId = :userId', {
            userId,
          });
          break;

        case 'submitted':
          qb.andWhere('news.status = :filterStatus', {
            filterStatus: 'submitted',
          });
          break;

        case 'processing':
          qb
            .andWhere('news.reviewerId = :userId', {
              userId,
            })
            .andWhere('news.status = :filterStatus', {
              filterStatus: 'processing',
            });
          break;

        case 'scheduled':
          qb.andWhere('news.status = :filterStatus', {
            filterStatus: 'scheduled',
          });
          break;

        case 'draft':
          qb
            .andWhere('news.authorId = :userId', {
              userId,
            })
            .andWhere('news.status = :filterStatus', {
              filterStatus: 'draft',
            });
          break;

        case 'returned':
          qb
            .andWhere('news.authorId = :userId', {
              userId,
            })
            .andWhere('news.status = :filterStatus', {
              filterStatus: 'returned',
            });
          break;

        case 'required':
          qb
            .andWhere('news.requirementNote IS NOT NULL')
            .andWhere("TRIM(news.requirementNote) <> ''");
          break;

        default:
          break;
      }
    };

    // 1. Danh sách bài viết.
    const newsQb = createCategoryQuery();

    applyFilter(newsQb, filter);

    if (!filter && query.status) {
      newsQb.andWhere('news.status = :queryStatus', {
        queryStatus: query.status,
      });
    }

    const [entities, total] = await newsQb
      .clone()
      .orderBy('news.newsId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const items = entities.map((news) => this.toResponse(news));

    // 2. Badge filter.
    const filterKeys: NonNullable<QueryNewsDto['filter']>[] = [
      'published',
      'mine',
      'submitted',
      'processing',
      'scheduled',
      'draft',
      'returned',
      'required',
    ];

    const filterCounts = await Promise.all(
      filterKeys.map(async (key) => {
        const qb = createCategoryQuery();

        applyFilter(qb, key);

        return [key, await qb.getCount()] as const;
      }),
    );

    const allCount = await createCategoryQuery().getCount();

    const byFilter: Record<string, number> = {
      all: allCount,
      ...Object.fromEntries(filterCounts),
    };

    // 3. Badge category.
    const categoryQb = createBaseQuery();

    applyFilter(categoryQb, filter);

    if (!filter && query.status) {
      categoryQb.andWhere('news.status = :queryStatus', {
        queryStatus: query.status,
      });
    }

    const categoryRows = await categoryQb
      .select('news.categoryId', 'category_id')
      .addSelect('COUNT(DISTINCT news.newsId)', 'count')
      .groupBy('news.categoryId')
      .getRawMany<{
        category_id: number | string | null;
        count: string;
      }>();

    const byCategory: Record<string, number> = {};

    for (const row of categoryRows) {
      if (row.category_id != null) {
        byCategory[String(row.category_id)] = Number(row.count);
      }
    }

    const categoryTotalQb = createBaseQuery();

    applyFilter(categoryTotalQb, filter);

    if (!filter && query.status) {
      categoryTotalQb.andWhere('news.status = :queryStatus', {
        queryStatus: query.status,
      });
    }

    const categoryTotal = await categoryTotalQb.getCount();

    // 4. Badge trạng thái.
    const statusRows = await createCategoryQuery()
      .select('news.status', 'status')
      .addSelect('COUNT(DISTINCT news.newsId)', 'count')
      .groupBy('news.status')
      .getRawMany<{
        status: string;
        count: string;
      }>();

    const byStatus: Record<string, number> = {
      draft: 0,
      submitted: 0,
      processing: 0,
      published: 0,
      scheduled: 0,
      returned: 0,
    };

    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      counts: {
        all: allCount,
        byFilter,
        byCategory,
        categoryTotal,
        byStatus,
      },
    };
  }

  // =====================================================
  // FIND ONE
  // =====================================================

  async findOne(id: string, user: UserEntity) {
    const news = await this.createListQuery()
      .andWhere('news.newsId = :id', { id })
      .getOne();

    if (!news) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    return this.toResponse(news);
  }

  // =====================================================
  // CREATE
  // =====================================================
private sanitizeBlockContent(
  type: string,
  content: string,
): string {
  if (typeof content !== 'string') {
    throw new BadRequestException(
      'Nội dung block phải là chuỗi',
    );
  }

  // Image/video chỉ lưu URL hoặc đường dẫn.
  if (type === 'image' || type === 'video') {
    const value = content.trim();

    if (!value) {
      throw new BadRequestException(
        'URL hình ảnh hoặc video không được để trống',
      );
    }

    return value;
  }

  const allowedTagsByType: Record<string, string[]> = {
    paragraph: [
      'strong', // In đậm
      'em',     // In nghiêng
      'u',      // Gạch chân
      'a',      // Liên kết
    ],

    heading1: [
      'em',     // Chỉ in nghiêng
    ],

    heading2: [
      'em',     // Chỉ in nghiêng
    ],
     quote: [],
  };

  const allowedTags = allowedTagsByType[type];

  if (!allowedTags) {
    throw new BadRequestException(
      `Loại content block không hợp lệ: ${type}`,
    );
  }

  const cleanContent = sanitizeHtml(content, {
    allowedTags,

    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },

    allowedSchemes: [
      'http',
      'https',
      'mailto',
    ],

    // Không cho phép URL dạng //example.com.
    allowProtocolRelative: false,
  });

  if (!cleanContent.trim()) {
    throw new BadRequestException(
      'Nội dung block không hợp lệ',
    );
  }

  return cleanContent;
}
async create(dto: CreateNewsDto, user: UserEntity) {
  const savedNews = await this.dataSource.transaction(async (manager) => {
    const newsRepo = manager.getRepository(NewsEntity);
    const tagRepo = manager.getRepository(NewsTagEntity);
    const blockRepo = manager.getRepository(ContentBlockEntity);

    const initialStatus = dto.status ?? 'draft';

    const news = newsRepo.create({
      title: dto.title,
      slug: dto.slug,
      summary: dto.summary ?? null,
      categoryId: String(dto.categoryId),
      authorId: user.userId,
      reviewerId: dto.reviewerId ?? null,
      thumbnail: dto.thumbnail ?? null,
      status: initialStatus,
      views: '0',
      publishedAt: initialStatus === 'published' ? new Date() : null,
      scheduledAt: initialStatus === 'scheduled' ? dto.scheduledAt : null,
      editorNote: null,
      requirementNote: null,
      reviewScore: dto.reviewScore ?? null,
    });

    const saved = await newsRepo.save(news);

    if (dto.tagIds?.length) {
      const uniqueTagIds = [...new Set(dto.tagIds)];

      await tagRepo.save(
        uniqueTagIds.map(tagId =>
          tagRepo.create({
            newsId: saved.newsId,
            tagId: String(tagId),
          }),
        ),
      );
    }

    if (dto.contentBlocks?.length) {
      const blocks = dto.contentBlocks.map(block =>
        blockRepo.create({
          newsId: saved.newsId,
          type: block.type,
          content: this.sanitizeBlockContent(block.type, block.content),
          position: block.position,
        }),
      );

      await blockRepo.save(blocks);
    }

    return saved;
  });

  // Chỉ thông báo khi bài viết được xuất bản hoặc lên lịch
  if (savedNews.status === 'published' || savedNews.status === 'scheduled') {
    await this.notificationService.createActivity(
      'NEWS',
      `${user.username} đã ${
        savedNews.status === 'published' ? 'xuất bản' : 'lên lịch'
      } bài viết "${savedNews.title}".`,
    );
  }

  return savedNews;
}
  // =====================================================
  // UPDATE
  // =====================================================

async update(
  id: string,
  dto: UpdateNewsDto,
  user: UserEntity,
) {
  const news = await this.findOneOrFail(id);

  // Kiểm tra quyền sửa theo trạng thái hiện tại.
  this.assertCanEdit(news, user);
const previousStatus = news.status;
const updatedNews = await this.dataSource.transaction(async (manager) => {
  const repo = manager.getRepository(NewsEntity);
  const tagRepo = manager.getRepository(NewsTagEntity);
  const blockRepo = manager.getRepository(ContentBlockEntity);

  // Cập nhật thông tin cơ bản
  if (dto.title !== undefined) {
    news.title = dto.title;
  }

  if (dto.slug !== undefined) {
    news.slug = dto.slug;
  }

  if (dto.summary !== undefined) {
    news.summary = dto.summary;
  }

  if (dto.categoryId !== undefined) {
    news.categoryId = String(dto.categoryId);
  }

  if (dto.thumbnail !== undefined) {
    news.thumbnail = dto.thumbnail;
  }

  // Cập nhật điểm đánh giá
  if (dto.reviewScore !== undefined) {
    news.reviewScore = dto.reviewScore;
  }

  // Chỉ staff mới được đổi status qua update.
  if (dto.status !== undefined && this.isStaff(user)) {
    this.changeStatus(news, dto.status);

    if (
      previousStatus !== dto.status &&
      dto.status === 'published'
    ) {
      news.publishedAt = new Date();
      news.scheduledAt = null;
    }
  }

  // Lưu thông tin bài viết
  await repo.save(news);

  // Cập nhật tags
  if (dto.tagIds !== undefined) {
    await tagRepo.delete({ newsId: id });

    const uniqueTagIds = [...new Set(dto.tagIds)];

    if (uniqueTagIds.length > 0) {
      await tagRepo.save(
        uniqueTagIds.map((tagId) =>
          tagRepo.create({
            newsId: id,
            tagId: String(tagId),
          }),
        ),
      );
    }
  }

  // Cập nhật content blocks
  if (dto.contentBlocks !== undefined) {
    await blockRepo.delete({ newsId: id });

    if (dto.contentBlocks.length > 0) {
      const blocks = dto.contentBlocks.map((block) =>
        blockRepo.create({
          newsId: id,
          type: block.type,
          content: this.sanitizeBlockContent(
            block.type,
            block.content,
          ),
          position: block.position,
        }),
      );

      await blockRepo.save(blocks);
    }
  }

  return this.findOneOrFail(id);
});

// Chỉ gửi thông báo khi trạng thái thay đổi sang published hoặc scheduled.
if (
  previousStatus !== updatedNews.status &&
  ['published', 'scheduled'].includes(updatedNews.status)
) {
  await this.notificationService.createActivity(
    'NEWS',
    `${user.username} đã ${
      updatedNews.status === 'published'
        ? 'xuất bản'
        : 'lên lịch'
    } bài viết "${updatedNews.title}".`,
  );
}

return updatedNews;
}

  // =====================================================
  // REMOVE
  // =====================================================

async remove(id: string, user: UserEntity) {
  const news = await this.findOneOrFail(id);

  this.assertCanDelete(news, user);

  // Lấy đường dẫn ảnh trước khi xóa dữ liệu.
  const imageUrls = [
    news.thumbnail,
    ...(news.contentBlocks ?? [])
      .filter((block) => block.type === 'image')
      .map((block) => block.content),
  ];

  await this.dataSource.transaction(async (manager) => {
    await manager.delete(ContentBlockEntity, {
      news: { newsId: news.newsId },
    });

    await manager.delete(CommentEntity, {
      news: { newsId: news.newsId },
    });

    await manager.delete(NewsTagEntity, {
      news: { newsId: news.newsId },
    });

    await manager.delete(NewsEntity, {
      newsId: news.newsId,
    });
  });

  // Chỉ xóa file sau khi transaction database thành công.
  await this.deleteUploadFiles(imageUrls);

  return { message: 'Đã xóa bài viết' };
}

private getUploadFilePath(url: string | null | undefined): string | null {
  if (!url) return null;

  // Chỉ xử lý ảnh thuộc thư mục uploads/news.
  const normalized = url.replace(/\\/g, '/');
  const match = normalized.match(/(?:^|\/)uploads\/news\/([^/?#]+)$/);

  if (!match) return null;

  const filename = basename(match[1]);

  // Chặn tên file không hợp lệ.
  if (!filename || filename === '.' || filename === '..') {
    return null;
  }

  return join(process.cwd(), 'uploads', 'news', filename);
}

private async deleteUploadFiles(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const paths = new Set(
    urls
      .map((url) => this.getUploadFilePath(url))
      .filter((path): path is string => path !== null),
  );

  await Promise.all(
    [...paths].map(async (path) => {
      try {
        await unlink(path);
      } catch (error) {
        // File không tồn tại thì bỏ qua.
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return;
        }

        // Ghi nhận lỗi để không âm thầm bỏ sót file.
        throw error;
      }
    }),
  );
}


  // =====================================================
  // APPLY: SUBMITTED -> PROCESSING
  // =====================================================

  async apply(id: string, user: UserEntity) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    if (news.status !== 'submitted') {
      throw new BadRequestException(
        'Bài viết không ở trạng thái chờ duyệt',
      );
    }

    this.changeStatus(news, 'processing');
    news.reviewerId = user.userId;

    return this.newsRepo.save(news);
  }

  // =====================================================
  // PUBLISH
  // =====================================================

  async publish(id: string, user: UserEntity) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    if (news.status === 'processing') {
      this.assertAssignedReviewer(news, user);
    } else if (
      !['scheduled', 'draft', 'returned'].includes(news.status)
    ) {
      throw new BadRequestException(
        'Không thể xuất bản bài viết ở trạng thái này',
      );
    }

    this.changeStatus(news, 'published');

    news.publishedAt = new Date();
    news.scheduledAt = null;
    news.reviewerId = user.userId;

const savedNews = await this.newsRepo.save(news);

  await this.notificationService.createActivity(
    'NEWS',
    `${user.username} đã xuất bản bài viết "${savedNews.title}".`,
  );

  return savedNews;
  }

  // =====================================================
  // SUBMIT: DRAFT / RETURNED -> SUBMITTED / PROCESSING
  // =====================================================

  async submit(id: string, user: UserEntity) {
    const news = await this.findOneOrFail(id);

    if (news.authorId !== user.userId) {
      throw new ForbiddenException(
        'Chỉ tác giả bài viết mới được gửi duyệt',
      );
    }

    if (!['draft', 'returned'].includes(news.status)) {
      throw new BadRequestException(
        'Chỉ có thể gửi duyệt bài nháp hoặc bài bị trả về',
      );
    }

    const nextStatus =
      news.status === 'returned' && news.reviewerId
        ? 'processing'
        : 'submitted';

    this.changeStatus(news, nextStatus);

    return this.newsRepo.save(news);
  }

  // =====================================================
  // UNSUBMIT: SUBMITTED -> DRAFT
  // =====================================================

  async unsubmit(id: string, user: UserEntity) {
    const news = await this.findOneOrFail(id);

    if (
      user.role !== 'author' ||
      news.authorId !== user.userId
    ) {
      throw new ForbiddenException(
        'Chỉ tác giả của bài mới được hủy gửi duyệt',
      );
    }

    if (news.status !== 'submitted') {
      throw new BadRequestException(
        'Bài viết không ở trạng thái chờ duyệt',
      );
    }

    this.changeStatus(news, 'draft');

    return this.newsRepo.save(news);
  }

  // =====================================================
  // RETURN: PROCESSING -> RETURNED
  // =====================================================

  async returnToAuthor(
    id: string,
    note: string,
    user: UserEntity,
  ) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    this.assertAssignedReviewer(news, user);

    if (news.status !== 'processing') {
      throw new BadRequestException(
        'Chỉ có thể trả bài đang xử lý',
      );
    }

    if (!note?.trim()) {
      throw new BadRequestException(
        'Ghi chú trả bài không được để trống',
      );
    }

    this.changeStatus(news, 'returned');

    // Lưu ghi chú trả bài mới.
    news.editorNote = note.trim();

    // Không giữ yêu cầu chỉnh sửa cũ khi trả bài.
    news.requirementNote = null;

    return this.newsRepo.save(news);
  }

  // =====================================================
  // REQUIRE EDIT
  // =====================================================

  async requireEdit(
    id: string,
    note: string,
    user: UserEntity,
  ) {
    const news = await this.findOneOrFail(id);

    const isAuthor = news.authorId === user.userId;
    const isReviewer = news.reviewerId === user.userId;

    let canRequire = false;

    if (
      news.status === 'published' ||
      news.status === 'scheduled'
    ) {
      canRequire = user.role === 'author' && isAuthor;
    } else if (news.status === 'processing') {
      canRequire =
        isAuthor &&
        news.reviewerId !== null &&
        !isReviewer;
    }

    if (!canRequire) {
      throw new ForbiddenException(
        'Bạn không có quyền gửi yêu cầu chỉnh sửa cho bài viết này',
      );
    }

    if (!note?.trim()) {
      throw new BadRequestException(
        'Nội dung yêu cầu không được để trống',
      );
    }

    news.requirementNote = note.trim();

    return this.newsRepo.save(news);
  }

  // =====================================================
  // UNREQUIRE
  // =====================================================

  async unrequire(id: string, user: UserEntity) {
    const news = await this.findOneOrFail(id);

    const isAuthor = news.authorId === user.userId;
    const isReviewer = news.reviewerId === user.userId;

    let canUnrequire = false;

    if (
      news.status === 'published' ||
      news.status === 'scheduled'
    ) {
      canUnrequire = user.role === 'author' && isAuthor;
    } else if (news.status === 'processing') {
      canUnrequire =
        isAuthor &&
        news.reviewerId !== null &&
        !isReviewer;
    }

    if (!canUnrequire) {
      throw new ForbiddenException(
        'Bạn không có quyền hủy yêu cầu',
      );
    }

    news.requirementNote = null;

    return this.newsRepo.save(news);
  }

  // =====================================================
  // SCHEDULE
  // =====================================================

  async schedule(
    id: string,
    scheduledAt: string,
    user: UserEntity,
  ) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    if (news.status === 'processing') {
      this.assertAssignedReviewer(news, user);
    } else if (
      !['draft', 'returned'].includes(news.status)
    ) {
      throw new BadRequestException(
        'Không thể lên lịch bài này',
      );
    }

    const date = new Date(scheduledAt);

    if (
      !scheduledAt ||
      Number.isNaN(date.getTime()) ||
      date.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Thời gian lên lịch phải ở tương lai',
      );
    }

    this.changeStatus(news, 'scheduled');

    news.scheduledAt = date;
    news.reviewerId = user.userId;

     const savedNews = await this.newsRepo.save(news);

  await this.notificationService.createActivity(
    'NEWS',
    `${user.username} đã lên lịch bài viết "${savedNews.title}".`,
  );

  return savedNews;
  }

  // =====================================================
  // UNSCHEDULE: SCHEDULED -> PROCESSING
  // =====================================================

  async unschedule(id: string, user: UserEntity) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    if (news.status !== 'scheduled') {
      throw new BadRequestException(
        'Bài viết chưa được lên lịch',
      );
    }

    this.changeStatus(news, 'processing');

    news.scheduledAt = null;
    news.reviewerId = user.userId;

    return this.newsRepo.save(news);
  }

  // =====================================================
  // UNPUBLISH: PUBLISHED -> PROCESSING
  // =====================================================

  async unpublish(id: string, user: UserEntity) {
    this.assertStaff(user);

    const news = await this.findOneOrFail(id);

    if (news.status !== 'published') {
      throw new BadRequestException(
        'Bài viết chưa được đăng',
      );
    }

    this.changeStatus(news, 'processing');

    news.reviewerId = user.userId;
    news.scheduledAt = null;

    // Giữ publishedAt để lưu lại thời điểm đăng gần nhất.
    return this.newsRepo.save(news);
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  async getDashboardStats() {
    // 1. Thống kê trạng thái bài viết.
    const statusRows = await this.newsRepo
      .createQueryBuilder('news')
      .select('news.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('news.status')
      .getRawMany<{
        status: string;
        count: string;
      }>();

    const byStatus: Record<string, number> = {
      draft: 0,
      submitted: 0,
      processing: 0,
      scheduled: 0,
      published: 0,
      returned: 0,
    };

    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    const total = statusRows.reduce(
      (sum, row) => sum + Number(row.count),
      0,
    );

    // 2. Tổng lượt xem của bài đã xuất bản.
    const viewsRow = await this.newsRepo
      .createQueryBuilder('news')
      .select(
        'COALESCE(SUM(CAST(news.views AS BIGINT)), 0)',
        'totalViews',
      )
      .where('news.status = :status', {
        status: 'published',
      })
      .getRawOne<{ totalViews: string }>();

    const totalViews = Number(
      viewsRow?.totalViews ?? 0,
    );

    // 3. Top 10 bài xuất bản trong 7 ngày gần nhất.
    const now = new Date();

    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const topNewsRows = await this.newsRepo
      .createQueryBuilder('news')
      .leftJoin('news.category', 'category')
      .leftJoin('news.author', 'author')
      .select('news.newsId', 'news_id')
      .addSelect('news.title', 'title')
      .addSelect('news.slug', 'slug')
      .addSelect('news.thumbnail', 'thumbnail')
      .addSelect('news.views', 'views')
      .addSelect('news.publishedAt', 'published_at')
      .addSelect('category.categoryId', 'category_id')
      .addSelect('category.name', 'category_name')
      .addSelect('author.userId', 'author_id')
      .addSelect('author.username', 'author_username')
      .where('news.status = :status', {
        status: 'published',
      })
      .andWhere('news.publishedAt IS NOT NULL')
      .andWhere('news.publishedAt >= :sevenDaysAgo', {
        sevenDaysAgo,
      })
      .andWhere('news.publishedAt <= :now', {
        now,
      })
      .orderBy('CAST(news.views AS BIGINT)', 'DESC')
      .addOrderBy('news.publishedAt', 'DESC')
      .take(10)
      .getRawMany<{
        news_id: number | string;
        title: string;
        slug: string;
        thumbnail: string | null;
        views: number | string | null;
        published_at: Date | string | null;
        category_id: number | string | null;
        category_name: string | null;
        author_id: number | string | null;
        author_username: string | null;
      }>();

    const topViewed = topNewsRows.map((row) => ({
      news_id: row.news_id,
      title: row.title,
      slug: row.slug,
      thumbnail: row.thumbnail,
      views: Number(row.views ?? 0),
      published_at: row.published_at,

      category:
        row.category_id != null
          ? {
              category_id: row.category_id,
              name: row.category_name ?? '',
            }
          : null,

      author:
        row.author_id != null
          ? {
              user_id: row.author_id,
              username: row.author_username ?? '',
            }
          : null,
    }));

    return {
      total,
      draft: byStatus['draft'],
      submitted: byStatus['submitted'],
      processing: byStatus['processing'],
      scheduled: byStatus['scheduled'],
      published: byStatus['published'],
      returned: byStatus['returned'],
      totalViews,
      topViewed,
    };
  }


  /*
    Danh sách bài viết công khai.
   */
  async getPublicListing(dto: PublicNewsQueryDto) {
    const page = this.normalizePage(dto.page);
    const limit = this.normalizeLimit(dto.limit);
    const minScore = this.normalizeScore(dto.minScore);

    const query = this.createPublicQuery();

    this.applyPageTypeFilter(query, dto.pageType);

    if (dto.category?.trim()) {
      query.andWhere(
        'category.name = :categoryName',
        { categoryName: dto.category.trim() },
      );
    }

    if (minScore !== undefined) {
      query.andWhere(
        'news.reviewScore > = :minScore',
        { minScore },
      );
    }

    const [items, total] = await query
      .orderBy('news.publishedAt', 'DESC')
      .addOrderBy('news.newsId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((item) => this.toPublicItem(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /*
    Tìm kiếm bài viết.
   */
  async searchPublicNews(dto: PublicNewsQueryDto) {
    const keyword = dto.q?.trim();

    if (!keyword) {
      return {
        items: [],
        total: 0,
        page: this.normalizePage(dto.page),
        limit: this.normalizeLimit(dto.limit),
        totalPages: 0,
        categories: [],
      };
    }

    const page = this.normalizePage(dto.page);
    const limit = this.normalizeLimit(dto.limit);

    const baseQuery = this.createPublicQuery();

    this.applyKeywordFilter(baseQuery, keyword);

    // Danh mục được lọc ở DB trước khi phân trang.
    if (dto.category?.trim()) {
      baseQuery.andWhere(
        'category.name = :categoryName',
        { categoryName: dto.category.trim() },
      );
    }

    const [items, total] = await baseQuery
      .orderBy('news.publishedAt', 'DESC')
      .addOrderBy('news.newsId', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Lấy các danh mục của toàn bộ kết quả tìm kiếm,
    // không chỉ danh mục xuất hiện trong trang hiện tại.
    const categoryQuery = this.newsRepo
      .createQueryBuilder('news')
      .innerJoin('news.category', 'category')
      .leftJoin('news.author', 'author')
      .select('category.name', 'name')
      .where('news.status = :status', {
        status: 'published',
      });

    this.applyKeywordFilter(categoryQuery, keyword);

    const categoryRows = await categoryQuery
      .distinct(true)
      .orderBy('category.name', 'ASC')
      .getRawMany<{ name: string }>();

    return {
      items: items.map((item) => this.toPublicItem(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories: categoryRows.map((row) => row.name),
    };
  }

  /*
    Danh sách bài thịnh hành theo lượt xem.
   */
  async getTrending(limit = 5) {
    const safeLimit = Math.min(
      10,
      Math.max(1, Math.trunc(Number(limit) || 5)),
    );

    const items = await this.createPublicQuery()
      .orderBy('news.views', 'DESC')
      .addOrderBy('news.publishedAt', 'DESC')
      .addOrderBy('news.newsId', 'DESC')
      .take(safeLimit)
      .getMany();

    return items.map((item) => this.toPublicItem(item));
  }

  /*
    Query dùng chung cho các trang công khai.
   */
  private createPublicQuery(): SelectQueryBuilder<NewsEntity> {
    return this.newsRepo
      .createQueryBuilder('news')
      .leftJoin('news.category', 'category')
      .leftJoin('news.author', 'author')
      .select([
        'news.newsId',
        'news.title',
        'news.slug',
        'news.summary',
        'news.thumbnail',
        'news.views',
        'news.publishedAt',
        'news.reviewScore',
        'category.categoryId',
        'category.name',
        'author.userId',
        'author.username',
      ])
      .where('news.status = :status', {
        status: 'published',
      });
  }

  private applyKeywordFilter(
    query: SelectQueryBuilder<NewsEntity>,
    keyword: string,
  ): void {
    // Escape ký tự LIKE để % và _ trong từ khóa
    // được xem là ký tự thông thường.
    const escaped = keyword.replace(/[\\%_]/g, '\\$&');
    const pattern = `%${escaped}%`;

    query.andWhere(
      `(
        news.title ILIKE :keyword ESCAPE '\\'
        OR news.summary ILIKE :keyword ESCAPE '\\'
        OR category.name ILIKE :keyword ESCAPE '\\'
        OR author.username ILIKE :keyword ESCAPE '\\'
      )`,
      { keyword: pattern },
    );
  }

  private applyPageTypeFilter(
    query: SelectQueryBuilder<NewsEntity>,
    pageType?: string,
  ): void {
    const type = pageType?.trim();

    if (!type || type === 'Tất cả') {
      return;
    }

    // Dùng đúng tên category.name lưu trong database.
    query.andWhere(
      'category.name = :pageType',
      { pageType: type },
    );
  }

  private toPublicItem(news: NewsEntity) {
    return {
      newsId: String(news.newsId),
      title: news.title,
      slug: news.slug,
      summary: news.summary ?? '',
      category: news.category
        ? {
            name: news.category.name,
          }
        : null,
      author: news.author
        ? {
            username: news.author.username,
          }
        : null,
      publishedAt: news.publishedAt,
      thumbnail: news.thumbnail ?? '',
      views: String(news.views ?? 0),
      reviewScore:
        news.reviewScore == null
          ? null
          : Number(news.reviewScore),
    };
  }

  private normalizePage(value?: number): number {
    const page = Number(value ?? 1);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page phải lớn hơn hoặc bằng 1');
    }

    return page;
  }

  private normalizeLimit(value?: number): number {
    const limit = Number(value ?? 6);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException('limit phải lớn hơn hoặc bằng 1');
    }

    return Math.min(limit, 20);
  }

  private normalizeScore(value?: number): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const score = Number(value);

    if (!Number.isFinite(score) || score < 0 || score > 10) {
      throw new BadRequestException(
        'minScore phải nằm trong khoảng từ 0 đến 10',
      );
    }

    return score;
  }
/**
 * Ghi nhận lượt xem bài viết.
 *
 * Mỗi userId hoặc visitorId chỉ được tính
 * một lượt xem duy nhất cho cùng một bài viết.
 */
private async recordNewsView(
  newsId: string,
  userId: string | null = null,
): Promise<boolean> {
  console.log('\n========== RECORD NEWS VIEW ==========');
  console.log('[recordNewsView] newsId:', newsId);
  console.log('[recordNewsView] userId:', userId);
  console.log('[recordNewsView] userId type:', typeof userId);

  // 1. Kiểm tra đăng nhập.
  if (!userId) {
    console.warn(
      '[recordNewsView] Không ghi nhận lượt xem vì userId = null hoặc undefined',
    );

    return false;
  }

  try {
    // 2. Ghi nhận lượt xem trong transaction.
    const isNewView = await this.dataSource.transaction(
      async (manager) => {
        console.log('[recordNewsView] Bắt đầu transaction');

        const result = await manager.query(
          `
            INSERT INTO news_views (news_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (news_id, user_id)
            WHERE user_id IS NOT NULL
            DO NOTHING
            RETURNING id
          `,
          [newsId, userId],
        );

        console.log(
          '[recordNewsView] Kết quả INSERT news_views:',
          result,
        );

        // 3. Nếu không có bản ghi mới thì tài khoản đã xem bài viết này.
        if (result.length === 0) {
          console.warn(
            '[recordNewsView] Tài khoản đã xem bài viết này trước đó. Không tăng views.',
          );

          return false;
        }

        console.log(
          '[recordNewsView] Đã tạo lượt xem mới, bắt đầu tăng views',
        );

        // 4. Tăng tổng lượt xem của bài viết.
        const updateResult = await manager
          .getRepository(NewsEntity)
          .increment(
            { newsId },
            'views',
            1,
          );

        console.log(
          '[recordNewsView] Kết quả tăng views:',
          updateResult,
        );

        console.log(
          '[recordNewsView] Transaction hoàn tất thành công',
        );

        return true;
      },
    );

    console.log('[recordNewsView] isNewView:', isNewView);

    // 5. Chỉ cập nhật thống kê khi có lượt xem mới.
    if (isNewView) {
      console.log(
        '[recordNewsView] Gửi cập nhật daily views',
      );

      await this.notificationService.updateDailyViews();

      console.log(
        '[recordNewsView] Đã gọi updateDailyViews thành công',
      );
    }

    console.log('========== END RECORD NEWS VIEW ==========\n');

    return isNewView;
  } catch (error) {
    console.error(
      '[recordNewsView] LỖI KHI GHI NHẬN LƯỢT XEM:',
      error,
    );

    throw error;
  }
}
async findDetail(
  id: string,
  userId: string | null = null,
) {
  console.log('\n========== FIND NEWS DETAIL ==========');
  console.log('[findDetail] id:', id);
  console.log('[findDetail] userId nhận được:', userId);
  console.log('[findDetail] userId type:', typeof userId);

  // 1. Kiểm tra ID.
  if (!/^[1-9]\d*$/.test(id)) {
    console.warn('[findDetail] ID bài viết không hợp lệ:', id);

    throw new NotFoundException('ID bài viết không hợp lệ');
  }

  // 2. Tìm bài viết.
  const news = await this.newsRepo.findOne({
    where: {
      newsId: id,
      status: 'published',
    },
    relations: {
      author: true,
      category: true,
      newsTags: {
        tag: true,
      },
    },
  });

  if (!news) {
    console.warn('[findDetail] Không tìm thấy bài viết:', id);

    throw new NotFoundException('Không tìm thấy bài viết');
  }

  console.log('[findDetail] Tìm thấy bài viết:', news.newsId);
  console.log('[findDetail] Trước khi ghi lượt xem:', news.views);

  // 3. Ghi nhận lượt xem theo tài khoản.
  const isNewView = await this.recordNewsView(
    news.newsId,
    userId,
  );

  console.log('[findDetail] Kết quả ghi nhận lượt xem:', isNewView);

  // 4. Lấy tổng lượt xem mới nhất.
  const updatedNews = await this.newsRepo.findOne({
    where: {
      newsId: id,
    },
    select: {
      newsId: true,
      views: true,
    },
  });

  console.log(
    '[findDetail] Views sau khi ghi nhận:',
    updatedNews?.views,
  );

  // 5. Lấy nội dung bài viết.
  const blocks = await this.blockRepo.find({
    where: {
      newsId: id,
    },
    order: {
      position: 'ASC',
      blockId: 'ASC',
    },
  });

  console.log('[findDetail] Số lượng content blocks:', blocks.length);
  console.log('========== END FIND NEWS DETAIL ==========\n');

  // 6. Trả về dữ liệu.
  return {
    id: String(news.newsId),
    title: news.title,
    slug: news.slug,
    summary: news.summary,
    thumbnail: news.thumbnail,
    status: news.status,

    views: Number(updatedNews?.views ?? news.views ?? 0),

    reviewScore: news.reviewScore,
    publishedAt: news.publishedAt,

    author: news.author
      ? {
          id: String(news.author.userId),
          username: news.author.username,
        }
      : null,

    category: news.category
      ? {
          id: String(news.category.categoryId),
          name: news.category.name,
        }
      : null,

    tags: (news.newsTags ?? [])
      .filter((newsTag) => newsTag.tag)
      .map((newsTag) => ({
        id: String(newsTag.tag.tagId),
        name: newsTag.tag.name,
      })),

    contentBlocks: blocks.map((block) => ({
      id: String(block.blockId),
      type: block.type,
      content: block.content,
      position: block.position,
    })),
  };
}
async findRelated(
  id: string,
  page = 1,
  limit = 6,
) {
  if (!/^[1-9]\d*$/.test(id)) {
    throw new NotFoundException('ID bài viết không hợp lệ');
  }

  page = Math.max(1, Math.floor(Number(page) || 1));
  limit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 6)),
  );

  const currentNews = await this.newsRepo.findOne({
    where: {
      newsId: id,
      status: 'published',
    },
    relations: {
      newsTags: {
        tag: true,
      },
    },
  });

  if (!currentNews) {
    throw new NotFoundException('No find News');
  }

  const tagIds = (currentNews.newsTags ?? [])
    .filter((newsTag) => newsTag.tag)
    .map((newsTag) => newsTag.tag.tagId);

  const baseQuery = () =>
    this.newsRepo
      .createQueryBuilder('news')
      .where('news.status = :status', {
        status: 'published',
      })
      .andWhere('news.categoryId = :categoryId', {
        categoryId: currentNews.categoryId,
      })
      .andWhere('news.newsId != :currentId', {
        currentId: id,
      });

  const total = await baseQuery().getCount();

  const query = baseQuery()
    .leftJoin('news.newsTags', 'relatedNewsTag');

  if (tagIds.length > 0) {
    query
      .addSelect(
        `COUNT(
          DISTINCT CASE
            WHEN "relatedNewsTag"."tag_id" IN (:...tagIds)
            THEN "relatedNewsTag"."tag_id"
          END
        )`,
        'matchedTagCount',
      )
      .setParameter('tagIds', tagIds)
      .groupBy('news.newsId')
      .orderBy('"matchedTagCount"', 'DESC');
  } else {
    query
      .addSelect('0', 'matchedTagCount')
      .groupBy('news.newsId');
  }

  query
    .addOrderBy('news.publishedAt', 'DESC', 'NULLS LAST')
    .addOrderBy('news.newsId', 'DESC')
    .offset((page - 1) * limit)
    .limit(limit);

  const { entities } = await query.getRawAndEntities();

  const itemIds = entities.map((item) => item.newsId);

  const detailedItems = itemIds.length
    ? await this.newsRepo.find({
        where: itemIds.map((newsId) => ({
          newsId,
          status: 'published',
        })),
        relations: {
          author: true,
          category: true,
          newsTags: {
            tag: true,
          },
        },
      })
    : [];


  const itemMap = new Map(
    detailedItems.map((item) => [
      String(item.newsId),
      item,
    ]),
  );

  const orderedItems = entities
    .map((item) => itemMap.get(String(item.newsId)))
    .filter((item) => item !== undefined);

  return {
    items: orderedItems.map((news) => ({
      id: String(news.newsId),
      title: news.title,
      slug: news.slug,
      summary: news.summary,
      thumbnail: news.thumbnail,
      publishedAt: news.publishedAt,

      author: news.author
        ? {
            id: String(news.author.userId),
            username: news.author.username,
          }
        : null,

      category: news.category
        ? {
            id: String(news.category.categoryId),
            name: news.category.name,
          }
        : null,

      tags: (news.newsTags ?? [])
        .filter((newsTag) => newsTag.tag)
        .map((newsTag) => ({
          id: String(newsTag.tag.tagId),
          name: newsTag.tag.name,
        })),
    })),

    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
}