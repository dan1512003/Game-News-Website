import {
  Component,
  DestroyRef,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

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
  Actions,
  ofType,
} from '@ngrx/effects';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import * as AuthActions
  from '../../../../store/auth/auth.actions';

import {
  selectLoading,
} from '../../../../store/auth/auth.selectors';

import {
  ApiErrorResponse,
} from '../../../../shared/models/auth/auth.model';


// =====================================================
// TYPES
// =====================================================

type Step =
  | 'email'
  | 'code'
  | 'password'
  | 'success';


type PasswordErrors = Partial<
  Record<
    'password' | 'confirm' | 'form',
    string
  >
>;


// =====================================================
// COMPONENT
// =====================================================

@Component({
  selector: 'app-forgot-password',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],

  templateUrl: './forgot-password.html',

  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private readonly store = inject(Store);

  private readonly actions$ = inject(Actions);

  private readonly destroyRef =
    inject(DestroyRef);


  // =====================================================
  // NGRX SIGNALS
  // =====================================================

  readonly loading =
    this.store.selectSignal(selectLoading);


  // =====================================================
  // STATE
  // =====================================================

  step: Step = 'email';

  email = '';

  /**
   * Session ID của password reset flow.
   *
   * Backend tạo session mới khi request gửi OTP
   * thành công.
   *
   * SessionId này được dùng để verify OTP.
   */
  sessionId = '';

  code = '';

  password = '';

  confirm = '';

  showPassword = false;

  showConfirm = false;


  // =====================================================
  // GENERAL ERROR
  // =====================================================

  error = '';


  // =====================================================
  // PASSWORD ERRORS
  // =====================================================

  passwordErrors: PasswordErrors = {};


  // =====================================================
  // VALIDATION
  // =====================================================

  private readonly EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.listenAuthActions();
  }


  // =====================================================
  // AUTH ACTION LISTENERS
  // =====================================================

  private listenAuthActions(): void {

    // ===================================================
    // REQUEST PASSWORD RESET SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.requestPasswordResetSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ response }) => {

        this.error = '';

        this.code = '';

        this.password = '';

        this.confirm = '';

        this.passwordErrors = {};

        this.showPassword = false;

        this.showConfirm = false;


        // -----------------------------------------------
        // SAVE SESSION ID
        // -----------------------------------------------

        this.sessionId =
          response.data.sessionId;


        // -----------------------------------------------
        // GO TO OTP STEP
        // -----------------------------------------------

        this.step = 'code';
      });


    // ===================================================
    // REQUEST PASSWORD RESET FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.requestPasswordResetFailure,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ error }) => {

        this.error =
          this.getErrorMessage(error);
      });


    // ===================================================
    // VERIFY PASSWORD RESET OTP SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.verifyPasswordResetOtpSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {

        this.error = '';

        this.code = '';

        this.password = '';

        this.confirm = '';

        this.passwordErrors = {};

        this.showPassword = false;

        this.showConfirm = false;

        this.step = 'password';
      });


    // ===================================================
    // VERIFY PASSWORD RESET OTP FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.verifyPasswordResetOtpFailure,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ error }) => {

        this.error =
          this.getErrorMessage(error);
      });


    // ===================================================
    // RESET PASSWORD SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.resetPasswordSuccess,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {

        this.error = '';

        this.passwordErrors = {};

        this.password = '';

        this.confirm = '';

        this.showPassword = false;

        this.showConfirm = false;

        this.sessionId = '';

        this.code = '';

        this.step = 'success';
      });


    // ===================================================
    // RESET PASSWORD FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.resetPasswordFailure,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ error }) => {

        const message =
          this.getErrorMessage(error);

        this.passwordErrors = {
          ...this.passwordErrors,

          form: message,
        };

        this.error = '';
      });
  }


  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  private getPasswordError(
    password: string,
  ): string {

    if (!password) {

      return 'Vui lòng nhập mật khẩu mới.';
    }


    if (password.length < 8) {

      return 'Mật khẩu phải có ít nhất 8 ký tự.';
    }


    if (!/[A-Z]/.test(password)) {

      return 'Mật khẩu phải có ít nhất một chữ hoa.';
    }


    if (!/[a-z]/.test(password)) {

      return 'Mật khẩu phải có ít nhất một chữ thường.';
    }


    if (!/\d/.test(password)) {

      return 'Mật khẩu phải có ít nhất một chữ số.';
    }


    return '';
  }


  // =====================================================
  // BƯỚC 1
  // REQUEST PASSWORD RESET
  // =====================================================

  handleEmailSubmit(
    event: Event,
  ): void {

    event.preventDefault();


    // ---------------------------------------------------
    // PREVENT DOUBLE SUBMIT
    // ---------------------------------------------------

    if (this.loading()) {

      return;
    }


    // ---------------------------------------------------
    // CLEAR ERROR
    // ---------------------------------------------------

    this.error = '';


    // ---------------------------------------------------
    // NORMALIZE EMAIL
    // ---------------------------------------------------

    const value =
      this.email
        .trim()
        .toLowerCase();


    // ---------------------------------------------------
    // EMPTY
    // ---------------------------------------------------

    if (!value) {

      this.error =
        'Vui lòng nhập email đã đăng ký.';

      return;
    }


    // ---------------------------------------------------
    // EMAIL FORMAT
    // ---------------------------------------------------

    if (
      !this.EMAIL_PATTERN.test(value)
    ) {

      this.error =
        'Email không đúng định dạng.';

      return;
    }


    // ---------------------------------------------------
    // SAVE EMAIL
    // ---------------------------------------------------

    this.email = value;


    // ---------------------------------------------------
    // CLEAR OLD SESSION
    // ---------------------------------------------------

    this.sessionId = '';


    // ---------------------------------------------------
    // DISPATCH
    // ---------------------------------------------------

    this.store.dispatch(
      AuthActions.requestPasswordReset({
        data: {
          email: value,
        },
      }),
    );
  }


  // =====================================================
  // EMAIL CHANGE
  // =====================================================

  onEmailChange(): void {

    this.error = '';

    this.sessionId = '';
  }


  // =====================================================
  // BƯỚC 2
  // VERIFY OTP
  // =====================================================

  handleCodeSubmit(
    event: Event,
  ): void {

    event.preventDefault();


    // ---------------------------------------------------
    // PREVENT DOUBLE SUBMIT
    // ---------------------------------------------------

    if (this.loading()) {

      return;
    }


    // ---------------------------------------------------
    // CHECK SESSION
    // ---------------------------------------------------

    if (!this.sessionId) {

      this.error =
        'Phiên xác nhận không hợp lệ. Vui lòng yêu cầu mã mới.';

      return;
    }


    // ---------------------------------------------------
    // NORMALIZE OTP
    // ---------------------------------------------------

    const otp =
      this.code
        .trim();


    // ---------------------------------------------------
    // VALIDATE OTP
    // ---------------------------------------------------

    if (
      !/^\d{6}$/.test(otp)
    ) {

      this.error =
        'Vui lòng nhập đủ mã xác nhận gồm 6 số.';

      return;
    }


    // ---------------------------------------------------
    // CLEAR ERROR
    // ---------------------------------------------------

    this.error = '';


    // ---------------------------------------------------
    // DISPATCH
    // ---------------------------------------------------

    this.store.dispatch(
      AuthActions.verifyPasswordResetOtp({
        data: {
          email: this.email,

          otp,

          sessionId: this.sessionId,
        },
      }),
    );
  }


  // =====================================================
  // OTP CHANGE
  // =====================================================

  onCodeChange(): void {

    this.code =
      this.code
        .replace(/\D/g, '')
        .slice(0, 6);

    this.error = '';
  }


  // =====================================================
  // CHANGE EMAIL
  // =====================================================

  changeEmail(): void {

    if (this.loading()) {

      return;
    }


    this.error = '';

    this.email = '';

    this.sessionId = '';

    this.code = '';

    this.password = '';

    this.confirm = '';

    this.passwordErrors = {};

    this.showPassword = false;

    this.showConfirm = false;

    this.step = 'email';
  }


  // =====================================================
  // RESEND OTP
  // =====================================================

  resendCode(): void {

    if (this.loading()) {

      return;
    }


    // ---------------------------------------------------
    // EMAIL IS REQUIRED
    // ---------------------------------------------------

    if (!this.email) {

      this.sessionId = '';

      this.step = 'email';

      return;
    }


    // ---------------------------------------------------
    // CLEAR OLD STATE
    // ---------------------------------------------------

    this.error = '';

    this.code = '';


    // ---------------------------------------------------
    // REQUEST NEW OTP
    // ---------------------------------------------------
    //
    // Backend sẽ tạo sessionId mới.
    //
    // requestPasswordResetSuccess nhận response mới
    // và ghi đè this.sessionId.
    // ---------------------------------------------------

    this.store.dispatch(
      AuthActions.requestPasswordReset({
        data: {
          email: this.email,
        },
      }),
    );
  }


  // =====================================================
  // BƯỚC 3
  // RESET PASSWORD
  // =====================================================

  handlePasswordSubmit(
    event: Event,
  ): void {

    event.preventDefault();


    // ---------------------------------------------------
    // PREVENT DOUBLE SUBMIT
    // ---------------------------------------------------

    if (this.loading()) {

      return;
    }


    // ---------------------------------------------------
    // CLEAR OLD ERRORS
    // ---------------------------------------------------

    this.error = '';

    const nextErrors: PasswordErrors = {};


    // ---------------------------------------------------
    // PASSWORD
    // ---------------------------------------------------

    const passwordError =
      this.getPasswordError(
        this.password,
      );


    if (passwordError) {

      nextErrors.password =
        passwordError;
    }


    // ---------------------------------------------------
    // CONFIRM PASSWORD
    // ---------------------------------------------------

    if (!this.confirm) {

      nextErrors.confirm =
        'Vui lòng xác nhận mật khẩu mới.';

    } else if (
      this.password !== this.confirm
    ) {

      nextErrors.confirm =
        'Mật khẩu xác nhận không khớp.';
    }


    // ---------------------------------------------------
    // LOCAL VALIDATION FAILED
    // ---------------------------------------------------

    if (
      Object.keys(nextErrors).length > 0
    ) {

      this.passwordErrors =
        nextErrors;

      return;
    }


    // ---------------------------------------------------
    // CLEAR ERRORS
    // ---------------------------------------------------

    this.passwordErrors = {};


    // ---------------------------------------------------
    // DISPATCH
    // ---------------------------------------------------

this.store.dispatch(
  AuthActions.resetPassword({
    data: {
      email: this.email,

      sessionId: this.sessionId,

      newPassword: this.password,

      confirmPassword: this.confirm,
    },
  }),
);
  }


  // =====================================================
  // PASSWORD CHANGE
  // =====================================================

  onPasswordChange(): void {

    this.passwordErrors = {
      ...this.passwordErrors,

      password: undefined,

      form: undefined,
    };

    this.error = '';
  }


  // =====================================================
  // CONFIRM PASSWORD CHANGE
  // =====================================================

  onConfirmChange(): void {

    this.passwordErrors = {
      ...this.passwordErrors,

      confirm: undefined,

      form: undefined,
    };

    this.error = '';
  }


  // =====================================================
  // TOGGLE PASSWORD
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }


  // =====================================================
  // TOGGLE CONFIRM PASSWORD
  // =====================================================

  toggleConfirm(): void {

    this.showConfirm =
      !this.showConfirm;
  }


  // =====================================================
  // ERROR HELPER
  // =====================================================

  private getErrorMessage(
    error: ApiErrorResponse,
  ): string {

    if (error?.errors?.length) {

      return error.errors
        .flatMap(
          (item) => item.messages,
        )
        .join(' ');
    }


    return (
      error?.message ||
      'Đã xảy ra lỗi. Vui lòng thử lại.'
    );
  }
}