import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';

// Auth
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';

// User
import { userReducer } from './store/users/users.reducer';
import { UserEffects } from './store/users/users.effects';

// News
import { newsReducer } from './store/news/news.reducer';
import { NewsEffects } from './store/news/news.effects';

// Category
import { categoryReducer } from './store/category/category.reducer';
import { CategoryEffects } from './store/category/category.effects';

// Tag
import { tagReducer } from './store/tag/tag.reducer';
import { TagEffects } from './store/tag/tag.effects';

// Comment
import { commentReducer } from './store/comment/comment.reducer';
import { CommentEffects } from './store/comment/comment.effects';

// Interceptors and initializers
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authInitializer } from './core/initializers/auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // Router
    provideRouter(routes),

    // SSR hydration
    provideClientHydration(withEventReplay()),

    // HTTP
    provideHttpClient(
      withInterceptors([
        authInterceptor,
      ]),
    ),

    // NgRx Store
    provideStore({
      auth: authReducer,
      user: userReducer,
      news: newsReducer,
      category: categoryReducer,
      tag: tagReducer,
      comment: commentReducer,
    }),

    // NgRx Effects
    provideEffects([
      AuthEffects,
      UserEffects,
      NewsEffects,
      CategoryEffects,
      TagEffects,
      CommentEffects,
    ]),

    // Auth initializer
    provideAppInitializer(authInitializer),
  ],
};