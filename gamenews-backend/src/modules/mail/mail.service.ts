import {
  Injectable,
  Logger,
} from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger =
    new Logger(MailService.name);

  private readonly transporter;

  constructor() {
    this.transporter =
      nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(
          process.env.MAIL_PORT ?? 587,
        ),
        secure:
          process.env.MAIL_SECURE === 'true',

        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

    console.log('========== MAIL CONFIG ==========');
    console.log(
      'MAIL_HOST:',
      process.env.MAIL_HOST,
    );
    console.log(
      'MAIL_PORT:',
      process.env.MAIL_PORT,
    );
    console.log(
      'MAIL_SECURE:',
      process.env.MAIL_SECURE,
    );
    console.log(
      'MAIL_USER:',
      process.env.MAIL_USER,
    );
    console.log(
      'MAIL_PASSWORD:',
      process.env.MAIL_PASSWORD
        ? 'ĐÃ CẤU HÌNH'
        : 'CHƯA CẤU HÌNH',
    );

    this.transporter.verify(
      (error, success) => {
        if (error) {
          console.error(
            '❌ SMTP ERROR:',
            error,
          );
        } else {
          console.log(
            '✅ SMTP SERVER READY',
          );
        }
      },
    );
  }

  async sendVerificationEmail(params: {
    email: string;
    username: string;
    userId: string;
    token: string;
  }) {
    const {
      email,
      username,
      userId,
      token,
    } = params;

    const verificationUrl =
      `${process.env.BACKEND_URL}` +
      `/auth/verify-email` +
      `?userId=${encodeURIComponent(userId)}` +
      `&token=${encodeURIComponent(token)}`;

    console.log(
      '📧 Sending email to:',
      email,
    );

    console.log(
      '🔗 Verification URL:',
      verificationUrl,
    );

    try {
      const info =
        await this.transporter.sendMail({
          from: `"My App" <${process.env.MAIL_USER}>`,
          to: email,

          subject:
            'Xác thực email tài khoản',

          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Xin chào ${username}</h2>

              <p>
                Cảm ơn bạn đã đăng ký tài khoản.
              </p>

              <p>
                Vui lòng bấm vào nút bên dưới
                để xác thực email:
              </p>

              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: #2563eb;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                Xác thực email
              </a>

              <p>
                Link xác thực có hiệu lực trong
                <strong>24 giờ</strong>.
              </p>

              <p>
                Nếu bạn không đăng ký tài khoản,
                hãy bỏ qua email này.
              </p>
            </div>
          `,
        });

      console.log(
        '✅ EMAIL SENT:',
        info.messageId,
      );

      return info;
    } catch (error) {
      console.error(
        '❌ SEND EMAIL ERROR:',
        error,
      );

      throw error;
    }
  }
  

  // ============================================================
// GỬI OTP XÁC THỰC reset EMAIL
// ============================================================

async sendEmailResetOtp(params: {
  email: string;
  username: string;
  otp: string;
}) {
  const {
    email,
    username,
    otp,
  } = params;

  this.logger.log(
    `Sending email verification OTP to: ${email}`,
  );

  try {
    const info =
      await this.transporter.sendMail({
        from: `"My App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Mã OTP xác thực email',

        text:
          `Xin chào ${username},\n\n` +
          `Mã OTP xác thực email của bạn là: ${otp}\n\n` +
          `Mã có hiệu lực trong 5 phút.\n` +
          `Không chia sẻ mã này với bất kỳ ai.`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 24px;
            color: #222;
          ">
            <h2>Xác thực email</h2>

            <p>
              Xin chào ${username},
            </p>

            <p>
              Sử dụng mã OTP bên dưới để xác thực
              địa chỉ email của bạn.
            </p>

            <div style="
              margin: 24px 0;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #2563eb;
              ">
                ${otp}
              </div>
            </div>

            <p>
              Mã OTP có hiệu lực trong
              <strong>5 phút</strong>.
            </p>

            <p>
              Không chia sẻ mã này với bất kỳ ai.
            </p>

            <p>
              Nếu bạn không yêu cầu xác thực email,
              hãy bỏ qua thư này.
            </p>
          </div>
        `,
      });

    this.logger.log(
      `Email verification OTP sent: ${info.messageId}`,
    );

    return info;
  } catch (error) {
    this.logger.error(
      'Failed to send email verification OTP',
      error instanceof Error
        ? error.stack
        : undefined,
    );

    throw error;
  }
}

// ============================================================
// GỬI OTP ĐẶT LẠI MẬT KHẨU
// ============================================================

async sendPasswordResetOtp(params: {
  email: string;
  username: string;
  otp: string;
}) {
  const {
    email,
    username,
    otp,
  } = params;

  this.logger.log(
    `Sending password reset OTP to: ${email}`,
  );

  try {
    const info =
      await this.transporter.sendMail({
        from: `"My App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu',

        text:
          `Xin chào ${username},\n\n` +
          `Mã OTP đặt lại mật khẩu của bạn là: ${otp}\n\n` +
          `Mã có hiệu lực trong 5 phút.\n` +
          `Không chia sẻ mã này với bất kỳ ai.\n\n` +
          `Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 560px;
            margin: 0 auto;
            padding: 24px;
            color: #222;
          ">
            <h2>Đặt lại mật khẩu</h2>

            <p>
              Xin chào ${username},
            </p>

            <p>
              Chúng tôi nhận được yêu cầu đặt lại
              mật khẩu cho tài khoản của bạn.
            </p>

            <p>
              Sử dụng mã OTP bên dưới để tiếp tục:
            </p>

            <div style="
              margin: 24px 0;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 8px;
              text-align: center;
            ">
              <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #dc2626;
              ">
                ${otp}
              </div>
            </div>

            <p>
              Mã OTP có hiệu lực trong
              <strong>5 phút</strong>.
            </p>

            <p>
              Không chia sẻ mã này với bất kỳ ai.
            </p>

            <p>
              Nếu bạn không yêu cầu đặt lại mật khẩu,
              hãy bỏ qua email này.
            </p>
          </div>
        `,
      });

    this.logger.log(
      `Password reset OTP sent: ${info.messageId}`,
    );

    return info;
  } catch (error) {
    this.logger.error(
      'Failed to send password reset OTP',
      error instanceof Error
        ? error.stack
        : undefined,
    );

    throw error;
  }
}


}
