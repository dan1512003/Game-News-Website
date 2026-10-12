import {
  CommonModule,
} from '@angular/common';

import {
  Component,
  effect,
  inject,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  RouterLink,
} from '@angular/router';

import {
  Store,
} from '@ngrx/store';

import {
  AppState,
} from '../../../../app.state';

import * as AuthActions
  from '../../../../store/auth/auth.actions';

import * as AuthSelectors
  from '../../../../store/auth/auth.selectors';

import {
  ApiErrorResponse,
  LoginRequest,
} from '../../../../shared/models/auth/auth.model';


// =====================================================
// LOGIN ERRORS
// =====================================================

interface LoginErrors {

  email?: string;

  password?: string;

  login?: string;
}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],

  templateUrl: './login.html',

  styleUrl: './login.css',
})
export class Login {

  // =====================================================
  // STORE
  // =====================================================

  private readonly store =
    inject(Store<AppState>);


  // =====================================================
  // FORM
  // =====================================================

  email = '';

  password = '';

  remember = false;


  // =====================================================
  // UI
  // =====================================================

  showPw = false;

  errors: LoginErrors = {};


  // =====================================================
  // NGRX SIGNALS
  // =====================================================

  readonly loadingSignal =
    this.store.selectSignal(
      AuthSelectors.selectLoading,
    );


  private readonly authErrorSignal =
    this.store.selectSignal(
      AuthSelectors.selectAuthError,
    );


  private readonly loginSuccessSignal =
    this.store.selectSignal(
      AuthSelectors.selectLoginSuccess,
    );

    private readonly accessTokenSignal =
  this.store.selectSignal(
    AuthSelectors.selectAccessToken,
  );




  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    // ===================================================
    // BACKEND ERROR
    // ===================================================

    effect(() => {

      const error =
        this.authErrorSignal();


      if (!error) {
        return;
      }


      this.handleServerError(error);

    });


    // ===================================================
    // LOGIN SUCCESS
    // ===================================================

    effect(() => {

      const success =
        this.loginSuccessSignal();


      if (!success) {
        return;
      }


      this.errors = {};

      /*
       * Không navigate ở đây.
       *
       * AuthEffects.loginSuccess$
       * sẽ xử lý navigate về "/".
       */

    });

  }


  // =====================================================
  // SUBMIT LOGIN
  // =====================================================

  handleSubmit(): void {

    // ===================================================
    // PREVENT MULTIPLE SUBMIT
    // ===================================================

    if (this.loadingSignal()) {
      return;
    }


    // ===================================================
    // CLEAR LOCAL ERROR
    // ===================================================

    this.errors = {};


    // ===================================================
    // GET FORM DATA
    // ===================================================

    const email =
      this.email.trim();


    const password =
      this.password;


    // ===================================================
    // BASIC FRONTEND VALIDATION
    // ===================================================

    /*
     * Chỉ kiểm tra dữ liệu bắt buộc.
     *
     * Không kiểm tra:
     * - password >= 8 ký tự
     * - chữ hoa
     * - chữ thường
     *
     * Vì những rule này nên do backend quyết định.
     */

    const nextErrors:
      LoginErrors = {};


    if (!email) {

      nextErrors.email =
        'Vui lòng nhập email.';

    }


    if (!password) {

      nextErrors.password =
        'Vui lòng nhập mật khẩu.';

    }


    // ===================================================
    // FRONTEND VALIDATION FAILED
    // ===================================================

    if (
      Object.keys(nextErrors).length > 0
    ) {

      this.errors =
        nextErrors;

      return;

    }


    // ===================================================
    // REQUEST
    // ===================================================

    const data:
      LoginRequest = {

      email,

      password,

      remember:
        this.remember,

    };


    // ===================================================
    // DISPATCH LOGIN
    // ===================================================

    this.store.dispatch(

      AuthActions.login({
        data,
      }),

    );

  }


  // =====================================================
  // HANDLE BACKEND ERROR
  // =====================================================

 private handleServerError(
  error: ApiErrorResponse,
): void {

  // ===================================================
  // DEBUG BACKEND ERROR
  // ===================================================

  console.log(
    '🔥 LOGIN BACKEND ERROR:',
    error,
  );

  console.log(
    '🔥 BACKEND MESSAGE:',
    error.message,
  );

  console.log(
    '🔥 BACKEND ERRORS:',
    error.errors,
  );


  const nextErrors:
    LoginErrors = {};


  // ===================================================
  // FIELD ERRORS
  // ===================================================

  if (
    Array.isArray(error.errors)
  ) {

    console.log(
      '🔥 FIELD ERRORS COUNT:',
      error.errors.length,
    );


    for (
      const fieldError
      of error.errors
    ) {

      console.log(
        '🔥 FIELD ERROR:',
        fieldError,
      );


      const field =
        fieldError.field;


      const message =
        fieldError.messages?.[0];


      console.log(
        '🔥 FIELD:',
        field,
      );

      console.log(
        '🔥 MESSAGE:',
        message,
      );


      if (
        !message
      ) {
        continue;
      }


      // -----------------------------------------------
      // EMAIL ERROR
      // -----------------------------------------------

      if (
        field === 'email'
      ) {

        nextErrors.email =
          message;


        console.log(
          '❌ EMAIL ERROR:',
          message,
        );

      }


      // -----------------------------------------------
      // PASSWORD ERROR
      // -----------------------------------------------

      else if (
        field === 'password'
      ) {

        nextErrors.password =
          message;


        console.log(
          '❌ PASSWORD ERROR:',
          message,
        );

      }

    }

  } else {

    console.log(
      '⚠️ Backend không có errors array',
    );

  }


  // ===================================================
  // GENERAL BACKEND ERROR
  // ===================================================

  if (
    !nextErrors.email &&
    !nextErrors.password
  ) {

    nextErrors.login =
      error.message ||
      'Email hoặc mật khẩu không chính xác.';


    console.log(
      '❌ GENERAL LOGIN ERROR:',
      nextErrors.login,
    );

  }


  // ===================================================
  // FINAL UI ERROR
  // ===================================================

  console.log(
    '🔥 FINAL LOGIN ERRORS:',
    nextErrors,
  );


  this.errors =
    nextErrors;

}


  // =====================================================
  // UPDATE EMAIL
  // =====================================================

  updateEmail(
    value: string,
  ): void {

    this.email =
      value;


    /*
     * Khi user sửa email:
     * - xóa lỗi email
     * - xóa lỗi login tổng quát
     */

    if (
      this.errors.email ||
      this.errors.login
    ) {

      this.errors = {

        ...this.errors,

        email:
          undefined,

        login:
          undefined,

      };

    }

  }


  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  updatePassword(
    value: string,
  ): void {

    this.password =
      value;


    /*
     * Khi user sửa password:
     * - xóa lỗi password
     * - xóa lỗi login tổng quát
     */

    if (
      this.errors.password ||
      this.errors.login
    ) {

      this.errors = {

        ...this.errors,

        password:
          undefined,

        login:
          undefined,

      };

    }

  }


  // =====================================================
  // REMEMBER
  // =====================================================

  updateRemember(
    value: boolean,
  ): void {

    this.remember =
      value;

  }


  // =====================================================
  // PASSWORD TOGGLE
  // =====================================================

  togglePassword(): void {

    this.showPw =
      !this.showPw;

  }


  // =====================================================
  // DEMO ACCOUNT
  // =====================================================

  fillDemoAccount(): void {

    this.email =
      'admin@gamezone.com';

    this.password =
      'Admin123';

    this.remember =
      false;

    this.errors = {};

  }

}