
import {
  Component,
  OnInit,
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



  menuOpen = false;

  currentRoute = '';

  searchQuery = '';




  navItems: NavItem[] = [

    {
      label: 'Tất cả',
      path: '/',
    },

    {
      label: 'PC & Console',
      path: '/pc-console',
    },

    {
      label: 'Mobile',
      path: '/mobile',
    },

    {
      label: 'Esports',
      path: '/esports',
    },

    {
      label: 'Đánh giá',
      path: '/danh-gia',
    },

    {
      label: '🖱️ Gaming Gear',
      path: '/gaming-gear',
    },

    {
      label: '🎁 Giftcode',
      path: '/giftcode',
    },

  ];



  ngOnInit(): void {

    this.currentRoute =
      this.router.url;


    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        ),
      )
      .subscribe(event => {

        const navigation =
          event as NavigationEnd;

        this.currentRoute =
          navigation.urlAfterRedirects;

      });

  }


  search(): void {

    const keyword =
      this.searchQuery.trim();


    if (!keyword) {

      return;

    }


    this.closeMenu();

    this.router.navigate(
      ['/search'],
      {
        queryParams: {
          q: keyword,
        },
      },
    );

  }



  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  toggleMenu(): void {

    this.menuOpen =
      !this.menuOpen;

  }


  closeMenu(): void {

    this.menuOpen = false;

  }




  isActive(path: string): boolean {

    if (path === '/') {

      return this.currentRoute === '/';

    }

    return this.currentRoute === path ||
           this.currentRoute.startsWith(
             path + '/'
           );

  }




  goToLogin(): void {

    this.closeMenu();

    this.router.navigate([
      '/login',
    ]);

  }





  goToRegister(): void {

    this.closeMenu();

    this.router.navigate([
      '/register',
    ]);

  }




  goToProfile(): void {

    this.closeMenu();

    this.router.navigate([
      '/profile',
    ]);

  }



  logout(): void {

    this.closeMenu();

    this.router.navigate([
      '/',
    ]);

  }

}
