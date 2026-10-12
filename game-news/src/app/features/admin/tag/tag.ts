import {
  Component,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { AppState } from '../../../app.state';

import type {
  Tag as TagModel,
  CreateTagDto,
  UpdateTagDto,
} from '../../../store/tag/models/tag.model';

import {
  loadTags,
  createTag,
  createTagSuccess,
  updateTag,
  updateTagSuccess,
  deleteTag,
  deleteTagSuccess,
  clearTagMessages,
} from '../../../store/tag/tag.actions';

import * as TagSelectors from '../../../store/tag/tag.selectors';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
})
export class Tag implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================================
  // STORE
  // ==========================================================

  readonly tags = this.store.selectSignal(
    TagSelectors.selectAllTags,
  );

  readonly meta = this.store.selectSignal(
    TagSelectors.selectTagMeta,
  );

  readonly loading = this.store.selectSignal(
    TagSelectors.selectTagLoading,
  );

  readonly submitting = this.store.selectSignal(
    TagSelectors.selectTagSubmitting,
  );

  readonly deleting = this.store.selectSignal(
    TagSelectors.selectTagDeleting,
  );

  readonly error = this.store.selectSignal(
    TagSelectors.selectTagError,
  );

  readonly successMessage = this.store.selectSignal(
    TagSelectors.selectTagSuccessMessage,
  );

  // ==========================================================
  // SEARCH
  // ==========================================================

  search = '';

  // ==========================================================
  // PAGINATION
  // ==========================================================

  readonly PER_PAGE = 1;

  page = 1;

  // ==========================================================
  // MODAL
  // ==========================================================

  modal: 'closed' | 'add' | 'edit' = 'closed';

  editItem: TagModel | null = null;

  deleteItem: TagModel | null = null;

  // ==========================================================
  // FORM
  // ==========================================================

  form: {
    name: string;
    description: string;
  } = {
    name: '',
    description: '',
  };

  // ==========================================================
  // INITIALIZE
  // ==========================================================

  ngOnInit(): void {
    this.loadPage();

    // Thêm và sửa thành công
    this.actions$
      .pipe(
        ofType(
          createTagSuccess,
          updateTagSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.closeModal();
        this.reloadCurrentPage();
      });

    // Xóa thành công
    this.actions$
      .pipe(
        ofType(deleteTagSuccess),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.adjustPageAfterDelete();
        this.closeDelete();
        this.reloadCurrentPage();
      });
  }

  // ==========================================================
  // DATA
  // ==========================================================

  get items(): TagModel[] {
    return this.tags();
  }

  get filtered(): TagModel[] {
    return this.items;
  }

  get paged(): TagModel[] {
    // API đã phân trang, không slice lần thứ hai.
    return this.items;
  }

  // ==========================================================
  // PAGINATION
  // ==========================================================

  get total(): number {
    return this.meta().total;
  }

  get totalPages(): number {
    return this.meta().totalPages;
  }

  get recordStart(): number {
    if (this.total === 0) {
      return 0;
    }

    return (this.page - 1) * this.PER_PAGE + 1;
  }

  get recordEnd(): number {
    return Math.min(
      this.page * this.PER_PAGE,
      this.total,
    );
  }

  get paginationItems(): (number | 'dots')[] {
    const total = this.totalPages;
    const current = this.page;

    if (total === 0) {
      return [];
    }

    if (total <= 6) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    if (current <= 3) {
      return [
        1, 2, 3, 4, 'dots',
        total - 1, total,
      ];
    }

    if (current >= total - 2) {
      return [
        1, 2, 'dots',
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1, 2, 'dots',
      current - 1,
      current,
      'dots',
      total - 1,
      total,
    ];
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
    this.loadPage();
  }

  // ==========================================================
  // LOAD TAGS
  // ==========================================================

  private loadPage(): void {
    this.store.dispatch(
      loadTags({
        query: {
          page: this.page,
          limit: this.PER_PAGE,
          ...(this.search.trim()
            ? { search: this.search.trim() }
            : {}),
        },
      }),
    );
  }

  // ==========================================================
  // RELOAD AFTER CRUD SUCCESS
  // ==========================================================

  private reloadCurrentPage(): void {
    this.loadPage();
  }

  private adjustPageAfterDelete(): void {
    // Tính trang cuối còn hợp lệ sau khi xóa một bản ghi.
    const remainingTotal = Math.max(
      0,
      this.total - 1,
    );

    const lastValidPage = Math.max(
      1,
      Math.ceil(
        remainingTotal / this.PER_PAGE,
      ),
    );

    if (this.page > lastValidPage) {
      this.page = lastValidPage;
    }
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  onSearchChange(): void {
    this.page = 1;
    this.loadPage();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1;
    this.loadPage();
  }

  // ==========================================================
  // ADD
  // ==========================================================

  openAdd(): void {
    this.store.dispatch(clearTagMessages());

    this.form = {
      name: '',
      description: '',
    };

    this.editItem = null;
    this.modal = 'add';
  }

  // ==========================================================
  // EDIT
  // ==========================================================

  openEdit(tag: TagModel): void {
    this.store.dispatch(clearTagMessages());

    this.editItem = tag;

    this.form = {
      name: tag.name,
      description: tag.description ?? '',
    };

    this.modal = 'edit';
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  save(): void {
    if (this.submitting()) {
      return;
    }

    const name = this.form.name.trim();

    if (!name) {
      alert('Vui lòng nhập tên thẻ.');
      return;
    }

    const description = this.form.description.trim();

    if (this.modal === 'add') {
      const dto: CreateTagDto = {
        name,
        description,
      };

      this.page = 1;

      this.store.dispatch(
        createTag({ dto }),
      );

      return;
    }

    if (this.modal === 'edit' && this.editItem) {
      const dto: UpdateTagDto = {
        name,
        description,
      };

      this.store.dispatch(
        updateTag({
          id: String(this.editItem.tag_id),
          dto,
        }),
      );
    }
  }

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  closeModal(): void {
    this.modal = 'closed';
    this.editItem = null;

    this.form = {
      name: '',
      description: '',
    };
  }

  closeOnOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  openDelete(tag: TagModel): void {
    this.store.dispatch(clearTagMessages());
    this.deleteItem = tag;
  }

  closeDelete(): void {
    this.deleteItem = null;
  }

  confirmDelete(): void {
    if (!this.deleteItem || this.deleting()) {
      return;
    }

    this.store.dispatch(
      deleteTag({
        id: String(this.deleteItem.tag_id),
      }),
    );
  }
}