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
}
