import {
  Component,
  DestroyRef,
  OnInit,
  effect,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import * as AuthActions from '../../../store/auth/auth.actions';

import {
  selectAuthUser,
  selectLoading,
  selectEmailResetSessionId,
} from '../../../store/auth/auth.selectors';

import {
  ApiErrorResponse,
} from '../../../shared/models/auth/auth.model';

type PasswordField =
  | 'current'
  | 'next'
  | 'confirm';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  private readonly store = inject(Store);

  private readonly actions$ =
    inject(Actions);

  private readonly destroyRef =
    inject(DestroyRef);


  // =====================================================
  // NGRX SELECT SIGNALS
  // =====================================================

  readonly user =
    this.store.selectSignal(selectAuthUser);

  readonly loading =
    this.store.selectSignal(selectLoading);

  readonly emailResetSessionId =
    this.store.selectSignal(
      selectEmailResetSessionId,
    );


  // =====================================================
  // PROFILE FORM
  // =====================================================

  name = '';

  email = '';

  private formInitialized = false;

  nameError = '';

  emailError = '';

  profileMessage = '';

  profileError = '';


  /**
   * Lưu dữ liệu người dùng đang muốn thay đổi.
   *
   * email:
   *   email mới
   *
   * username:
   *   username mới
   *
   * userId:
   *   ID người dùng hiện tại
   */
  pendingProfile = {
    userId: '',
    username: '',
    email: '',
  };


  // =====================================================
  // EMAIL OTP MODAL
  // =====================================================

  emailModalOpen = false;

  emailCode = '';

  emailCodeError = '';

  emailMessage = '';


  // =====================================================
  // PASSWORD MODAL
  // =====================================================

  passwordModalOpen = false;

  passwords: Record<
    PasswordField,
    string
  > = {
    current: '',
    next: '',
    confirm: '',
  };


  showPasswords: Record<
    PasswordField,
    boolean
  > = {
    current: false,
    next: false,
    confirm: false,
  };


  passwordError = '';

  passwordMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    /**
     * Đồng bộ dữ liệu user từ Store vào form.
     *
     * Chỉ khởi tạo một lần để tránh việc
     * Store thay đổi làm ghi đè dữ liệu
     * mà người dùng đang nhập.
     */
    effect(() => {

      const currentUser =
        this.user();

      if (
        currentUser &&
        !this.formInitialized
      ) {

        this.name =
          currentUser.username;

        this.email =
          currentUser.email;

        this.formInitialized = true;
      }
    });
  }


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.listenAuthActions();
  }


  // =====================================================
  // AUTH ACTION LISTENERS
  // =====================================================

  private listenAuthActions(): void {

    // ===================================================
    // SEND EMAIL RESET OTP SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.sendEmailResetOtpSuccess,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ response }) => {

          console.log(
            '[Profile] Send email OTP success:',
            response,
          );

          /**
           * Reducer đã lưu:
           *
           * emailResetSessionId =
           * response.data.sessionId
           *
           * vào AuthState.
           */

          this.emailModalOpen =
            true;

          this.emailCode = '';

          this.emailCodeError = '';

          this.emailMessage =
            'Mã xác nhận đã được gửi đến email mới.';

          this.profileError = '';
        },
      );


    // ===================================================
    // SEND EMAIL RESET OTP FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.sendEmailResetOtpFailure,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ error }) => {

          console.error(
            '[Profile] Send email OTP failure:',
            error,
          );

          this.profileError =
            this.getErrorMessage(error);
        },
      );


    // ===================================================
    // RESET EMAIL SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.resetEmailSuccess,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ response }) => {

          console.log(
            '[Profile] Reset email success:',
            response,
          );

          this.emailModalOpen =
            false;

          this.emailCode = '';

          this.emailCodeError = '';

          this.emailMessage = '';

          this.profileError = '';

          this.emailError = '';

          this.profileMessage =
            'Email đã được cập nhật thành công.';


          /**
           * Reset email thành công.
           *
           * Reducer đã:
           *
           * emailResetSessionId = null
           *
           * và cập nhật user nếu backend
           * trả về user.
           *
           * Refresh lại user để đảm bảo
           * Store có dữ liệu mới nhất.
           */
          this.store.dispatch(
            AuthActions.refresh(),
          );
        },
      );


    // ===================================================
    // RESET EMAIL FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.resetEmailFailure,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ error }) => {

          console.error(
            '[Profile] Reset email failure:',
            error,
          );

          this.emailCodeError =
            this.getErrorMessage(error);
        },
      );


    // ===================================================
    // REFRESH SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.refreshSuccess,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ response }) => {

          console.log(
            '[Profile] Refresh success:',
            response,
          );

          const currentUser =
            this.user();

          if (!currentUser) {
            return;
          }


          /**
           * Cập nhật email trên form
           * từ user mới nhất.
           */
          this.email =
            currentUser.email;


          /**
           * Nếu username cũng thay đổi
           * trong cùng lần Save Profile,
           * thì sau khi email reset thành công
           * mới tiếp tục update username.
           */
          if (
            this.pendingProfile.username &&
            this.pendingProfile.username !==
              currentUser.username
          ) {

            this.store.dispatch(
              AuthActions.updateUsername({
                data: {
                  userId:
                    currentUser.userId,

                  username:
                    this.pendingProfile.username,
                },
              }),
            );

            return;
          }


          /**
           * Không còn username cần update.
           */
          this.name =
            currentUser.username;

          this.pendingProfile = {
            userId: '',
            username: '',
            email: '',
          };
        },
      );


    // ===================================================
    // REFRESH FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.refreshFailure,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ error }) => {

          console.error(
            '[Profile] Refresh failure:',
            error,
          );

          this.profileError =
            this.getErrorMessage(error);
        },
      );


    // ===================================================
    // UPDATE USERNAME SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.updateUsernameSuccess,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        () => {

          this.name =
            this.pendingProfile.username ||
            this.name;

          this.nameError = '';

          this.profileError = '';

          this.profileMessage =
            'Thông tin cá nhân đã được cập nhật.';


          /**
           * Xóa dữ liệu pending sau khi
           * toàn bộ quá trình hoàn tất.
           */
          this.pendingProfile = {
            userId: '',
            username: '',
            email: '',
          };
        },
      );


    // ===================================================
    // UPDATE USERNAME FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.updateUsernameFailure,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ error }) => {

          console.error(
            '[Profile] Update username failure:',
            error,
          );

          this.profileError =
            this.getErrorMessage(error);
        },
      );


    // ===================================================
    // CHANGE PASSWORD SUCCESS
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.changePasswordSuccess,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        () => {

          this.passwords = {
            current: '',
            next: '',
            confirm: '',
          };

          this.showPasswords = {
            current: false,
            next: false,
            confirm: false,
          };

          this.passwordError = '';

          this.passwordMessage =
            'Mật khẩu đã được thay đổi thành công.';
        },
      );


    // ===================================================
    // CHANGE PASSWORD FAILURE
    // ===================================================

    this.actions$
      .pipe(
        ofType(
          AuthActions.changePasswordFailure,
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe(
        ({ error }) => {

          console.error(
            '[Profile] Change password failure:',
            error,
          );

          this.passwordError =
            this.getErrorMessage(error);
        },
      );
  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  saveProfile(): void {

    const currentUser =
      this.user();

    if (!currentUser) {

      this.profileError =
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.';

      return;
    }


    const username =
      this.name.trim();

    const email =
      this.email
        .trim()
        .toLowerCase();


    this.nameError = '';

    this.emailError = '';

    this.profileMessage = '';

    this.profileError = '';


    // ===================================================
    // VALIDATE USERNAME
    // ===================================================

    if (username.length < 3) {

      this.nameError =
        'Tên hiển thị phải có ít nhất 3 ký tự.';

      return;
    }


    // ===================================================
    // VALIDATE EMAIL
    // ===================================================

    if (!email) {

      this.emailError =
        'Vui lòng nhập email.';

      return;
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(email)
    ) {

      this.emailError =
        'Email không đúng định dạng.';

      return;
    }


    // ===================================================
    // CHECK CHANGES
    // ===================================================

    const emailChanged =
      email !==
      currentUser.email
        .trim()
        .toLowerCase();


    const usernameChanged =
      username !==
      currentUser.username;


    if (
      !emailChanged &&
      !usernameChanged
    ) {

      this.profileMessage =
        'Thông tin không có thay đổi.';

      return;
    }


    // ===================================================
    // SAVE PENDING PROFILE
    // ===================================================

    this.pendingProfile = {
      userId:
        currentUser.userId,

      username,

      email,
    };


    // ===================================================
    // EMAIL CHANGED
    // ===================================================

    if (emailChanged) {

      this.emailCode = '';

      this.emailCodeError = '';

      this.emailMessage = '';


      /**
       * Chỉ gửi email + emailNew.
       *
       * Backend sẽ tạo sessionId.
       *
       * Response:
       *
       * {
       *   data: {
       *     sessionId,
       *     message,
       *     expiresIn
       *   }
       * }
       *
       * Reducer tự lưu sessionId
       * vào:
       *
       * emailResetSessionId
       */
      this.store.dispatch(
        AuthActions.sendEmailResetOtp({
          data: {
            email:
              currentUser.email,

            emailNew:
              email,
          },
        }),
      );

      return;
    }


    // ===================================================
    // ONLY USERNAME CHANGED
    // ===================================================

    this.store.dispatch(
      AuthActions.updateUsername({
        data: {
          userId:
            currentUser.userId,

          username,
        },
      }),
    );
  }


  // =====================================================
  // CONFIRM EMAIL OTP
  // =====================================================

  confirmNewEmail(): void {

    const currentUser =
      this.user();

    if (!currentUser) {

      this.emailCodeError =
        'Không tìm thấy thông tin người dùng.';

      return;
    }


    // ===================================================
    // GET OTP
    // ===================================================

    const otp =
      this.emailCode.trim();


    if (!/^\d{6}$/.test(otp)) {

      this.emailCodeError =
        'Vui lòng nhập đủ mã xác nhận gồm 6 số.';

      return;
    }


    // ===================================================
    // GET SESSION ID FROM STORE
    // ===================================================

    const sessionId =
      this.emailResetSessionId();


    if (!sessionId) {

      this.emailCodeError =
        'Phiên xác thực đã hết hạn. Vui lòng gửi lại mã xác nhận.';

      return;
    }


    this.emailCodeError = '';


    // ===================================================
    // RESET EMAIL
    // ===================================================

    this.store.dispatch(
      AuthActions.resetEmail({
        data: {
          email:
            currentUser.email,

          newEmail:
            this.pendingProfile.email,

          otp,

          sessionId,
        },
      }),
    );
  }


  // =====================================================
  // RESEND EMAIL OTP
  // =====================================================

  resendEmailCode(): void {

    const currentUser =
      this.user();

    if (
      !currentUser ||
      !this.pendingProfile.email
    ) {
      return;
    }


    this.emailCode = '';

    this.emailCodeError = '';

    this.emailMessage = '';


    /**
     * Gửi request mới.
     *
     * Backend tạo sessionId mới.
     *
     * Reducer sẽ ghi đè:
     *
     * emailResetSessionId
     *
     * bằng sessionId mới.
     */
    this.store.dispatch(
      AuthActions.sendEmailResetOtp({
        data: {
          email:
            currentUser.email,

          emailNew:
            this.pendingProfile.email,
        },
      }),
    );
  }


  // =====================================================
  // EMAIL CODE INPUT
  // =====================================================

  onEmailCodeInput(
    value: string,
  ): void {

    this.emailCode =
      value
        .replace(/\D/g, '')
        .slice(0, 6);

    this.emailCodeError = '';
  }


  // =====================================================
  // CLOSE EMAIL MODAL
  // =====================================================

  closeEmailModal(): void {

    this.emailModalOpen = false;

    this.emailCode = '';

    this.emailCodeError = '';

    this.emailMessage = '';
  }


  // =====================================================
  // OPEN PASSWORD MODAL
  // =====================================================

  openPasswordModal(): void {

    this.passwordModalOpen = true;

    this.passwordError = '';

    this.passwordMessage = '';
  }


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  changePassword(): void {

    this.passwordError = '';

    this.passwordMessage = '';


    const currentPassword =
      this.passwords.current;

    const newPassword =
      this.passwords.next;

    const confirmPassword =
      this.passwords.confirm;


    // ===================================================
    // CURRENT PASSWORD
    // ===================================================

    if (!currentPassword) {

      this.passwordError =
        'Vui lòng nhập mật khẩu hiện tại.';

      return;
    }


    // ===================================================
    // PASSWORD LENGTH
    // ===================================================

    if (
      newPassword.length < 8
    ) {

      this.passwordError =
        'Mật khẩu phải có ít nhất 8 ký tự.';

      return;
    }


    // ===================================================
    // LOWERCASE + UPPERCASE
    // ===================================================

    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword)
    ) {

      this.passwordError =
        'Mật khẩu phải gồm cả chữ hoa và chữ thường.';

      return;
    }


    // ===================================================
    // NUMBER
    // ===================================================

    if (
      !/\d/.test(newPassword)
    ) {

      this.passwordError =
        'Mật khẩu phải có ít nhất một chữ số.';

      return;
    }


    // ===================================================
    // CONFIRM PASSWORD
    // ===================================================

    if (
      newPassword !==
      confirmPassword
    ) {

      this.passwordError =
        'Mật khẩu xác nhận không khớp.';

      return;
    }


    // ===================================================
    // PASSWORD MUST CHANGE
    // ===================================================

    if (
      currentPassword ===
      newPassword
    ) {

      this.passwordError =
        'Mật khẩu mới phải khác mật khẩu hiện tại.';

      return;
    }


    // ===================================================
    // CURRENT USER
    // ===================================================

    const currentUser =
      this.user();

    if (!currentUser) {

      this.passwordError =
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.';

      return;
    }


    // ===================================================
    // DISPATCH CHANGE PASSWORD
    // ===================================================

    this.store.dispatch(
      AuthActions.changePassword({
        data: {
          userId:
            currentUser.userId,

          currentPassword,

          newPassword,

          confirmPassword,
        },
      }),
    );
  }


  // =====================================================
  // TOGGLE PASSWORD
  // =====================================================

  togglePassword(
    field: PasswordField,
  ): void {

    this.showPasswords[field] =
      !this.showPasswords[field];
  }


  // =====================================================
  // CLOSE PASSWORD MODAL
  // =====================================================

  closePasswordModal(): void {

    this.passwordModalOpen = false;

    this.passwords = {
      current: '',
      next: '',
      confirm: '',
    };

    this.showPasswords = {
      current: false,
      next: false,
      confirm: false,
    };

    this.passwordError = '';

    this.passwordMessage = '';
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.store.dispatch(
      AuthActions.logout(),
    );
  }


  // =====================================================
  // ERROR HELPER
  // =====================================================

  private getErrorMessage(
    error: ApiErrorResponse,
  ): string {

    if (
      error.errors?.length
    ) {

      return error.errors
        .flatMap(
          (item) =>
            item.messages,
        )
        .join(' ');
    }


    return (
      error.message ||
      'Đã xảy ra lỗi. Vui lòng thử lại.'
    );
  }
}