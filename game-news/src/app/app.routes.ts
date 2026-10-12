import { Routes } from '@angular/router';

import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Register } from './features/auth/pages/register/register';
import { Login } from './features/auth/pages/login/login';
import { ForgotPassword } from './features/auth/pages/forgot-password/forgot-password';

import { Dashboard } from './features/admin/dashboard/dashboard';
import { Tag } from './features/admin/tag/tag';
import { Comment } from './features/admin/comment/comment';
import { Category } from './features/admin/category/category';
import { Users } from './features/admin/users/users';
import { News } from './features/admin/news/news';

import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ForbiddenPage } from './features/errors/forbidden-page/forbidden-page';
import { VerifyEmail } from './features/auth/pages/verify-email/verify-email';
import { Profile } from './features/admin/profile/profile';
export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', component: Dashboard },
      { path: 'news', component: News },
      { path: 'tags', component: Tag },
      { path: 'comment', component: Comment },
      { path: 'category', component: Category },
      { path: 'users', component: Users },
      { path: 'profile', component: Profile },
    ],
  },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    // canActivate: [guestGuard],
  },
  {
    path: 'verify-email',
    component: VerifyEmail,
    // canActivate: [guestGuard],
  },
 
];