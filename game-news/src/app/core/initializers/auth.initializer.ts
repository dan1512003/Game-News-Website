import {
  inject,
  PLATFORM_ID,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { firstValueFrom, take } from 'rxjs';

import * as AuthActions
  from '../../store/auth/auth.actions';

export const authInitializer = async () => {
  const platformId = inject(PLATFORM_ID);
  const store = inject(Store);
  const actions$ = inject(Actions);

  // SSR: không gọi refresh trên server.
  // Phải đánh dấu initialized để Guard không chờ vô hạn.
  if (!isPlatformBrowser(platformId)) {
    store.dispatch(AuthActions.authInitialized());
    return;
  }

  const refreshResult = firstValueFrom(
    actions$.pipe(
      ofType(
        AuthActions.refreshSuccess,
        AuthActions.refreshFailure,
      ),
      take(1),
    ),
  );

  store.dispatch(AuthActions.refresh());

  try {
    await refreshResult;
  } finally {
    store.dispatch(AuthActions.authInitialized());
  }
};
