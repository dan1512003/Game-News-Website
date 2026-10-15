import {
  Component,
  inject,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import {
  Store,
} from '@ngrx/store';

import {
  selectAuthUser,
} from '../../../store/auth/auth.selectors';


@Component({
  selector: 'app-header',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
  ],

  templateUrl: './header.html',

  styleUrl: './header.css',
})
export class Header {

  // ==========================================
  // DEPENDENCIES
  // ==========================================

  private readonly store =
    inject(Store);


  // ==========================================
  // NGRX
  // ==========================================

  /**
   * User hiện tại.
   *
   * Signal tự động cập nhật khi
   * AuthState.user thay đổi.
   */
  readonly user =
    this.store.selectSignal(
      selectAuthUser,
    );


  // ==========================================
  // UI STATE
  // ==========================================

  isSideNavOpen = false;


  // ==========================================
  // SIDEBAR
  // ==========================================

  toggleSideNav(): void {

    this.isSideNavOpen =
      !this.isSideNavOpen;
  }


  closeSideNav(): void {

    this.isSideNavOpen = false;
  }

}