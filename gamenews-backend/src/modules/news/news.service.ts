
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

  async create(dto: CreateNewsDto, user: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
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
        publishedAt:
          initialStatus === 'published'
            ? new Date()
            : null,
        scheduledAt: null,
        editorNote: null,
        requirementNote: null,
        reviewScore: null,
      });

      const saved = await newsRepo.save(news);

      if (dto.tagIds?.length) {
        const uniqueTagIds = [...new Set(dto.tagIds)];

        await tagRepo.save(
          uniqueTagIds.map((tagId) =>
            tagRepo.create({
              newsId: saved.newsId,
              tagId: String(tagId),
            }),
          ),
        );
      }

      if (dto.contentBlocks?.length) {
        const blocks = dto.contentBlocks.map((block) =>
          blockRepo.create({
            newsId: saved.newsId,
            type: block.type,
            content: block.content,
            position: block.position,
          }),
        );

        await blockRepo.save(blocks);
      }

      return saved;
    });
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

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(NewsEntity);
      const tagRepo = manager.getRepository(NewsTagEntity);
      const blockRepo = manager.getRepository(ContentBlockEntity);

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

      // Chỉ staff mới được đổi status qua update.
      if (dto.status !== undefined && this.isStaff(user)) {
        const previousStatus = news.status;

        this.changeStatus(news, dto.status);

        if (
          previousStatus !== dto.status &&
          dto.status === 'published'
        ) {
          news.publishedAt = new Date();
          news.scheduledAt = null;
        }
      }

      await repo.save(news);

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

      if (dto.contentBlocks !== undefined) {
        await blockRepo.delete({ newsId: id });

        if (dto.contentBlocks.length > 0) {
          await blockRepo.save(
            dto.contentBlocks.map((block) =>
              blockRepo.create({
                newsId: id,
                type: block.type,
                content: block.content,
                position: block.position,
              }),
            ),
          );
        }
      }

      return this.findOneOrFail(id);
    });
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

    return this.newsRepo.save(news);
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

    return this.newsRepo.save(news);
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
}