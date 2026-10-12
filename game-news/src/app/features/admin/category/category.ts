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
  Category as CategoryModel,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../../store/category/models/category.model';

import {
  loadCategories,
  createCategory,
  createCategorySuccess,
  updateCategory,
  updateCategorySuccess,
  deleteCategory,
  deleteCategorySuccess,
  clearCategoryMessages,
} from '../../../store/category/category.actions';

import * as CategorySelectors from '../../../store/category/category.selectors';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================================
  // STORE
  // ==========================================================

  readonly categories = this.store.selectSignal(
    CategorySelectors.selectCategories,
  );

  readonly meta = this.store.selectSignal(
    CategorySelectors.selectCategoryMeta,
  );

  readonly loading = this.store.selectSignal(
    CategorySelectors.selectCategoryLoading,
  );

  readonly submitting = this.store.selectSignal(
    CategorySelectors.selectCategorySubmitting,
  );

  readonly deleting = this.store.selectSignal(
    CategorySelectors.selectCategoryDeleting,
  );

  readonly error = this.store.selectSignal(
    CategorySelectors.selectCategoryError,
  );

  readonly successMessage = this.store.selectSignal(
    CategorySelectors.selectCategorySuccessMessage,
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

  editItem: CategoryModel | null = null;

  deleteItem: CategoryModel | null = null;

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

    // Chỉ tải lại danh sách sau khi CRUD thành công.
    this.actions$
      .pipe(
        ofType(
          createCategorySuccess,
          updateCategorySuccess,
          deleteCategorySuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.reloadCurrentPage();
      });
  }

  // ==========================================================
  // DATA
  // ==========================================================

  get items(): CategoryModel[] {
    return this.categories();
  }

  get filtered(): CategoryModel[] {
    return this.items;
  }

  get paged(): CategoryModel[] {
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
        total - 3, total - 2, total - 1, total,
      ];
    }

    return [
      1, 2, 'dots',
      current - 1, current, 'dots',
      total - 1, total,
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
  // LOAD CATEGORIES
  // ==========================================================

  private loadPage(): void {
    this.store.dispatch(
      loadCategories({
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
    // Nếu xóa hết bản ghi ở trang cuối,
    // chuyển về trang cuối còn hợp lệ.
    const lastValidPage = Math.max(
      1,
      Math.ceil(
        Math.max(0, this.total - (
          this.deleteItem ? 1 : 0
        )) / this.PER_PAGE,
      ),
    );

    if (this.page > lastValidPage) {
      this.page = lastValidPage;
    }

    this.loadPage();
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
    this.store.dispatch(clearCategoryMessages());

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

  openEdit(item: CategoryModel): void {
    this.store.dispatch(clearCategoryMessages());

    this.editItem = item;

    this.form = {
      name: item.name,
      description: item.description ?? '',
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
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    const description =
      this.form.description.trim() || null;

    if (this.modal === 'add') {
      const dto: CreateCategoryDto = {
        name,
        description,
      };

      this.store.dispatch(createCategory({ dto }));
      this.page=1;
      this.closeModal();
      return;
    }

    if (this.modal === 'edit' && this.editItem) {
      const dto: UpdateCategoryDto = {
        name,
        description,
      };

      this.store.dispatch(
        updateCategory({
          id: this.editItem.category_id,
          dto,
        }),
      );

      this.closeModal();
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

  openDelete(item: CategoryModel): void {
    this.store.dispatch(clearCategoryMessages());
    this.deleteItem = item;
  }

  cancelDelete(): void {
    this.deleteItem = null;
  }

  confirmDelete(): void {
    if (!this.deleteItem || this.deleting()) {
      return;
    }

    const id = this.deleteItem.category_id;

    this.store.dispatch(deleteCategory({ id }));
    this.page=1;
    this.deleteItem = null;
  }
}