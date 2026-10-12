
import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/common/common';

import {
  CreateTagDto,
  DeleteTagResponse,
  Tag,
  TagDashboardStats,
  TagListResponse,
  TagOption,
  TagQuery,
  UpdateTagDto,
} from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/tags';

  getDashboardStats(): Observable<TagDashboardStats> {
    return this.api
      .get<ApiResponse<TagDashboardStats>>(
        `${this.endpoint}/dashboard-stats`,
      )
      .pipe(map((response) => response.data));
  }

  getOptions(): Observable<TagOption[]> {
    return this.api
      .get<ApiResponse<TagOption[]>>(
        `${this.endpoint}/options`,
      )
      .pipe(map((response) => response.data));
  }

  getAll(query: TagQuery = {}): Observable<TagListResponse> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('limit', query.limit ?? 10);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return this.api
      .get<ApiResponse<TagListResponse>>(
        this.endpoint,
        params,
      )
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Tag> {
    return this.api
      .get<ApiResponse<Tag>>(`${this.endpoint}/${id}`)
      .pipe(
        map((response) => {
          const tag = response.data as Tag & {
            tagId?: string | number;
          };

          return {
            tag_id: String(tag.tag_id ?? tag.tagId),
            name: tag.name,
            description: tag.description ?? null,
          };
        }),
      );
  }

  create(dto: CreateTagDto): Observable<Tag> {
    return this.api
      .post<ApiResponse<Tag>>(this.endpoint, dto)
      .pipe(map((response) => response.data));
  }

  update(
    id: string,
    dto: UpdateTagDto,
  ): Observable<Tag> {
    return this.api
      .patch<ApiResponse<Tag>>(
        `${this.endpoint}/${id}`,
        dto,
      )
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<DeleteTagResponse> {
    return this.api
      .delete<ApiResponse<DeleteTagResponse>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }
}