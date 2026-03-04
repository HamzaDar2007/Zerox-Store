/**
 * Global Email Templates
 * All emails share a consistent branded HTML layout.
 */

// ─── Base Layout ────────────────────────────────────────────────────────────────

function baseTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 36px 40px; color: #333333; line-height: 1.7; font-size: 15px; }
    .body h2 { color: #333; margin-top: 0; }
    .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
    .info-box p { margin: 4px 0; }
    .info-box strong { color: #444; }
    .btn { display: inline-block; padding: 12px 32px; background: #667eea; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-success { background: #d4edda; color: #155724; }
    .status-warning { background: #fff3cd; color: #856404; }
    .status-danger  { background: #f8d7da; color: #721c24; }
    .status-info    { background: #d1ecf1; color: #0c5460; }
    .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef; }
    .footer p { margin: 4px 0; color: #888; font-size: 12px; }
    table.items { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.items th { background: #f0f4ff; padding: 10px 12px; text-align: left; font-size: 13px; color: #555; border-bottom: 2px solid #667eea; }
    table.items td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    @media (max-width: 620px) {
      .body, .header, .footer { padding-left: 20px; padding-right: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Labverse</h1>
      <p>E-Commerce Platform</p>
    </div>
    <div class="body">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Labverse. All rights reserved.</p>
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Template Generators ────────────────────────────────────────────────────────

export interface EmailTemplate {
  subject: string;
  html: string;
}

// ── Auth Templates ──────────────────────────────────────────────────────────────

export function welcomeEmail(name: string): EmailTemplate {
  return {
    subject: 'Welcome to Labverse!',
    html: baseTemplate('Welcome', `
      <h2>Welcome aboard, ${name}! 🎉</h2>
      <p>Thank you for creating your account on <strong>Labverse</strong>. We're excited to have you with us!</p>
      <div class="info-box">
        <p><strong>What you can do now:</strong></p>
        <p>✔ Browse thousands of products</p>
        <p>✔ Add items to your cart and wishlist</p>
        <p>✔ Track your orders in real time</p>
        <p>✔ Get exclusive deals and promotions</p>
      </div>
      <p>If you have any questions, our support team is always here to help.</p>
      <p>Happy shopping!</p>
    `),
  };
}

export function adminNewUserAlert(userName: string, userEmail: string): EmailTemplate {
  return {
    subject: `New User Registration: ${userName}`,
    html: baseTemplate('New Registration', `
      <h2>New User Registration</h2>
      <p>A new user has registered on the platform:</p>
      <div class="info-box">
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can review this user in the admin dashboard.</p>
    `),
  };
}

export function passwordResetEmail(name: string, resetToken: string, frontendUrl: string): EmailTemplate {
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  return {
    subject: 'Password Reset Request – Labverse',
    html: baseTemplate('Password Reset', `
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p style="font-size: 13px; color: #888;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #667eea;">${resetUrl}</p>
      <div class="info-box">
        <p>⏰ This link expires in <strong>1 hour</strong>.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `),
  };
}

export function passwordChangedEmail(name: string): EmailTemplate {
  return {
    subject: 'Password Changed Successfully – Labverse',
    html: baseTemplate('Password Changed', `
      <h2>Password Changed Successfully</h2>
      <p>Hi ${name},</p>
      <p>Your password has been changed successfully.</p>
      <div class="info-box">
        <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
      </div>
      <p>You can now log in with your new password.</p>
    `),
  };
}

// ── Order Templates ─────────────────────────────────────────────────────────────

export interface OrderItemInfo {
  name: string;
  quantity: number;
  price: number;
}

export function orderConfirmationEmail(
  name: string,
  orderNumber: string,
  totalAmount: number,
  currencyCode: string,
  items: OrderItemInfo[],
): EmailTemplate {
  const itemRows = items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">${currencyCode} ${item.price.toFixed(2)}</td></tr>`,
    )
    .join('');

  return {
    subject: `Order Confirmed: ${orderNumber}`,
    html: baseTemplate('Order Confirmed', `
      <h2>Order Confirmed! ✅</h2>
      <p>Hi ${name}, your order has been placed successfully.</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ${currencyCode} ${totalAmount.toFixed(2)}</p>
      </div>
      ${items.length > 0 ? `
      <table class="items">
        <thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>` : ''}
      <p>We'll notify you once your order is shipped.</p>
    `),
  };
}

export function orderStatusUpdateEmail(
  name: string,
  orderNumber: string,
  previousStatus: string,
  newStatus: string,
): EmailTemplate {
  const badgeClass = getBadgeClass(newStatus);
  return {
    subject: `Order ${orderNumber} – Status Updated`,
    html: baseTemplate('Order Status Update', `
      <h2>Order Status Update</h2>
      <p>Hi ${name}, your order status has been updated:</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Previous Status:</strong> ${formatStatus(previousStatus)}</p>
        <p><strong>New Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(newStatus)}</span></p>
      </div>
      <p>You can track your order in your account dashboard.</p>
    `),
  };
}

export function orderCancellationEmail(
  name: string,
  orderNumber: string,
  reason: string,
): EmailTemplate {
  return {
    subject: `Order ${orderNumber} – Cancelled`,
    html: baseTemplate('Order Cancelled', `
      <h2>Order Cancelled</h2>
      <p>Hi ${name}, your order has been cancelled.</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
      </div>
      <p>If you didn't request this cancellation, please contact our support team immediately.</p>
    `),
  };
}

export function sellerNewOrderEmail(
  sellerName: string, orderNumber: string, totalAmount: number, currencyCode: string, customerName: string,
): EmailTemplate {
  return {
    subject: `New Order Received: ${orderNumber}`,
    html: baseTemplate('New Order', `
      <h2>New Order Received! 🛒</h2>
      <p>Hi ${sellerName}, you have received a new order.</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total Amount:</strong> ${currencyCode} ${totalAmount.toFixed(2)}</p>
        <p><strong>Received at:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please review and process this order from your seller dashboard.</p>
    `),
  };
}

export function adminNewOrderAlert(
  orderNumber: string, totalAmount: number, currencyCode: string, customerName: string,
): EmailTemplate {
  return {
    subject: `New Order Alert: ${orderNumber}`,
    html: baseTemplate('New Order Alert', `
      <h2>New Order Placed</h2>
      <p>A new order has been placed on the platform:</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Amount:</strong> ${currencyCode} ${totalAmount.toFixed(2)}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `),
  };
}

export function shipmentCreatedEmail(
  name: string, orderNumber: string, trackingNumber: string, carrier: string,
): EmailTemplate {
  return {
    subject: `Order ${orderNumber} – Shipment Created`,
    html: baseTemplate('Shipment Created', `
      <h2>Your Order Has Been Shipped! 📦</h2>
      <p>Hi ${name}, great news! Your order is on its way.</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber || 'Pending'}</p>
        <p><strong>Carrier:</strong> ${carrier || 'Standard Shipping'}</p>
      </div>
      <p>You can track your shipment from your account dashboard.</p>
    `),
  };
}

export function shipmentStatusUpdateEmail(
  name: string, orderNumber: string, trackingNumber: string, status: string,
): EmailTemplate {
  const badgeClass = getBadgeClass(status);
  return {
    subject: `Shipment Update – Order ${orderNumber}`,
    html: baseTemplate('Shipment Update', `
      <h2>Shipment Status Update</h2>
      <p>Hi ${name}, your shipment status has been updated:</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber || 'N/A'}</p>
        <p><strong>New Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(status)}</span></p>
      </div>
    `),
  };
}

// ── Payment Templates ───────────────────────────────────────────────────────────

export function paymentSuccessEmail(
  name: string,
  paymentNumber: string,
  amount: number,
  currencyCode: string,
  method: string,
): EmailTemplate {
  return {
    subject: `Payment Successful: ${paymentNumber}`,
    html: baseTemplate('Payment Successful', `
      <h2>Payment Successful! 💳</h2>
      <p>Hi ${name}, your payment has been processed successfully.</p>
      <div class="info-box">
        <p><strong>Payment Number:</strong> ${paymentNumber}</p>
        <p><strong>Amount:</strong> ${currencyCode} ${amount.toFixed(2)}</p>
        <p><strong>Method:</strong> ${formatStatus(method)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Completed</span></p>
      </div>
    `),
  };
}

export function paymentFailureEmail(
  name: string,
  paymentNumber: string,
  amount: number,
  currencyCode: string,
  reason: string,
): EmailTemplate {
  return {
    subject: `Payment Failed: ${paymentNumber}`,
    html: baseTemplate('Payment Failed', `
      <h2>Payment Failed ❌</h2>
      <p>Hi ${name}, unfortunately your payment could not be processed.</p>
      <div class="info-box">
        <p><strong>Payment Number:</strong> ${paymentNumber}</p>
        <p><strong>Amount:</strong> ${currencyCode} ${amount.toFixed(2)}</p>
        <p><strong>Reason:</strong> ${reason || 'Unknown error'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-danger">Failed</span></p>
      </div>
      <p>Please try again or use a different payment method.</p>
    `),
  };
}

// ── Refund Templates ────────────────────────────────────────────────────────────

export function refundRequestedEmail(
  name: string,
  refundNumber: string,
  amount: number,
  currencyCode: string,
): EmailTemplate {
  return {
    subject: `Refund Requested: ${refundNumber}`,
    html: baseTemplate('Refund Requested', `
      <h2>Refund Request Received</h2>
      <p>Hi ${name}, we have received your refund request.</p>
      <div class="info-box">
        <p><strong>Refund Number:</strong> ${refundNumber}</p>
        <p><strong>Amount:</strong> ${currencyCode} ${amount.toFixed(2)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-warning">Pending</span></p>
      </div>
      <p>We'll notify you once the refund is processed.</p>
    `),
  };
}

export function refundCompletedEmail(
  name: string,
  refundNumber: string,
  amount: number,
  currencyCode: string,
): EmailTemplate {
  return {
    subject: `Refund Completed: ${refundNumber}`,
    html: baseTemplate('Refund Completed', `
      <h2>Refund Processed! ✅</h2>
      <p>Hi ${name}, your refund has been processed successfully.</p>
      <div class="info-box">
        <p><strong>Refund Number:</strong> ${refundNumber}</p>
        <p><strong>Amount:</strong> ${currencyCode} ${amount.toFixed(2)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Completed</span></p>
      </div>
      <p>The amount will be credited back to your original payment method within 5–10 business days.</p>
    `),
  };
}

export function refundRejectedEmail(
  name: string,
  refundNumber: string,
  reason: string,
): EmailTemplate {
  return {
    subject: `Refund Rejected: ${refundNumber}`,
    html: baseTemplate('Refund Rejected', `
      <h2>Refund Request Rejected</h2>
      <p>Hi ${name}, unfortunately your refund request has been rejected.</p>
      <div class="info-box">
        <p><strong>Refund Number:</strong> ${refundNumber}</p>
        <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-danger">Rejected</span></p>
      </div>
      <p>If you believe this is an error, please contact our support team.</p>
    `),
  };
}

// ── Return Templates ────────────────────────────────────────────────────────────

export function returnRequestedEmail(name: string, returnNumber: string, orderNumber: string): EmailTemplate {
  return {
    subject: `Return Request Submitted: ${returnNumber}`,
    html: baseTemplate('Return Requested', `
      <h2>Return Request Submitted</h2>
      <p>Hi ${name}, your return request has been submitted successfully.</p>
      <div class="info-box">
        <p><strong>Return Number:</strong> ${returnNumber}</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> <span class="status-badge status-warning">Pending Review</span></p>
      </div>
      <p>We will review your request and get back to you shortly.</p>
    `),
  };
}

export function sellerNewReturnEmail(sellerName: string, returnNumber: string, orderNumber: string, customerName: string): EmailTemplate {
  return {
    subject: `New Return Request: ${returnNumber}`,
    html: baseTemplate('New Return Request', `
      <h2>New Return Request Received</h2>
      <p>Hi ${sellerName}, a customer has submitted a return request.</p>
      <div class="info-box">
        <p><strong>Return Number:</strong> ${returnNumber}</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
      </div>
      <p>Please review this return request from your seller dashboard.</p>
    `),
  };
}

export function returnStatusUpdateEmail(name: string, returnNumber: string, status: string, notes?: string): EmailTemplate {
  const badgeClass = getBadgeClass(status);
  return {
    subject: `Return ${returnNumber} – ${formatStatus(status)}`,
    html: baseTemplate('Return Update', `
      <h2>Return Request Update</h2>
      <p>Hi ${name}, your return request has been updated:</p>
      <div class="info-box">
        <p><strong>Return Number:</strong> ${returnNumber}</p>
        <p><strong>Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(status)}</span></p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      </div>
    `),
  };
}

// ── Dispute Templates ───────────────────────────────────────────────────────────

export function disputeOpenedEmail(name: string, disputeNumber: string, orderNumber: string, role: string): EmailTemplate {
  const isCustomer = role === 'customer';
  return {
    subject: `Dispute Opened: ${disputeNumber}`,
    html: baseTemplate('Dispute Opened', `
      <h2>Dispute ${isCustomer ? 'Submitted' : 'Filed Against Your Order'}</h2>
      <p>Hi ${name},</p>
      <p>${isCustomer ? 'Your dispute has been submitted and is under review.' : 'A dispute has been filed regarding an order involving your store.'}</p>
      <div class="info-box">
        <p><strong>Dispute Number:</strong> ${disputeNumber}</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> <span class="status-badge status-warning">Open</span></p>
      </div>
      <p>Our team will review this case and contact you if needed.</p>
    `),
  };
}

export function disputeStatusUpdateEmail(name: string, disputeNumber: string, status: string, resolution?: string): EmailTemplate {
  const badgeClass = getBadgeClass(status);
  return {
    subject: `Dispute ${disputeNumber} – ${formatStatus(status)}`,
    html: baseTemplate('Dispute Update', `
      <h2>Dispute Status Update</h2>
      <p>Hi ${name}, your dispute status has been updated:</p>
      <div class="info-box">
        <p><strong>Dispute Number:</strong> ${disputeNumber}</p>
        <p><strong>Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(status)}</span></p>
        ${resolution ? `<p><strong>Resolution:</strong> ${formatStatus(resolution)}</p>` : ''}
      </div>
    `),
  };
}

export function disputeNewMessageEmail(name: string, disputeNumber: string, senderName: string): EmailTemplate {
  return {
    subject: `New Message in Dispute ${disputeNumber}`,
    html: baseTemplate('Dispute Message', `
      <h2>New Dispute Message</h2>
      <p>Hi ${name}, there is a new message in your dispute:</p>
      <div class="info-box">
        <p><strong>Dispute Number:</strong> ${disputeNumber}</p>
        <p><strong>From:</strong> ${senderName}</p>
      </div>
      <p>Please log in to view and respond to the message.</p>
    `),
  };
}

// ── Review Templates ────────────────────────────────────────────────────────────

export function sellerNewReviewEmail(sellerName: string, productName: string, rating: number, customerName: string): EmailTemplate {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return {
    subject: `New ${rating}-Star Review on "${productName}"`,
    html: baseTemplate('New Review', `
      <h2>New Product Review</h2>
      <p>Hi ${sellerName}, you received a new review on your product:</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Rating:</strong> <span style="color: #f5a623; font-size: 18px;">${stars}</span> (${rating}/5)</p>
        <p><strong>Reviewer:</strong> ${customerName}</p>
      </div>
      <p>Check your seller dashboard for the full review details.</p>
    `),
  };
}

export function reviewStatusEmail(name: string, productName: string, status: string): EmailTemplate {
  const isApproved = status.toUpperCase() === 'APPROVED';
  return {
    subject: `Review ${formatStatus(status)} – "${productName}"`,
    html: baseTemplate('Review Update', `
      <h2>Review ${formatStatus(status)}</h2>
      <p>Hi ${name},</p>
      <p>Your review for <strong>"${productName}"</strong> has been ${status.toLowerCase()}.</p>
      <div class="info-box">
        <p><strong>Status:</strong> <span class="status-badge ${isApproved ? 'status-success' : 'status-danger'}">${formatStatus(status)}</span></p>
      </div>
      ${isApproved ? '<p>Your review is now visible to other customers. Thank you for your feedback!</p>' : '<p>If you have any questions, please contact our support team.</p>'}
    `),
  };
}

// ── Seller Templates ────────────────────────────────────────────────────────────

export function sellerApplicationReceivedEmail(name: string): EmailTemplate {
  return {
    subject: 'Seller Application Received – Labverse',
    html: baseTemplate('Seller Application', `
      <h2>Seller Application Received</h2>
      <p>Hi ${name},</p>
      <p>Thank you for applying to become a seller on <strong>Labverse</strong>. Your application is under review.</p>
      <div class="info-box">
        <p><strong>Status:</strong> <span class="status-badge status-warning">Pending Review</span></p>
        <p>We typically review applications within 1–3 business days.</p>
      </div>
      <p>You'll be notified once a decision has been made.</p>
    `),
  };
}

export function adminNewSellerAlert(sellerName: string, sellerEmail: string): EmailTemplate {
  return {
    subject: `New Seller Application: ${sellerName}`,
    html: baseTemplate('New Seller Application', `
      <h2>New Seller Application</h2>
      <p>A new seller application has been submitted:</p>
      <div class="info-box">
        <p><strong>Name:</strong> ${sellerName}</p>
        <p><strong>Email:</strong> ${sellerEmail}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please review this application in the admin dashboard.</p>
    `),
  };
}

export function sellerVerificationEmail(name: string, status: string, reason?: string): EmailTemplate {
  const isApproved = status.toUpperCase() === 'APPROVED';
  const isSuspended = status.toUpperCase() === 'SUSPENDED';
  let badgeClass = 'status-success';
  if (!isApproved) badgeClass = isSuspended ? 'status-warning' : 'status-danger';
  return {
    subject: `Seller Account ${formatStatus(status)} – Labverse`,
    html: baseTemplate('Seller Verification', `
      <h2>Seller Account ${formatStatus(status)}</h2>
      <p>Hi ${name},</p>
      <div class="info-box">
        <p><strong>Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(status)}</span></p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      </div>
      ${isApproved ? '<p>Congratulations! Your seller account has been approved. You can now create your store and start selling.</p>' : isSuspended ? '<p>Your seller account has been suspended. Please contact support for more details.</p>' : '<p>Unfortunately, your seller application has been rejected. You may re-apply after addressing the concerns mentioned above.</p>'}
    `),
  };
}

// ── Ticket Templates ────────────────────────────────────────────────────────────

export function ticketCreatedEmail(name: string, ticketNumber: string, subjectText: string): EmailTemplate {
  return {
    subject: `Support Ticket Created: ${ticketNumber}`,
    html: baseTemplate('Ticket Created', `
      <h2>Support Ticket Created</h2>
      <p>Hi ${name}, your support ticket has been created.</p>
      <div class="info-box">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Subject:</strong> ${subjectText}</p>
        <p><strong>Status:</strong> <span class="status-badge status-info">Open</span></p>
      </div>
      <p>Our support team will respond as soon as possible.</p>
    `),
  };
}

export function adminNewTicketAlert(ticketNumber: string, subjectText: string, customerName: string): EmailTemplate {
  return {
    subject: `New Support Ticket: ${ticketNumber}`,
    html: baseTemplate('New Support Ticket', `
      <h2>New Support Ticket</h2>
      <p>A new support ticket has been created:</p>
      <div class="info-box">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Subject:</strong> ${subjectText}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
      </div>
      <p>Please assign and respond to this ticket from the admin dashboard.</p>
    `),
  };
}

export function ticketStatusUpdateEmail(name: string, ticketNumber: string, status: string): EmailTemplate {
  const badgeClass = getBadgeClass(status);
  return {
    subject: `Ticket ${ticketNumber} – ${formatStatus(status)}`,
    html: baseTemplate('Ticket Update', `
      <h2>Ticket Status Update</h2>
      <p>Hi ${name}, your support ticket status has been updated:</p>
      <div class="info-box">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Status:</strong> <span class="status-badge ${badgeClass}">${formatStatus(status)}</span></p>
      </div>
      ${status.toUpperCase() === 'RESOLVED' ? '<p>If you still need help, you can reopen this ticket by replying.</p>' : ''}
    `),
  };
}

export function ticketReplyEmail(name: string, ticketNumber: string, senderName: string): EmailTemplate {
  return {
    subject: `New Reply on Ticket ${ticketNumber}`,
    html: baseTemplate('Ticket Reply', `
      <h2>New Ticket Reply</h2>
      <p>Hi ${name}, there is a new reply on your support ticket:</p>
      <div class="info-box">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Reply from:</strong> ${senderName}</p>
      </div>
      <p>Please log in to view and respond to the message.</p>
    `),
  };
}

export function ticketAssignedEmail(agentName: string, ticketNumber: string, subjectText: string): EmailTemplate {
  return {
    subject: `Ticket Assigned to You: ${ticketNumber}`,
    html: baseTemplate('Ticket Assigned', `
      <h2>Ticket Assigned to You</h2>
      <p>Hi ${agentName}, a support ticket has been assigned to you:</p>
      <div class="info-box">
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Subject:</strong> ${subjectText}</p>
      </div>
      <p>Please review and respond to this ticket.</p>
    `),
  };
}

// ── Subscription Templates ──────────────────────────────────────────────────────

export function subscriptionCreatedEmail(name: string, productName: string, frequency: string): EmailTemplate {
  return {
    subject: 'Subscription Created – Labverse',
    html: baseTemplate('Subscription Created', `
      <h2>Subscription Created! 🔄</h2>
      <p>Hi ${name}, your subscription has been set up successfully.</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Frequency:</strong> ${formatStatus(frequency)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Active</span></p>
      </div>
      <p>You can manage your subscription from your account dashboard.</p>
    `),
  };
}

export function subscriptionCancelledEmail(name: string, productName: string, reason?: string): EmailTemplate {
  return {
    subject: 'Subscription Cancelled – Labverse',
    html: baseTemplate('Subscription Cancelled', `
      <h2>Subscription Cancelled</h2>
      <p>Hi ${name}, your subscription has been cancelled.</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p><strong>Status:</strong> <span class="status-badge status-danger">Cancelled</span></p>
      </div>
      <p>You can resubscribe at any time from the product page.</p>
    `),
  };
}

export function subscriptionPausedEmail(name: string, productName: string): EmailTemplate {
  return {
    subject: 'Subscription Paused – Labverse',
    html: baseTemplate('Subscription Paused', `
      <h2>Subscription Paused ⏸️</h2>
      <p>Hi ${name}, your subscription has been paused.</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Status:</strong> <span class="status-badge status-warning">Paused</span></p>
      </div>
      <p>You can resume your subscription at any time from your account dashboard.</p>
    `),
  };
}

export function subscriptionResumedEmail(name: string, productName: string, nextDelivery: string): EmailTemplate {
  return {
    subject: 'Subscription Resumed – Labverse',
    html: baseTemplate('Subscription Resumed', `
      <h2>Subscription Resumed! ▶️</h2>
      <p>Hi ${name}, your subscription has been resumed.</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Next Delivery:</strong> ${nextDelivery}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Active</span></p>
      </div>
    `),
  };
}

export function subscriptionRenewalEmail(name: string, productName: string, nextDelivery: string): EmailTemplate {
  return {
    subject: 'Subscription Renewed – Labverse',
    html: baseTemplate('Subscription Renewed', `
      <h2>Subscription Renewed! 🔄</h2>
      <p>Hi ${name}, your subscription has been renewed.</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Next Delivery:</strong> ${nextDelivery}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Active</span></p>
      </div>
    `),
  };
}

// ── Test Template ───────────────────────────────────────────────────────────────

export function testEmail(): EmailTemplate {
  return {
    subject: 'Labverse – Test Email',
    html: baseTemplate('Test Email', `
      <h2>Test Email ✅</h2>
      <p>If you're reading this, your email notification system is working correctly!</p>
      <div class="info-box">
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-success">Operational</span></p>
      </div>
    `),
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getBadgeClass(status: string): string {
  const upper = status.toUpperCase();
  if (['DELIVERED', 'COMPLETED', 'PAID', 'APPROVED', 'RESOLVED', 'ACTIVE'].includes(upper)) return 'status-success';
  if (['SHIPPED', 'PROCESSING', 'IN_TRANSIT', 'PENDING', 'IN_PROGRESS', 'OPEN', 'UNDER_REVIEW'].includes(upper)) return 'status-info';
  if (['CANCELLED', 'FAILED', 'REJECTED', 'SUSPENDED', 'CLOSED'].includes(upper)) return 'status-danger';
  return 'status-warning';
}
