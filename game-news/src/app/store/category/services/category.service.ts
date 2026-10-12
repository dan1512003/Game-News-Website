
import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { ApiService } from '../../../core/api/api.service';
import { ApiResponse } from '../../../shared/models/common/common';

import {
  Category,
  CategoryOption,
  CategoryListResponse,
  CategoryQuery,
  CategoryDashboardStats,
  CreateCategoryDto,
  DeleteCategoryResponse,
  UpdateCategoryDto,
} from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/categories';

  getDashboardStats(): Observable<CategoryDashboardStats> {
    return this.api
      .get<ApiResponse<CategoryDashboardStats>>(
        `${this.endpoint}/dashboard-stats`,
      )
      .pipe(map((response) => response.data));
  }

  getAll(
    query: CategoryQuery = {},
  ): Observable<CategoryListResponse> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('limit', query.limit ?? 5);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    return this.api
      .get<ApiResponse<CategoryListResponse>>(
        this.endpoint,
        params,
      )
      .pipe(map((response) => response.data));
  }

  getOptions(): Observable<CategoryOption[]> {
    return this.api
      .get<ApiResponse<CategoryOption[]>>(
        `${this.endpoint}/options`,
      )
      .pipe(map((response) => response.data));
  }

  getById(id: string): Observable<Category> {
    return this.api
      .get<ApiResponse<Category>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.api
      .post<ApiResponse<Category>>(this.endpoint, dto)
      .pipe(map((response) => response.data));
  }

  update(
    id: string,
    dto: UpdateCategoryDto,
  ): Observable<Category> {
    return this.api
      .patch<ApiResponse<Category>>(
        `${this.endpoint}/${id}`,
        dto,
      )
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<DeleteCategoryResponse> {
    return this.api
      .delete<ApiResponse<DeleteCategoryResponse>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(map((response) => response.data));
  }
}