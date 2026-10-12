
import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/common/common';

import {
  CreateNewsDto,
  NewsData,
  NewsActionResponse,
  NewsListResponse,
  NewsNoteDto,
  NewsQuery,
  ScheduleNewsDto,
  UpdateNewsDto,
  NewsDashboardStats,
} from '../models/news.model';

interface NewsMutationEntity {
  newsId: string;
  title: string;
  slug: string;
  summary: string | null;
  categoryId: string;
  authorId: string;
  reviewerId: string | null;
  thumbnail: string | null;
  status: NewsData['status'];
  views: number | string;
  publishedAt: Date | string | null;
  scheduledAt: Date | string | null;
  editorNote: string | null;
  requirementNote: string | null;
  reviewScore: number | null;
}
export interface NewsBlockImageUpload {
  position: number;
  file: File;
}
@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/news';
private toFormData(
  dto: CreateNewsDto | UpdateNewsDto,
  file?: File | null,
  blockImages: NewsBlockImageUpload[] = [],
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(dto)) {
    // Có thumbnail mới thì backend tự gán đường dẫn.
    if (key === 'thumbnail' && file) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    if (value === null) {
      formData.append(key, '');
      continue;
    }

    // Chuyển contentBlocks, tags... thành JSON.
    if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    formData.append(key, String(value));
  }

  // Thumbnail bài viết.
  if (file) {
    formData.append('file', file, file.name);
  }

  // Ảnh của các content block.
  for (const image of blockImages) {
    formData.append(
      `image_${image.position}`,
      image.file,
      image.file.name,
    );
  }

  return formData;
}
  // =====================================================
  // NORMALIZE ENTITY TRẢ VỀ TỪ CREATE / UPDATE
  // =====================================================

  private normalizeMutation(
    entity: NewsMutationEntity,
  ): NewsData {
    return {
      news_id: String(entity.newsId),
      title: entity.title,
      slug: entity.slug,
      summary: entity.summary,

      category_id: String(entity.categoryId),
      author_id: String(entity.authorId),
      reviewer_id:
        entity.reviewerId == null
          ? null
          : String(entity.reviewerId),

      thumbnail: entity.thumbnail,
      status: entity.status,
      views: entity.views,

      published_at: entity.publishedAt,
      scheduled_at: entity.scheduledAt,
      editor_note: entity.editorNote,
      requirement_note: entity.requirementNote,
      review_score:
        entity.reviewScore == null
          ? null
          : Number(entity.reviewScore),

      // Backend create/update chỉ trả entity đã lưu,
      // không join các quan hệ.
      category: null,
      author: null,
      reviewer: null,
      news_tags: [],
      content_blocks: [],
    };
  }

  // =====================================================
  // GET ALL
  // GET /news
  // =====================================================

  getAll(
    query: NewsQuery = {},
  ): Observable<NewsListResponse> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('limit', query.limit ?? 10);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }

    if (query.filter) {
      params = params.set('filter', query.filter);
    }

    return this.api
      .get<ApiResponse<NewsListResponse>>(
        this.endpoint,
        params,
      )
      .pipe(map((response) => response.data));
  }

  // =====================================================
  // GET BY ID
  // GET /news/:id
  // =====================================================

  getById(id: string): Observable<NewsData> {
    return this.api
      .get<ApiResponse<NewsData>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }

  // =====================================================
  // CREATE
  // POST /news
  // =====================================================

create(
  dto: CreateNewsDto,
  file?: File | null,
  blockImages: NewsBlockImageUpload[] = [],
): Observable<NewsData> {
  const body = this.toFormData(dto, file, blockImages);

  return this.api
    .post<ApiResponse<NewsMutationEntity>>(
      this.endpoint,
      body,
    )
    .pipe(
      map((response) =>
        this.normalizeMutation(response.data),
      ),
    );
}

update(
  id: string,
  dto: UpdateNewsDto,
  file?: File | null,
  blockImages: NewsBlockImageUpload[] = [],
): Observable<NewsData> {
  const body = this.toFormData(dto, file, blockImages);

  return this.api
    .patch<ApiResponse<NewsMutationEntity>>(
      `${this.endpoint}/${id}`,
      body,
    )
    .pipe(
      map((response) =>
        this.normalizeMutation(response.data),
      ),
    );
}


  // =====================================================
  // DELETE
  // DELETE /news/:id
  // =====================================================

  delete(id: string): Observable<NewsActionResponse> {
    return this.api
      .delete<ApiResponse<NewsActionResponse>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }

  // =====================================================
  // WORKFLOW ACTIONS
  // =====================================================

  apply(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'apply');
  }

  publish(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'publish');
  }

  submit(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'submit');
  }

  unsubmit(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'unsubmit');
  }

  returnToAuthor(
    id: string,
    dto: NewsNoteDto,
  ): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'return', dto);
  }

  requireEdit(
    id: string,
    dto: NewsNoteDto,
  ): Observable<NewsData> {
    return this.postAction<NewsData>(
      id,
      'require-edit',
      dto,
    );
  }

  unrequire(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'unrequire');
  }

  schedule(
    id: string,
    dto: ScheduleNewsDto,
  ): Observable<NewsData> {
    return this.postAction<NewsData>(
      id,
      'schedule',
      dto,
    );
  }

  unschedule(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'unschedule');
  }

  unpublish(id: string): Observable<NewsData> {
    return this.postAction<NewsData>(id, 'unpublish');
  }
 getDashboardStats(): Observable<NewsDashboardStats> {
  return this.api
    .get<ApiResponse<NewsDashboardStats>>(
      `${this.endpoint}/dashboard-stats`,
    )
    .pipe(map((response) => response.data));
}
  private postAction<T>(
    id: string,
    action: string,
    body?: object,
  ): Observable<T> {
    return this.api
      .post<ApiResponse<T>>(
        `${this.endpoint}/${id}/${action}`,
        body ?? {},
      )
      .pipe(map((response) => response.data));
  }

 
}