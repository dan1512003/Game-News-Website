import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Register } from './features/auth/pages/register/register';
import { Login } from './features/auth/pages/login/login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';
import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Tag } from './features/admin/tag/tag';
import { Comment } from './features/admin/comment/comment';
import { Category } from './features/admin/category/category';
import { Users } from './features/admin/users/users';
import { News } from './features/admin/news/news';
import { Profile } from './features/admin/profile/profile';
import { Home } from './features/home/pages/home/home';
import { NewsListing } from './features/news-listing/news-listing';
import { NewsDetail } from './features/news-detail/news-detail';
import { ProfileUser } from './features/profile/profile';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ForbiddenPage } from './features/errors/forbidden-page/forbidden-page';


export const routes: Routes = [

  // ===================================================
  // ADMIN
  // ===================================================

  {
    path: 'admin',

    component: AdminLayout,

    canActivate: [
      adminGuard,
    ],

    children: [

      {
        path: '',
        component: Dashboard,
      },

      {
        path: 'news',
        component: News,
      },

      {
        path: 'tags',
        component: Tag,
      },

      {
        path: 'comment',
        component: Comment,
      },

      {
        path: 'category',
        component: Category,
      },

      {
        path: 'users',
        component: Users,
      },

      {
        path: 'profile',
        component: Profile,
      },

    ],
  },


  // ===================================================
  // AUTH
  // ===================================================

  {
    path: 'login',

    component: Login,

    canActivate: [
      guestGuard,
    ],
  },

  {
    path: 'register',

    component: Register,

    canActivate: [
      guestGuard,
    ],
  },

  {
    path: 'forgot-password',

    component: ForgotPassword,
  },

  {
    path: 'verify-email',

    component: VerifyEmail,
  },


  // ===================================================
  // PUBLIC WEBSITE
  // ===================================================

  {
    path: '',

    component: MainLayout,

    children: [


      {
        path: '',

        component: Home
      },
   {
        path: 'profile',

        component: ProfileUser
      },


      {
        path: 'pc-console',

        component: NewsListing,

        data: {
          pageType: 'PC',
        },
      },



      {
        path: 'mobile',

        component: NewsListing,

        data: {
          pageType: 'Mobile',
        },
      },


   

      {
        path: 'esports',

        component: NewsListing,

        data: {
          pageType: 'Esports',
        },
      },




      {
        path: 'danh-gia',

        component: NewsListing,

        data: {
          pageType: 'Reviews',
        },
      },

      {
        path: 'gaming-gear',

        component: NewsListing,

        data: {
          pageType: 'Gaming Gear',
        },
      },
      {
        path: 'giftcode',

        component: NewsListing,

        data: {
          pageType: 'Giftcode',
        },
      },
      {
  path: 'bai-viet/:id',
  component: NewsDetail,
},

    ],
  },


  {
    path: 'forbidden',

    component: ForbiddenPage,
  },




  {
    path: '**',

    redirectTo: '',
  },

];