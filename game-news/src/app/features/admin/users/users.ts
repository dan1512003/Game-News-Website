
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { AppState } from '../../../app.state';

import {
  User,
  UserDetail,
  UserStatus,
  UpdateUserDto,
  UserQuery,
} from '../../../store/users/models/users.model';

import * as UserActions from '../../../store/users/users.actions';
import * as UserSelectors from '../../../store/users/users.selectors';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './users.css',
  templateUrl: './users.html',
})
export class Users implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================================
  // STORE SIGNALS
  // ==========================================================

  private readonly usersSignal = this.store.selectSignal(
    UserSelectors.selectAllUsers,
  );

  private readonly selectedUserSignal = this.store.selectSignal(
    UserSelectors.selectSelectedUser,
  );

  private readonly metaSignal = this.store.selectSignal(
    UserSelectors.selectUserMeta,
  );

  private readonly countsSignal = this.store.selectSignal(
    UserSelectors.selectUserCounts,
  );

  private readonly loadingSignal = this.store.selectSignal(
    UserSelectors.selectUserLoading,
  );

  private readonly submittingSignal = this.store.selectSignal(
    UserSelectors.selectUserSubmitting,
  );

  private readonly deletingSignal = this.store.selectSignal(
    UserSelectors.selectUserDeleting,
  );

  private readonly errorSignal = this.store.selectSignal(
    UserSelectors.selectUserError,
  );

  private readonly successMessageSignal = this.store.selectSignal(
    UserSelectors.selectUserSuccessMessage,
  );

  // ==========================================================
  // CONFIG
  // ==========================================================

  readonly PER_PAGE = 10;

  readonly roleFilterTabs: {
    key: 'all' | User['role'];
    label: string;
  }[] = [
    { key: 'all', label: 'Tất cả người dùng' },
    { key: 'admin', label: 'Admin' },
    { key: 'editor', label: 'Editor' },
    { key: 'author', label: 'Author' },
    { key: 'user', label: 'User' },
  ];

  readonly roleOptions: User['role'][] = [
    'admin',
    'editor',
    'author',
    'user',
  ];

  readonly statusOptions: UserStatus[] = [
    'pending_verification',
    'active',
    'banned',
  ];

  readonly roleStyles: Record<string, string> = {
    admin: 'role-admin',
    editor: 'role-editor',
    author: 'role-author',
    user: 'role-user',
    super_admin: 'role-admin',
  };

  readonly statusStyles: Record<string, string> = {
    pending_verification: 'status-pending',
    active: 'status-active',
    banned: 'status-banned',
  };

  readonly roleColors: Record<string, string> = {
    all: '#6b6560',
    admin: '#ff5c00',
    editor: '#3b82f6',
    author: '#a78bfa',
    user: '#6b7280',
    super_admin: '#ff5c00',
  };

  readonly statusFilterTabs: {
    key: 'all' | UserStatus;
    label: string;
  }[] = [
    { key: 'all', label: 'Tất cả trạng thái' },
    { key: 'pending_verification', label: 'Chờ xác minh' },
    { key: 'active', label: 'Hoạt động' },
    { key: 'banned', label: 'Không hoạt động' },
  ];

  readonly statusColors: Record<string, string> = {
    all: '#6b6560',
    pending_verification: '#f59e0b',
    active: '#22c55e',
    banned: '#ef4444',
  };

  // ==========================================================
  // STATE
  // ==========================================================

  get items(): User[] {
    return this.usersSignal();
  }

  get selectedUser(): UserDetail | null {
    return this.selectedUserSignal();
  }

  get loading(): boolean {
    return this.loadingSignal();
  }

  get submitting(): boolean {
    return this.submittingSignal();
  }

  get deleting(): boolean {
    return this.deletingSignal();
  }

  get error(): string | null {
    return this.errorSignal();
  }

  get successMessage(): string | null {
    return this.successMessageSignal();
  }

  get counts() {
    return this.countsSignal();
  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  currentPage = 1;
  pageLimit = this.PER_PAGE;

  get total(): number {
    return this.metaSignal().total;
  }

  get totalPages(): number {
    return this.metaSignal().totalPages;
  }

  get recordStart(): number {
    return this.total === 0
      ? 0
      : (this.currentPage - 1) * this.pageLimit + 1;
  }

  get recordEnd(): number {
    return Math.min(
      this.currentPage * this.pageLimit,
      this.total,
    );
  }

  get paginationItems(): (number | 'dots')[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 0) {
      return [];
    }

    if (total <= 6) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 'dots', total - 1, total];
    }

    if (current >= total - 2) {
      return [
        1, 2, 'dots',
        total - 3, total - 2, total - 1, total,
      ];
    }

    return [
      1, 2, 'dots',
      current - 1, current, 'dots',
      total - 1, total,
    ];
  }

  // ==========================================================
  // SEARCH & FILTER
  // ==========================================================

  search = '';

  roleFilter: 'all' | User['role'] = 'all';
  statusFilter: UserStatus | '' = '';

  // ==========================================================
  // MODALS
  // ==========================================================

  deleteItem: User | null = null;
  viewItem: User | UserDetail | null = null;
  editItem: User | null = null;

  editRole: User['role'] = 'user';
  editStatus: UserStatus = 'active';

  private deletingLastItemOnPage = false;

  // ==========================================================
  // INITIALIZE
  // ==========================================================

  ngOnInit(): void {
    this.loadUsers();

    this.actions$
      .pipe(
        ofType(UserActions.updateUserSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.loadUsers();
      });

    this.actions$
      .pipe(
        ofType(UserActions.deleteUserSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (
          this.deletingLastItemOnPage &&
          this.currentPage > 1
        ) {
          this.currentPage--;
        }

        this.deletingLastItemOnPage = false;
        this.deleteItem = null;

        this.loadUsers();
      });
  }

  // ==========================================================
  // QUERY
  // ==========================================================

  private buildQuery(): UserQuery {
    return {
      page: this.currentPage,
      limit: this.pageLimit,

      ...(this.search.trim()
        ? { search: this.search.trim() }
        : {}),

      ...(this.roleFilter !== 'all'
        ? { role: this.roleFilter }
        : {}),

      ...(this.statusFilter
        ? { status: this.statusFilter }
        : {}),
    };
  }

  // ==========================================================
  // LOAD USERS
  // ==========================================================

  loadUsers(): void {
    this.store.dispatch(
      UserActions.loadUsers({
        query: this.buildQuery(),
      }),
    );
  }

  get filteredUsers(): User[] {
    return this.items;
  }

  get pagedUsers(): User[] {
    return this.items;
  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadUsers();
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.search = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  // ==========================================================
  // FILTER ROLE
  // ==========================================================

  selectRoleFilter(role: 'all' | User['role']): void {
    this.roleFilter = role;
    this.currentPage = 1;
    this.loadUsers();
  }

  getRoleCount(role: 'all' | User['role']): number {
    if (role === 'all') {
      return this.counts.byRole
        ? this.counts.all
        : 0;
    }

    return this.counts.byRole[role] ?? 0;
  }

  // ==========================================================
  // FILTER STATUS
  // ==========================================================

  selectStatusFilter(status: UserStatus | ''): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadUsers();
  }

  getStatusCount(status: 'all' | UserStatus): number {
    if (status === 'all') {
      return this.counts.all;
    }

    return this.counts.byStatus[status] ?? 0;
  }

  // ==========================================================
  // VIEW DETAIL
  // ==========================================================

  openView(user: User): void {
    this.viewItem = user;

    this.store.dispatch(
      UserActions.loadUserById({
        id: user.user_id,
      }),
    );
  }

  closeView(): void {
    this.viewItem = null;
  }

  // ==========================================================
  // EDIT USER
  // ==========================================================

  openEdit(user: User): void {
    this.editItem = { ...user };
    this.editRole = user.role;
    this.editStatus = user.status;
  }

  closeEdit(): void {
    this.editItem = null;
  }

  confirmEdit(): void {
    if (!this.editItem || this.submitting) {
      return;
    }

    const dto: UpdateUserDto = {
      role: this.editRole,
      status: this.editStatus,
    };

    this.store.dispatch(
      UserActions.updateUser({
        id: this.editItem.user_id,
        dto,
      }),
    );

    this.closeEdit();
  }

  // ==========================================================
  // DELETE USER
  // ==========================================================

  openDelete(user: User): void {
    this.deleteItem = user;

    this.deletingLastItemOnPage =
      this.items.length === 1 &&
      this.currentPage > 1;
  }

  closeDelete(): void {
    this.deleteItem = null;
    this.deletingLastItemOnPage = false;
  }

  confirmDelete(): void {
    if (!this.deleteItem || this.deleting) {
      return;
    }

    this.deletingLastItemOnPage =
      this.items.length === 1 &&
      this.currentPage > 1;

    this.store.dispatch(
      UserActions.deleteUser({
        id: this.deleteItem.user_id,
      }),
    );
  }

  // ==========================================================
  // COMMENTS
  // ==========================================================

  getUserComments(
    user: User | UserDetail,
  ): UserDetail['comments'] {
    return this.getDetail(user)?.comments ?? [];
  }

  getCommentTotal(user: User | UserDetail): number {
    return this.getDetail(user)?.comment_total ?? 0;
  }

  getCommentApproved(user: User | UserDetail): number {
    return this.getUserComments(user)
      .filter(item => item.status === 'approved')
      .length;
  }

  getCommentPending(user: User | UserDetail): number {
    return this.getUserComments(user)
      .filter(item => item.status === 'pending')
      .length;
  }

  getCommentSpam(user: User | UserDetail): number {
    return this.getUserComments(user)
      .filter(item => item.status === 'spam')
      .length;
  }

  // ==========================================================
  // AUTHOR NEWS
  // ==========================================================

  isWriter(user: User): boolean {
    return (
      user.role === 'admin' ||
      user.role === 'editor' ||
      user.role === 'author'
    );
  }

  normalizeName(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  getAuthorNews(
    user: User | UserDetail,
  ): UserDetail['authored_news'] {
    return this.getDetail(user)?.authored_news ?? [];
  }

  getNewsByStatus(
    user: User | UserDetail,
    status: string,
  ): number {
    return this.getAuthorNews(user)
      .filter(news => news.status === status)
      .length;
  }

  getPublishedCount(user: User | UserDetail): number {
    return this.getNewsByStatus(user, 'published');
  }

  getDraftCount(user: User | UserDetail): number {
    return this.getNewsByStatus(user, 'draft');
  }

  getReturnedCount(user: User | UserDetail): number {
    return this.getNewsByStatus(user, 'returned');
  }

  getApplyCount(user: User | UserDetail): number {
    return this.getNewsByStatus(user, 'submitted');
  }

  getRemovedCount(user: User | UserDetail): number {
    return this.getNewsByStatus(user, 'removed');
  }

  getTotalViews(_user: User | UserDetail): number {
    return 0;
  }

  getLikeCount(_user: User | UserDetail): number {
    return 0;
  }

  // ==========================================================
  // DETAIL HELPER
  // ==========================================================

  private getDetail(
    user: User | UserDetail,
  ): UserDetail | null {
    if ('comments' in user && 'authored_news' in user) {
      return user;
    }

    const detail = this.selectedUser;

    if (detail?.user_id === user.user_id) {
      return detail;
    }

    return null;
  }

  // ==========================================================
  // FORMATTERS
  // ==========================================================

  formatNumber(value: number): string {
    return value.toLocaleString('vi-VN');
  }

  getRoleClass(role: string): string {
    return this.roleStyles[role] ?? this.roleStyles['user'];
  }

  getStatusClass(status: string): string {
    return this.statusStyles[status] ?? '';
  }

  getRoleColor(role: string): string {
    return this.roleColors[role] ?? '#6b6560';
  }

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending_verification: 'Chờ xác minh',
      active: 'Hoạt động',
      banned: 'Không hoạt động',
    };

    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] ?? '#6b6560';
  }
}