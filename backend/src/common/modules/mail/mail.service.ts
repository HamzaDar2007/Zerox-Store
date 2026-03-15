import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { withRetry } from '../../utils/retry.util';
import {
  EmailTemplate,
  OrderItemInfo,
  welcomeEmail,
  adminNewUserAlert,
  passwordResetEmail,
  passwordChangedEmail,
  orderConfirmationEmail,
  orderStatusUpdateEmail,
  orderCancellationEmail,
  sellerNewOrderEmail,
  adminNewOrderAlert,
  shipmentCreatedEmail,
  shipmentStatusUpdateEmail,
  paymentSuccessEmail,
  paymentFailureEmail,
  refundRequestedEmail,
  refundCompletedEmail,
  refundRejectedEmail,
  returnRequestedEmail,
  sellerNewReturnEmail,
  returnStatusUpdateEmail,
  disputeOpenedEmail,
  disputeStatusUpdateEmail,
  disputeNewMessageEmail,
  sellerNewReviewEmail,
  reviewStatusEmail,
  sellerApplicationReceivedEmail,
  adminNewSellerAlert,
  sellerVerificationEmail,
  ticketCreatedEmail,
  adminNewTicketAlert,
  ticketStatusUpdateEmail,
  ticketReplyEmail,
  ticketAssignedEmail,
  subscriptionCreatedEmail,
  subscriptionCancelledEmail,
  subscriptionPausedEmail,
  subscriptionResumedEmail,
  subscriptionRenewalEmail,
  testEmail,
  emailVerificationEmail,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private readonly mailFrom: string;
  private readonly adminEmail: string;
  private readonly frontendUrl: string;
  private readonly isEnabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.isEnabled =
      this.config.get<string>('NOTIFICATION_ENABLED', 'true') === 'true';
    this.mailFrom = this.config.get<string>(
      'MAIL_FROM',
      'Labverse <noreply@labverse.com>',
    );
    this.adminEmail = this.config.get<string>('ADMIN_EMAIL', '');
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    if (this.isEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: false, // true for 465, false for 587 (STARTTLS)
        auth: {
          user: this.config.get<string>('EMAIL_USER'),
          pass: this.config.get<string>('EMAIL_PASS'),
        },
      });
      this.logger.log('Mail transporter initialized (Gmail SMTP)');
    } else {
      this.logger.warn(
        'Email notifications are DISABLED (NOTIFICATION_ENABLED=false)',
      );
    }
  }

  // ─── Core Send Method ───────────────────────────────────────────────────────

  async sendMail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.debug(
        `Email skipped (disabled): "${template.subject}" → ${to}`,
      );
      return false;
    }

    try {
      const info = await withRetry(
        () =>
          this.transporter.sendMail({
            from: this.mailFrom,
            to,
            subject: template.subject,
            html: template.html,
          }),
        3,
        1000,
        'MailService',
      );
      this.logger.log(
        `Email sent: "${template.subject}" → ${to} (messageId: ${info.messageId})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email: "${template.subject}" → ${to}`,
        error.stack,
      );
      return false;
    }
  }

  // ─── Auth Emails ────────────────────────────────────────────────────────────

  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    await this.sendMail(email, welcomeEmail(name || 'User'));

    // Also notify admin
    if (this.adminEmail) {
      await this.sendMail(
        this.adminEmail,
        adminNewUserAlert(name || 'User', email),
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      passwordResetEmail(name || 'User', resetToken, this.frontendUrl),
    );
  }
  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    await this.sendMail(email, passwordChangedEmail(name || 'User'));
  }

  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      emailVerificationEmail(
        name || 'User',
        verificationToken,
        this.frontendUrl,
      ),
    );
  }

  // ─── Order Emails ───────────────────────────────────────────────────────────

  async sendOrderConfirmation(
    email: string,
    name: string,
    orderNumber: string,
    totalAmount: number,
    currencyCode: string,
    items: OrderItemInfo[],
  ): Promise<void> {
    await this.sendMail(
      email,
      orderConfirmationEmail(
        name,
        orderNumber,
        totalAmount,
        currencyCode,
        items,
      ),
    );
  }

  async sendOrderStatusUpdate(
    email: string,
    name: string,
    orderNumber: string,
    previousStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      orderStatusUpdateEmail(name, orderNumber, previousStatus, newStatus),
    );
  }

  async sendOrderCancellation(
    email: string,
    name: string,
    orderNumber: string,
    reason: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      orderCancellationEmail(name, orderNumber, reason),
    );
  }
  async sendSellerNewOrderEmail(
    email: string,
    sellerName: string,
    orderNumber: string,
    totalAmount: number,
    currencyCode: string,
    customerName: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      sellerNewOrderEmail(
        sellerName,
        orderNumber,
        totalAmount,
        currencyCode,
        customerName,
      ),
    );
  }

  async sendAdminNewOrderAlert(
    orderNumber: string,
    totalAmount: number,
    currencyCode: string,
    customerName: string,
  ): Promise<void> {
    if (this.adminEmail) {
      await this.sendMail(
        this.adminEmail,
        adminNewOrderAlert(
          orderNumber,
          totalAmount,
          currencyCode,
          customerName,
        ),
      );
    }
  }

  async sendShipmentCreatedEmail(
    email: string,
    name: string,
    orderNumber: string,
    trackingNumber: string,
    carrier: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      shipmentCreatedEmail(name, orderNumber, trackingNumber, carrier),
    );
  }

  async sendShipmentStatusUpdateEmail(
    email: string,
    name: string,
    orderNumber: string,
    trackingNumber: string,
    status: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      shipmentStatusUpdateEmail(name, orderNumber, trackingNumber, status),
    );
  }
  // ─── Payment Emails ────────────────────────────────────────────────────────

  async sendPaymentSuccess(
    email: string,
    name: string,
    paymentNumber: string,
    amount: number,
    currencyCode: string,
    method: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      paymentSuccessEmail(name, paymentNumber, amount, currencyCode, method),
    );
  }

  async sendPaymentFailure(
    email: string,
    name: string,
    paymentNumber: string,
    amount: number,
    currencyCode: string,
    reason: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      paymentFailureEmail(name, paymentNumber, amount, currencyCode, reason),
    );
  }

  // ─── Refund Emails ─────────────────────────────────────────────────────────

  async sendRefundRequested(
    email: string,
    name: string,
    refundNumber: string,
    amount: number,
    currencyCode: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      refundRequestedEmail(name, refundNumber, amount, currencyCode),
    );
  }

  async sendRefundCompleted(
    email: string,
    name: string,
    refundNumber: string,
    amount: number,
    currencyCode: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      refundCompletedEmail(name, refundNumber, amount, currencyCode),
    );
  }

  async sendRefundRejected(
    email: string,
    name: string,
    refundNumber: string,
    reason: string,
  ): Promise<void> {
    await this.sendMail(email, refundRejectedEmail(name, refundNumber, reason));
  }
  // ─── Return Emails ───────────────────────────────────────────────────────────────────

  async sendReturnRequestedEmail(
    email: string,
    name: string,
    returnNumber: string,
    orderNumber: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      returnRequestedEmail(name, returnNumber, orderNumber),
    );
  }

  async sendSellerNewReturnEmail(
    email: string,
    sellerName: string,
    returnNumber: string,
    orderNumber: string,
    customerName: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      sellerNewReturnEmail(sellerName, returnNumber, orderNumber, customerName),
    );
  }

  async sendReturnStatusUpdateEmail(
    email: string,
    name: string,
    returnNumber: string,
    status: string,
    notes?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      returnStatusUpdateEmail(name, returnNumber, status, notes),
    );
  }

  // ─── Dispute Emails ──────────────────────────────────────────────────────────────────

  async sendDisputeOpenedEmail(
    email: string,
    name: string,
    disputeNumber: string,
    orderNumber: string,
    role: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      disputeOpenedEmail(name, disputeNumber, orderNumber, role),
    );
  }

  async sendDisputeStatusUpdateEmail(
    email: string,
    name: string,
    disputeNumber: string,
    status: string,
    resolution?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      disputeStatusUpdateEmail(name, disputeNumber, status, resolution),
    );
  }

  async sendDisputeNewMessageEmail(
    email: string,
    name: string,
    disputeNumber: string,
    senderName: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      disputeNewMessageEmail(name, disputeNumber, senderName),
    );
  }

  // ─── Review Emails ───────────────────────────────────────────────────────────────────

  async sendSellerNewReviewEmail(
    email: string,
    sellerName: string,
    productName: string,
    rating: number,
    customerName: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      sellerNewReviewEmail(sellerName, productName, rating, customerName),
    );
  }

  async sendReviewStatusEmail(
    email: string,
    name: string,
    productName: string,
    status: string,
  ): Promise<void> {
    await this.sendMail(email, reviewStatusEmail(name, productName, status));
  }

  // ─── Seller Emails ───────────────────────────────────────────────────────────────────

  async sendSellerApplicationReceivedEmail(
    email: string,
    name: string,
  ): Promise<void> {
    await this.sendMail(email, sellerApplicationReceivedEmail(name));
  }

  async sendAdminNewSellerAlert(
    sellerName: string,
    sellerEmail: string,
  ): Promise<void> {
    if (this.adminEmail) {
      await this.sendMail(
        this.adminEmail,
        adminNewSellerAlert(sellerName, sellerEmail),
      );
    }
  }

  async sendSellerVerificationEmail(
    email: string,
    name: string,
    status: string,
    reason?: string,
  ): Promise<void> {
    await this.sendMail(email, sellerVerificationEmail(name, status, reason));
  }

  // ─── Ticket Emails ───────────────────────────────────────────────────────────────────

  async sendTicketCreatedEmail(
    email: string,
    name: string,
    ticketNumber: string,
    subject: string,
  ): Promise<void> {
    await this.sendMail(email, ticketCreatedEmail(name, ticketNumber, subject));
  }

  async sendAdminNewTicketAlert(
    ticketNumber: string,
    subject: string,
    customerName: string,
  ): Promise<void> {
    if (this.adminEmail) {
      await this.sendMail(
        this.adminEmail,
        adminNewTicketAlert(ticketNumber, subject, customerName),
      );
    }
  }

  async sendTicketStatusUpdateEmail(
    email: string,
    name: string,
    ticketNumber: string,
    status: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      ticketStatusUpdateEmail(name, ticketNumber, status),
    );
  }

  async sendTicketReplyEmail(
    email: string,
    name: string,
    ticketNumber: string,
    senderName: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      ticketReplyEmail(name, ticketNumber, senderName),
    );
  }

  async sendTicketAssignedEmail(
    email: string,
    agentName: string,
    ticketNumber: string,
    subject: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      ticketAssignedEmail(agentName, ticketNumber, subject),
    );
  }

  // ─── Subscription Emails ─────────────────────────────────────────────────────────────

  async sendSubscriptionCreatedEmail(
    email: string,
    name: string,
    productName: string,
    frequency: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      subscriptionCreatedEmail(name, productName, frequency),
    );
  }

  async sendSubscriptionCancelledEmail(
    email: string,
    name: string,
    productName: string,
    reason?: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      subscriptionCancelledEmail(name, productName, reason),
    );
  }

  async sendSubscriptionPausedEmail(
    email: string,
    name: string,
    productName: string,
  ): Promise<void> {
    await this.sendMail(email, subscriptionPausedEmail(name, productName));
  }

  async sendSubscriptionResumedEmail(
    email: string,
    name: string,
    productName: string,
    nextDelivery: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      subscriptionResumedEmail(name, productName, nextDelivery),
    );
  }

  async sendSubscriptionRenewalEmail(
    email: string,
    name: string,
    productName: string,
    nextDelivery: string,
  ): Promise<void> {
    await this.sendMail(
      email,
      subscriptionRenewalEmail(name, productName, nextDelivery),
    );
  }
  // ─── Test ───────────────────────────────────────────────────────────────────

  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendMail(to, testEmail());
  }
}
