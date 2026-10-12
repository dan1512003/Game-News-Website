
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Step = 'email' | 'code' | 'password' | 'success';

type PasswordErrors = Partial<
  Record<'password' | 'confirm' | 'form', string>
>;

interface MockUser {
  id: number;
  email: string;
  password: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  // Mock dữ liệu tài khoản ngay trong file TS
  private mockUsers: MockUser[] = [
    {
      id: 1,
      email: 'an@example.com',
      password: 'Password123',
    },
    {
      id: 2,
      email: 'admin@example.com',
      password: 'Admin1234',
    },
    {
      id: 3,
      email: 'binh@example.com',
      password: 'Password123',
    },
  ];

  step: Step = 'email';

  email = '';
  code = '';
  demoCode = '';

  password = '';
  confirm = '';

  showPassword = false;
  showConfirm = false;

  error = '';
  passwordErrors: PasswordErrors = {};

  loading = false;

  private codeExpiresAt = 0;
  private readonly CODE_EXPIRY_MS = 10 * 60 * 1000;

  private readonly EMAIL_PATTERN =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Kiểm tra độ mạnh mật khẩu
  private getPasswordError(password: string): string {
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

    return '';
  }

  // Mô phỏng gửi mã xác nhận
  private sendCode(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    window.setTimeout(() => {
      const normalizedEmail = this.email.trim().toLowerCase();

      const userExists = this.mockUsers.some(
        user => user.email.toLowerCase() === normalizedEmail
      );

      if (!userExists) {
        this.error =
          'Email chưa được đăng ký. Vui lòng kiểm tra lại email.';
        this.loading = false;
        return;
      }

      // Sinh mã xác nhận mô phỏng gồm 6 chữ số
      this.demoCode = String(
        Math.floor(100000 + Math.random() * 900000)
      );

      this.codeExpiresAt = Date.now() + this.CODE_EXPIRY_MS;
      this.code = '';
      this.loading = false;
      this.step = 'code';
    }, 700);
  }

  // Bước 1: kiểm tra email
  handleEmailSubmit(event: Event): void {
    event.preventDefault();

    const value = this.email.trim().toLowerCase();

    if (!value) {
      this.error = 'Vui lòng nhập email đã đăng ký.';
      return;
    }

    if (!this.EMAIL_PATTERN.test(value)) {
      this.error = 'Email không đúng định dạng.';
      return;
    }

    this.email = value;
    this.error = '';
    this.sendCode();
  }

  onEmailChange(): void {
    this.error = '';
  }

  // Bước 2: kiểm tra mã xác nhận
  handleCodeSubmit(event: Event): void {
    event.preventDefault();

    if (!/^\d{6}$/.test(this.code)) {
      this.error = 'Vui lòng nhập đủ mã xác nhận gồm 6 số.';
      return;
    }

    if (Date.now() > this.codeExpiresAt) {
      this.error = 'Mã xác nhận đã hết hạn. Vui lòng gửi lại mã.';
      return;
    }

    if (this.code !== this.demoCode) {
      this.error = 'Mã xác nhận không đúng hoặc đã hết hạn.';
      return;
    }

    this.error = '';
    this.passwordErrors = {};
    this.step = 'password';
  }

  onCodeChange(): void {
    this.code = this.code.replace(/\D/g, '').slice(0, 6);
    this.error = '';
  }

  // Quay lại để sửa email
  changeEmail(): void {
    this.error = '';
    this.code = '';
    this.demoCode = '';
    this.codeExpiresAt = 0;
    this.step = 'email';
  }

  // Gửi lại mã xác nhận
  resendCode(): void {
    this.error = '';
    this.code = '';
    this.sendCode();
  }

  // Bước 3: đổi mật khẩu
  handlePasswordSubmit(event: Event): void {
    event.preventDefault();

    const nextErrors: PasswordErrors = {};

    const passwordError = this.getPasswordError(this.password);

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    if (!this.confirm) {
      nextErrors.confirm = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (this.password !== this.confirm) {
      nextErrors.confirm = 'Mật khẩu xác nhận không khớp.';
    }

    if (Object.keys(nextErrors).length > 0) {
      this.passwordErrors = nextErrors;
      return;
    }

    // Kiểm tra mã vẫn còn hiệu lực khi đổi mật khẩu
    if (
      !this.demoCode ||
      Date.now() > this.codeExpiresAt ||
      this.code !== this.demoCode
    ) {
      this.passwordErrors = {
        form: 'Phiên xác nhận đã hết hạn. Vui lòng gửi lại mã.',
      };
      return;
    }

    const userIndex = this.mockUsers.findIndex(
      user => user.email.toLowerCase() === this.email.toLowerCase()
    );

    if (userIndex === -1) {
      this.passwordErrors = {
        form: 'Không tìm thấy tài khoản. Vui lòng thử lại.',
      };
      return;
    }

    // Cập nhật tài khoản mock
    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      password: this.password,
    };

    this.passwordErrors = {};
    this.step = 'success';

    // Vô hiệu hóa mã sau khi sử dụng
    this.demoCode = '';
    this.codeExpiresAt = 0;
  }

  onPasswordChange(): void {
    this.passwordErrors = {
      ...this.passwordErrors,
      password: undefined,
      form: undefined,
    };
  }

  onConfirmChange(): void {
    this.passwordErrors = {
      ...this.passwordErrors,
      confirm: undefined,
      form: undefined,
    };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }
}