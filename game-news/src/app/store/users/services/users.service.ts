import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpParams,
} from '@angular/common/http';

import {
  map,
  Observable,
} from 'rxjs';

import { ApiService } from '../../../core/api/api.service';

import {
  DeleteUserResponse,
  UpdateUserDto,
  User,
  UserDashboardStats,
  UserDetail,
  UserListResponse,
  UserQuery,
} from '../models/users.model';

import { ApiResponse } from '../../../shared/models/auth/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/users';

  // GET /users/dashboard-stats
  getDashboardStats(): Observable<UserDashboardStats> {
    return this.api
      .get<ApiResponse<UserDashboardStats>>(
        `${this.endpoint}/dashboard-stats`,
      )
      .pipe(
        map((response) => response.data),
      );
  }

  // GET /users?page=1&limit=10&search=...
  getAll(
    query: UserQuery = {},
  ): Observable<UserListResponse> {
    let params = new HttpParams()
      .set('page', query.page ?? 1)
      .set('limit', query.limit ?? 10);

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.role) {
      params = params.set('role', query.role);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.api
      .get<ApiResponse<UserListResponse>>(
        this.endpoint,
        params,
      )
      .pipe(
        map((response) => response.data),
      );
  }

  // GET /users/:id
  getById(id: string): Observable<UserDetail> {
    return this.api
      .get<ApiResponse<UserDetail>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(
        map((response) => response.data),
      );
  }

  // PATCH /users/:id
  update(
    id: string,
    dto: UpdateUserDto,
  ): Observable<User> {
    return this.api
      .patch<ApiResponse<User>>(
        `${this.endpoint}/${id}`,
        dto,
      )
      .pipe(
        map((response) => response.data),
      );
  }

  // DELETE /users/:id
  delete(id: string): Observable<DeleteUserResponse> {
    return this.api
      .delete<ApiResponse<DeleteUserResponse>>(
        `${this.endpoint}/${id}`,
      )
      .pipe(
        map((response) => response.data),
      );
  }
}