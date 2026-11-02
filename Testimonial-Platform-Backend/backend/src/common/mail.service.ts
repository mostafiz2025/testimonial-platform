import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Sends "you received a new testimonial" e-mails.
 * If EMAIL_USER / EMAIL_PASS are not set, it silently does nothing.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT || 465),
        secure: (process.env.EMAIL_PORT || '465') === '465',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
    }
  }

  async sendNewTestimonial(
    to: string,
    spaceName: string,
    spaceId: number,
    from: string,
    type: string,
  ) {
    if (!this.transporter) return;
    const link = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard/spaces/${spaceId}`;
    try {
      await this.transporter.sendMail({
        from: `"Testimonial Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: `New ${type} testimonial for ${spaceName}`,
        html: `<p><b>${escapeHtml(from)}</b> just sent you a new ${type} testimonial for <b>${escapeHtml(spaceName)}</b>.</p><p><a href="${link}">Open your dashboard</a></p>`,
      });
    } catch (e) {
      this.logger.warn(`Could not send e-mail: ${(e as Error).message}`);
    }
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
