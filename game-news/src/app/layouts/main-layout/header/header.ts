
import {
  Component,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';

import {
  Router,
  RouterLink,
  NavigationEnd,
} from '@angular/router';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  filter,
} from 'rxjs';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  Store,
} from '@ngrx/store';

import * as AuthSelectors
  from '../../../store/auth/auth.selectors';

import { AppState } from '../../../app.state';

import * as NewsPublicActions
  from '../../../store/news-public/store/news-public.actions';

import * as NewsPublicSelectors
  from '../../../store/news-public/store/news-public.selectors';


interface NavItem {
  label: string;
  path: string;
}


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private readonly router = inject(Router);

  private readonly store = inject(Store<AppState>);

  private readonly destroyRef = inject(DestroyRef);


  // AUTH USER

  readonly user = this.store.selectSignal(
    AuthSelectors.selectAuthUser,
  );

  readonly isloading = this.store.selectSignal(
    AuthSelectors.selectLoading,
  );




  readonly breakingNews = this.store.selectSignal(
    NewsPublicSelectors.selectBreakingNews,
  );

  readonly isBreakingLoading = this.store.selectSignal(
    NewsPublicSelectors.selectBreakingNewsLoading,
  );


  // STATE

  menuOpen = false;

  currentRoute = '';

  searchQuery = '';


  // NAVIGATION

  navItems: NavItem[] = [
    { label: 'Tất cả', path: '/' },
    { label: 'PC & Console', path: '/pc-console' },
    { label: 'Mobile', path: '/mobile' },
    { label: 'Esports', path: '/esports' },
    { label: 'Đánh giá', path: '/danh-gia' },
    { label: '🖱️ Gaming Gear', path: '/gaming-gear' },
    { label: '🎁 Giftcode', path: '/giftcode' },
  ];


  // LIFECYCLE

  ngOnInit(): void {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects;

        this.loadBreakingNewsIfPublic(
          event.urlAfterRedirects,
        );
      });

    this.loadBreakingNewsIfPublic(this.router.url);
  }

  private loadBreakingNewsIfPublic(url: string): void {
    const normalizedUrl = url.split('?')[0].split('#')[0];

    const isAdminRoute =
      normalizedUrl === '/admin' ||
      normalizedUrl.startsWith('/admin/');

    const isAuthRoute =
      normalizedUrl === '/login' ||
      normalizedUrl === '/register' ||
      normalizedUrl === '/forgot-password' ||
      normalizedUrl === '/reset-password';

    if (isAdminRoute || isAuthRoute) {
      return;
    }

    this.store.dispatch(
      NewsPublicActions.loadBreakingNews(),
    );
  }


  // AUTH

  get isLoggedIn(): boolean {
    return !!this.user();
  }

  get isNormalUser(): boolean {
    return this.user()?.role === 'user';
  }

  get showAdminButton(): boolean {
    const currentUser = this.user();

    return !!currentUser && currentUser.role !== 'user';
  }

  get userAvatarLetter(): string {
    const username = this.user()?.username?.trim();

    return username
      ? username.charAt(0).toUpperCase()
      : '?';
  }

  get userAvatarColor(): string {
    const username =
      this.user()?.username?.trim() || 'user';

    const colors = [
      '#ff5c00',
      '#8b5cf6',
      '#06b6d4',
      '#10b981',
      '#ef4444',
      '#f59e0b',
      '#ec4899',
      '#3b82f6',
      '#14b8a6',
      '#6366f1',
    ];

    let hash = 0;

    for (let i = 0; i < username.length; i++) {
      hash =
        username.charCodeAt(i) +
        ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  goToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }


  // SEARCH

  search(): void {
    const keyword = this.searchQuery.trim();

    if (!keyword) {
      return;
    }

    this.closeMenu();

    this.router.navigate(
      ['/search'],
      {
        queryParams: { q: keyword },
      },
    );
  }


  // MOBILE MENU

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }


  // ACTIVE NAV

  isActive(path: string): boolean {
    if (path === '/') {
      return this.currentRoute === '/';
    }

    return (
      this.currentRoute === path ||
      this.currentRoute.startsWith(path + '/')
    );
  }


  // LOGIN / REGISTER

  goToLogin(): void {
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.closeMenu();
    this.router.navigate(['/register']);
  }


  // ADMIN

  goToAdmin(): void {
    this.closeMenu();
    this.router.navigate(['/admin']);
  }
}
