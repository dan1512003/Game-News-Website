
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface MockUser {
  name: string;
  email: string;
  role: 'admin' | 'user';
  joinedAt: string;
}

type PasswordField = 'current' | 'next' | 'confirm';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(private readonly router: Router) {}

  // =========================
  // MOCK USER
  // =========================

  user: MockUser = {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    role: 'user',
    joinedAt: '12/10/2026',
  };

  name = this.user.name;
  email = this.user.email;

  private mockPassword = 'GameZone@123';

  // Email đã được sử dụng trong dữ liệu demo.
  private readonly usedEmails = [
    'admin@gmail.com',
    'demo@gmail.com',
  ];

  nameError = '';
  emailError = '';
  profileMessage = '';

  // =========================
  // EMAIL MODAL
  // =========================

  emailModalOpen = false;
  emailCode = '';
  demoEmailCode = '';
  emailCodeError = '';

  pendingProfile = {
    name: '',
    email: '',
  };

  // =========================
  // PASSWORD MODAL
  // =========================

  passwordModalOpen = false;

  passwords: Record<PasswordField, string> = {
    current: '',
    next: '',
    confirm: '',
  };

  showPasswords: Record<PasswordField, boolean> = {
    current: false,
    next: false,
    confirm: false,
  };

  passwordError = '';
  passwordMessage = '';

  // =========================
  // PROFILE
  // =========================

  saveProfile(): void {
    const normalizedName = this.name.trim();
    const normalizedEmail = this.email.trim().toLowerCase();

    this.nameError = '';
    this.emailError = '';
    this.profileMessage = '';

    if (normalizedName.length < 3) {
      this.nameError = 'Tên hiển thị phải có ít nhất 3 ký tự.';
      return;
    }

    if (!normalizedEmail) {
      this.emailError = 'Vui lòng nhập email.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      this.emailError = 'Email không đúng định dạng.';
      return;
    }

    if (
      normalizedEmail !== this.user.email.toLowerCase() &&
      this.usedEmails.includes(normalizedEmail)
    ) {
      this.emailError = 'Email này đã được sử dụng bởi tài khoản khác.';
      return;
    }

    if (normalizedEmail !== this.user.email.toLowerCase()) {
      this.pendingProfile = {
        name: normalizedName,
        email: normalizedEmail,
      };

      this.demoEmailCode = this.generateCode();
      this.emailCode = '';
      this.emailCodeError = '';
      this.emailModalOpen = true;
      return;
    }

    this.user = {
      ...this.user,
      name: normalizedName,
    };

    this.name = normalizedName;
    this.email = this.user.email;
    this.profileMessage = 'Thông tin cá nhân đã được cập nhật.';
  }

  // =========================
  // CONFIRM EMAIL
  // =========================

  confirmNewEmail(): void {
    this.emailCodeError = '';

    if (!/^\d{6}$/.test(this.emailCode)) {
      this.emailCodeError = 'Vui lòng nhập đủ mã xác nhận gồm 6 số.';
      return;
    }

    if (this.emailCode !== this.demoEmailCode) {
      this.emailCodeError = 'Mã xác nhận không đúng hoặc đã hết hạn.';
      return;
    }

    if (this.usedEmails.includes(this.pendingProfile.email)) {
      this.emailCodeError = 'Email này đã được sử dụng bởi tài khoản khác.';
      return;
    }

    this.user = {
      ...this.user,
      name: this.pendingProfile.name,
      email: this.pendingProfile.email,
    };

    this.name = this.user.name;
    this.email = this.user.email;

    this.closeEmailModal();

    this.nameError = '';
    this.emailError = '';
    this.profileMessage = 'Email và thông tin cá nhân đã được cập nhật.';
  }

  resendEmailCode(): void {
    if (!this.pendingProfile.email) {
      return;
    }

    this.demoEmailCode = this.generateCode();
    this.emailCode = '';
    this.emailCodeError = '';
  }

  closeEmailModal(): void {
    this.emailModalOpen = false;
    this.emailCode = '';
    this.emailCodeError = '';
  }

  onEmailCodeInput(value: string): void {
    this.emailCode = value.replace(/\D/g, '').slice(0, 6);
    this.emailCodeError = '';
  }

  // =========================
  // PASSWORD
  // =========================

  openPasswordModal(): void {
    this.passwordModalOpen = true;
    this.passwordError = '';
    this.passwordMessage = '';
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordMessage = '';

    if (!this.passwords.current) {
      this.passwordError = 'Vui lòng nhập mật khẩu hiện tại.';
      return;
    }

    if (this.passwords.current !== this.mockPassword) {
      this.passwordError = 'Mật khẩu hiện tại không đúng.';
      return;
    }

    const next = this.passwords.next;

    if (next.length < 8) {
      this.passwordError = 'Mật khẩu phải có ít nhất 8 ký tự.';
      return;
    }

    if (!/[a-z]/.test(next) || !/[A-Z]/.test(next)) {
      this.passwordError = 'Mật khẩu phải gồm cả chữ hoa và chữ thường.';
      return;
    }

    if (!/\d/.test(next)) {
      this.passwordError = 'Mật khẩu phải có ít nhất một chữ số.';
      return;
    }

    if (next !== this.passwords.confirm) {
      this.passwordError = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    if (this.passwords.current === next) {
      this.passwordError = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
      return;
    }

    this.mockPassword = next;

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

    this.passwordMessage = 'Mật khẩu đã được thay đổi thành công.';
  }

  togglePassword(field: PasswordField): void {
    this.showPasswords[field] = !this.showPasswords[field];
  }

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

  // =========================
  // MOCK LOGOUT
  // =========================

  logout(): void {
    window.alert('Đăng xuất thành công! Đây là dữ liệu demo.');

    void this.router.navigate([
      this.user.role === 'admin' ? '/admin/login' : '/',
    ]);
  }

  // =========================
  // HELPERS
  // =========================

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}