
// ==========================================
// REGISTER FIELD
// ==========================================

import { CommonModule } from '@angular/common';

import {
  Component,
  effect,
  inject,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  Router,
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
  RegisterRequest,
} from '../../../../shared/models/auth/auth.model';


// ==========================================
// REGISTER FIELD
// ==========================================

type RegisterField =
  | 'username'
  | 'email'
  | 'password'
  | 'confirm'
  | 'terms';


// ==========================================
// REGISTER ERRORS
// ==========================================

interface RegisterErrors {

  username?: string;

  email?: string;

  password?: string;

  confirm?: string;

  terms?: string;

  register?: string;
}


// ==========================================
// COMPONENT
// ==========================================

@Component({
  selector: 'app-register',

  imports: [
    FormsModule,
    CommonModule,
  ],

  templateUrl: './register.html',

  styleUrl: './register.css',
})
export class Register {

  // ==========================================
  // STORE
  // ==========================================

  private readonly store =
    inject(Store<AppState>);


  // ==========================================
  // ROUTER
  // ==========================================

  private readonly router =
    inject(Router);


  // ==========================================
  // FORM
  // ==========================================

  form = {

    username: '',

    email: '',

    password: '',

    confirm: '',

  };


  // ==========================================
  // UI STATE
  // ==========================================

  showPw = false;

  agreed = false;


  errors: RegisterErrors = {};


  // ==========================================
  // NGRX SIGNALS
  // ==========================================

  private readonly loadingSignal =
    this.store.selectSignal(
      AuthSelectors.selectLoading,
    );


  private readonly authErrorSignal =
    this.store.selectSignal(
      AuthSelectors.selectAuthError,
    );


  private readonly registerSuccessSignal =
    this.store.selectSignal(
      AuthSelectors.selectRegisterSuccess,
    );


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor() {

  

    effect(() => {

      const error =
        this.authErrorSignal();


      console.log(
        '🔥 COMPONENT ERROR:',
        error,
      );


      if (!error) {

        return;

      }


      this.handleServerError(
        error,
      );

    });



  

  }


  // ==========================================
  // UPDATE FIELD
  // ==========================================

  setField(

    field: Exclude<
      RegisterField,
      'terms'
    >,

    value: string,

  ): void {

    this.form = {

      ...this.form,

      [field]: value,

    };




    if (this.errors[field]) {

      this.errors = {

        ...this.errors,

        [field]: undefined,

        register: undefined,

      };

    }




    if (this.authErrorSignal()) {

      this.store.dispatch(
        AuthActions.clearRegister(),
      );

    }

  }


  // ==========================================
  // TERMS
  // ==========================================

  updateTerms(
    value: boolean,
  ): void {

    this.agreed =
      value;


    if (this.errors.terms) {

      this.errors = {

        ...this.errors,

        terms: undefined,

      };

    }




    if (this.authErrorSignal()) {

      this.store.dispatch(
        AuthActions.clearRegister(),
      );

    }

  }


  // ==========================================
  // SUBMIT
  // ==========================================

  handleSubmit(): void {

    if (this.loadingSignal()) {

      return;

    }


    // ========================================
    // CLEAR OLD UI ERROR
    // ========================================

    this.errors = {};


    // ========================================
    // CREATE REQUEST
    // ========================================

    const data: RegisterRequest = {

      username:
        this.form.username.trim(),

      email:
        this.form.email.trim(),

      password:
        this.form.password,

      confirm:
        this.form.confirm,

      terms:
        this.agreed,

    };


    // ========================================
    // DISPATCH
    // ========================================

    this.store.dispatch(

      AuthActions.register({

        data,

      }),

    );

  }


  // ==========================================
  // SERVER ERROR
  // ==========================================

  private handleServerError(
    error: any,
  ): void {

    console.log(
      '🔥 AUTH ERROR FROM STORE:',
      error,
    );


    const nextErrors:
      RegisterErrors = {};


    // ========================================
    // NESTJS ERROR
    // ========================================

    if (
      Array.isArray(error?.errors)
    ) {

      for (
        const item of error.errors
      ) {

        const field =
          item?.field as RegisterField;


        const messages =
          Array.isArray(item?.messages)
            ? item.messages
            : [];


        if (
          !messages.length
        ) {

          continue;

        }


        const message =
          messages.join(', ');


        switch (field) {

          case 'username':

            nextErrors.username =
              message;

            break;


          case 'email':

            nextErrors.email =
              message;

            break;


          case 'password':

            nextErrors.password =
              message;

            break;


          case 'confirm':

            nextErrors.confirm =
              message;

            break;


          case 'terms':

            nextErrors.terms =
              message;

            break;


          default:

            nextErrors.register =
              message;

            break;

        }

      }

    }


    // ========================================
    // GENERAL ERROR
    // ========================================

    if (
      Object.keys(nextErrors).length === 0
    ) {

      nextErrors.register =
        error?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';

    }


    this.errors =
      nextErrors;


    console.log(
      '🔥 UI ERRORS:',
      this.errors,
    );

  }


  // ==========================================
  // PASSWORD TOGGLE
  // ==========================================

  togglePassword(): void {

    this.showPw =
      !this.showPw;

  }


  // ==========================================
  // PASSWORD STRENGTH
  // ==========================================

  getPasswordStrength(): number {

    const password =
      this.form.password;


    if (!password) {

      return 0;

    }


    let score = 0;


    if (
      password.length >= 4
    ) {

      score++;

    }


    if (
      password.length >= 8
    ) {

      score++;

    }


    if (
      password.length >= 12
    ) {

      score++;

    }


    return score;

  }


  // ==========================================
  // PASSWORD STRENGTH LABEL
  // ==========================================

  getPasswordStrengthLabel(): string {

    const length =
      this.form.password.length;


    if (
      length < 4
    ) {

      return 'Yếu';

    }


    if (
      length < 8
    ) {

      return 'Trung bình';

    }


    if (
      length < 12
    ) {

      return 'Tốt';

    }


    return 'Mạnh';

  }


  // ==========================================
  // PASSWORD STRENGTH COLOR
  // ==========================================

  getPasswordStrengthColor(
    index: number,
  ): string {

    const strength =
      this.getPasswordStrength();


    if (
      strength <
      index + 1
    ) {

      return '#1e1e1e';

    }


    if (
      index === 0
    ) {

      return '#ef4444';

    }


    if (
      index === 1
    ) {

      return '#f59e0b';

    }


    return '#22c55e';

  }

}
