const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { isHexColor, getColorName } = require('../utils/colorHelper');
const fs = require('fs');
const path = require('path');

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Network diagnostics
const logNetworkDiagnostics = () => {
  console.log('\n=== Email Service Network Diagnostics ===');
  console.log('SMTP Host:', process.env.EMAIL_HOST);
  console.log('SMTP Port:', process.env.EMAIL_PORT);
  console.log('SMTP Secure:', process.env.EMAIL_SECURE);
  console.log('SMTP User:', process.env.EMAIL_USER);
  console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Configured (will use HTTPS)' : 'Not configured (will use SMTP)');
  console.log('Admin Notification Email:', process.env.ADMIN_NOTIFY_EMAIL);
  console.log('=========================================');
  console.log('NOTE: If SMTP times out, configure SENDGRID_API_KEY to use HTTPS instead');
  console.log('=========================================\n');
};

// Log diagnostics on module load
logNetworkDiagnostics();

// Retry helper for SendGrid
const sendWithSendGrid = async (mailOptions, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sgMail.send({
        from: mailOptions.from,
        to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        attachments: mailOptions.attachments ? mailOptions.attachments.map(att => ({
          filename: att.filename,
          content: att.path,
          cid: att.cid,
          disposition: 'inline',
        })) : undefined,
      });
      return { success: true, info: { messageId: result[0].headers['x-message-id'] } };
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(`[emailService] SendGrid attempt ${attempt} failed: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};

// SMTP fallback with port rotation
const sendWithSMTP = async (mailOptions) => {
  const createTransporter = (port) => {
    const useSecure = port === 465;
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: useSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
    });
  };

  const tryPort = async (port) => {
    const transporter = createTransporter(port);
    return await transporter.sendMail(mailOptions);
  };

  const primaryPort = Number(process.env.EMAIL_PORT) || 587;
  const fallbackPort = primaryPort === 587 ? 465 : 587;

  try {
    const info = await tryPort(primaryPort);
    return { success: true, info };
  } catch (primaryError) {
    try {
      const info = await tryPort(fallbackPort);
      return { success: true, info };
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

// Main email sending function
const sendEmail = async (mailOptions) => {
  // Primary: SendGrid (HTTPS, avoids SMTP blocks)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const result = await sendWithSendGrid(mailOptions);
      console.log('[emailService] Email sent via SendGrid:', result.info.messageId);
      return { sent: true, messageId: result.info.messageId };
    } catch (error) {
      console.warn(`[emailService] SendGrid failed: ${error.message}, falling back to SMTP...`);
      logEmailToFile(mailOptions, error);
    }
  }

  // Fallback: SMTP
  try {
    const result = await sendWithSMTP(mailOptions);
    console.log('[emailService] Email sent via SMTP:', result.info.messageId);
    return { sent: true, messageId: result.info.messageId };
  } catch (error) {
    console.error(`[emailService] All email methods failed. Last error: ${error.message}`);
    logEmailToFile(mailOptions, error);
    return { sent: false, reason: error.message };
  }
};

// Email logging fallback - saves email content to file when sending fails
const logEmailToFile = (mailOptions, error) => {
  const emailLogDir = path.join(__dirname, '../../email-logs');
  if (!fs.existsSync(emailLogDir)) {
    fs.mkdirSync(emailLogDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `email-${timestamp}-${Date.now()}.json`;
  const filepath = path.join(emailLogDir, filename);

  const emailData = {
    timestamp: new Date().toISOString(),
    error: error ? error.message : 'Not attempted',
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
  };

  try {
    fs.writeFileSync(filepath, JSON.stringify(emailData, null, 2));
    console.log(`[emailService] Email logged to: ${filepath}`);
  } catch (logError) {
    console.error('[emailService] Failed to log email:', logError.message);
  }
};

// Helper: turn a product image URL into an embedded cid attachment (so it shows inline in the email)
const buildProductImageAttachment = (imageUrl) => {
  if (!imageUrl) return null;

  const cid = 'product-image';
  let filename = 'product.png';

  const urlParts = imageUrl.split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  if (lastPart && lastPart.includes('.')) {
    filename = lastPart;
  }

  return {
    filename,
    path: imageUrl,
    cid, // referenced as <img src="cid:product-image">
  };
};

// Helper: turn a payment receipt URL into an embedded cid attachment
const buildReceiptAttachment = (receiptUrl) => {
  if (!receiptUrl) return null;

  const cid = 'payment-receipt';
  let filename = 'payment-receipt.png';

  const urlParts = receiptUrl.split('?')[0].split('/');
  const lastPart = urlParts[urlParts.length - 1];
  if (lastPart && lastPart.includes('.')) {
    filename = lastPart;
  }

  return {
    filename,
    path: receiptUrl,
    cid, // referenced as <img src="cid:payment-receipt">
  };
};

// Build a receipt block (inline image) when a payment receipt exists
const receiptImageBlock = (receiptUrl) => {
  if (!receiptUrl) return '';
  return `
            <!-- Payment Receipt -->
            <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
              <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Payment Receipt</h3>
              <img src="cid:payment-receipt" alt="Payment receipt" style="max-width:100%;max-height:320px;border-radius:10px;border:1px solid #e5e7eb;" />
              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Customer-uploaded screenshot/photo of the payment transfer.</p>
            </div>
    `;
};

const paymentLabel = (method) => {
  switch (method) {
    case 'cod':
      return 'Cash on Delivery';
    case 'bank':
      return 'Bank Transfer';
    case 'card':
      return 'Card Payment';
    default:
      return method || 'N/A';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'returned':
      return 'Returned';
    case 'completed':
      return 'Confirmed';
    default:
      return status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'N/A';
  }
};

const formatPrice = (value) =>
  `Rs. ${(Number(value) || 0).toFixed(2)}`;

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
};

// Safely convert an order _id (which may be a MongoDB ObjectId or a string)
// into a short display id like "#a1b2c3d4". ObjectIds don't have a .slice method.
const shortOrderId = (order) => {
  if (!order || !order._id) return 'N/A';
  const idStr = typeof order._id === 'string'
    ? order._id
    : (typeof order._id.toString === 'function' ? order._id.toString() : String(order._id));
  return `#${idStr.slice(-8)}`;
};

const rawShortOrderId = (order) => {
  if (!order || !order._id) return '';
  const idStr = typeof order._id === 'string'
    ? order._id
    : (typeof order._id.toString === 'function' ? order._id.toString() : String(order._id));
  return idStr ? `#${idStr.slice(-8)}` : '';
};

const getSiteBaseUrl = () => {
  const url = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://comfortseatspk.com';
  return url.replace(/\/+$/, '');
};

// Helper: get normalized items array from an order
const getOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items;
  }
  if (order.product && order.product.name) {
    return [{
      name: order.product.name,
      price: order.product.price || 0,
      imageUrl: order.product.imageUrl || '',
      color: order.product.color || '',
      size: order.product.size || '',
      selectedStandType: order.product.selectedStandType || '',
      slug: order.product.slug || '',
      quantity: order.quantity || 1,
      actualPrice: order.product.actualPrice || 0,
      discountPrice: order.product.discountPrice || 0,
      isDiscountEnabled: order.product.isDiscountEnabled || false,
    }];
  }
  return [];
};

// Helper: build inline image attachments for all items
const buildProductImageAttachments = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (!item.imageUrl) return null;
    const cid = `product-image-${index}`;
    let filename = `product-${index}.png`;
    const urlParts = item.imageUrl.split('?')[0].split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      filename = lastPart;
    }
    return {
      filename,
      path: item.imageUrl,
      cid,
    };
  }).filter(Boolean);
};

// Render multi-item product cards HTML for emails
const renderItemsHtml = (items) => {
  if (!items || items.length === 0) return '';
  return items.map((p, index) => {
    const colorText = p.color
      ? (isHexColor(p.color) ? getColorName(p.color) : p.color)
      : 'N/A';
    const productUrl = getProductUrl(p);
    const imageSrc = p.imageUrl
      ? (p.imageUrl.startsWith('http') || p.imageUrl.startsWith('data:') ? p.imageUrl : `cid:product-image-${index}`)
      : null;
    const imageBlock = imageSrc
      ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(p.name)}" style="width:90px;height:90px;object-fit:cover;border-radius:10px;border:1px solid #e5e7eb;" />`
      : `<div style="width:90px;height:90px;border-radius:10px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">No Image</div>`;

    return `
      <div style="display:flex;gap:14px;align-items:center;background:#ffffff;border:1px solid #eef0f3;border-radius:12px;padding:14px;margin-bottom:12px;">
        <a href="${productUrl}" target="_blank" style="text-decoration:none;">${imageBlock}</a>
        <div style="flex:1;">
          <a href="${productUrl}" target="_blank" style="text-decoration:none;color:#111827;"><p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">${escapeHtml(p.name)} &rarr;</p></a>
          <p style="margin:0;font-size:13px;color:#6b7280;">Quantity: <strong style="color:#374151;">${p.quantity || 1}</strong> &nbsp;&middot;&nbsp; Unit Price: <strong style="color:#374151;">${formatPrice(p.price)}</strong> &nbsp;&middot;&nbsp; Subtotal: <strong style="color:#111827;">${formatPrice(p.price * (p.quantity || 1))}</strong></p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Color: <strong style="color:#374151;">${escapeHtml(colorText)}</strong>${p.size ? ` &nbsp;&middot;&nbsp; Size: <strong style="color:#374151;">${escapeHtml(p.size)}</strong>` : ''}${p.selectedStandType ? ` &nbsp;&middot;&nbsp; Stand: <strong style="color:#374151;">${escapeHtml(p.selectedStandType)}</strong>` : ''}</p>
          <div style="margin-top:8px;">
            <a href="${productUrl}" target="_blank" style="display:inline-block;background:#2F6FED;color:#ffffff;text-decoration:none;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;">View Product &rarr;</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

const ensureOrderProductSlug = async (order) => {
  if (!order) return;
  const items = getOrderItems(order);
  const Product = require('../models/Product');
  for (const item of items) {
    if (!item.slug && item.productId) {
      try {
        const foundProd = await Product.findById(item.productId).select('slug').lean();
        if (foundProd && foundProd.slug) {
          item.slug = foundProd.slug;
        }
      } catch (err) {
        console.warn('[emailService] Could not populate product slug for email:', err.message);
      }
    }
  }
};

const getProductUrl = (product) => {
  const baseUrl = getSiteBaseUrl();
  if (product && product.slug) {
    return `${baseUrl}/products/${product.slug.replace(/^\/+/, '')}`;
  }
  return `${baseUrl}/products`;
};

const getAdminOrderUrl = () => {
  const baseUrl = getSiteBaseUrl();
  return `${baseUrl}/admin/orders`;
};

// Build the professional HTML email body for an order (admin notification)
const buildOrderEmailHtml = (order) => {
  const items = getOrderItems(order);
  const c = order.customer || {};
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';
  const orderId = shortOrderId(order);
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  const adminOrdersUrl = getAdminOrderUrl();

  const headerBg = isCancelled ? 'linear-gradient(135deg,#E5484D,#b91c1c)' : 'linear-gradient(135deg,#2F6FED,#1e4fbf)';
  const headerTitle = isCancelled ? 'Order Cancelled' : isCompleted ? 'New Order Confirmed' : 'New Order Received';
  const introText = isCancelled
    ? 'An order has been <strong style="color:#E5484D;">cancelled</strong>. Please review the cancelled order details below.'
    : isCompleted
      ? 'A customer order has just been <strong style="color:#16a34a;">confirmed</strong>. Please find the complete order and shipping details below.'
      : 'A new order has been placed. Please find the complete order and shipping details below.';

  const itemsHtml = renderItemsHtml(items);

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:${headerBg};padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${headerTitle} &mdash; ${orderId}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello Admin,</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 16px;line-height:1.5;">${introText}</p>

          <!-- Direct Admin Action Button -->
          <div style="margin-bottom:24px;text-align:center;">
            <a href="${adminOrdersUrl}" target="_blank" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.12);">Manage Order in Admin Panel &rarr;</a>
          </div>

          <!-- Order summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Order Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:600;">${orderId}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Date</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Status</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#16a34a;">${statusLabel(order.status)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Payment</td><td style="padding:4px 0;text-align:right;">${paymentLabel(order.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Items</td><td style="padding:4px 0;text-align:right;font-weight:600;">${items.reduce((a, b) => a + (b.quantity || 1), 0)} items</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
            </table>
          </div>

          <!-- Products List -->
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Ordered Products (${items.length})</h3>
          ${itemsHtml}

          <!-- Payment Method Details -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Payment Details</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Method</td><td style="padding:4px 0;text-align:right;font-weight:600;">${paymentLabel(order.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Paid</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
              ${order.transactionRef ? `<tr><td style="padding:4px 0;color:#9ca3af;">Transaction Ref</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(order.transactionRef)}</td></tr>` : ''}
            </table>
            ${order.paymentMethod !== 'cod' && order.paymentReceipt ? `
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef0f3;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:500;">Payment Receipt (uploaded by customer):</p>
              <img src="cid:payment-receipt" alt="Payment receipt" style="max-width:100%;max-height:320px;border-radius:10px;border:1px solid #e5e7eb;" />
            </div>
            ` : ''}
            ${order.paymentMethod === 'cod' ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Customer will pay <strong style="color:#374151;">${formatPrice(order.totalPrice)}</strong> in cash upon delivery.</p>` : ''}
          </div>

          <!-- Shipping -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Shipping Details</h3>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(c.fullName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.phone)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.email)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.address)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.city)}${c.province || c.state ? `, ${escapeHtml(c.province || c.state)}` : ''}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            This is an automated notification from Comfort Seats admin panel.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send a professional order-confirmation email (with product image + shipping details)
 * to the configured admin notification address.
 * @param {Object} order - The order document
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    await ensureOrderProductSlug(order);
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping order notification email.');
      return { sent: false, reason: 'not-configured' };
    }

    const isCancelled = order.status === 'cancelled';
    const isCompleted = order.status === 'completed';
    const adminSubject = isCancelled ? 'Order Cancelled' : isCompleted ? 'New Order Confirmed' : 'New Order Received';
    const mailOptions = {
      from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `${adminSubject} ${rawShortOrderId(order)} — Comfort Seats`,
      html: buildOrderEmailHtml(order),
    };

    const items = getOrderItems(order);
    const itemAttachments = buildProductImageAttachments(items);
    const receiptAtt = buildReceiptAttachment(order.paymentReceipt);
    const attachments = [...itemAttachments, receiptAtt].filter(Boolean);
    if (attachments.length) {
      mailOptions.attachments = attachments;
    }

    const result = await sendEmail(mailOptions);
    if (result.sent) {
      return result;
    }
    console.error('[emailService] Failed to send order confirmation email:', result.reason);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send order confirmation email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build the professional HTML email body for the CUSTOMER (order confirmation/receipt).
 * Mirrors the admin email but is addressed to the customer with full product details.
 * @param {Object} order - The order document
 * @param {Object} opts - { confirmed: boolean } whether the order is already confirmed/shipped
 */
const buildCustomerOrderEmailHtml = (order, opts = {}) => {
  const confirmed = !!opts.confirmed;
  const cancelled = !!opts.cancelled;
  const items = getOrderItems(order);
  const c = order.customer || {};
  const orderId = shortOrderId(order);
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  const heading = cancelled
    ? 'Your Order Has Been Cancelled'
    : confirmed
      ? 'Your Order is Confirmed!'
      : 'Thank You for Your Order!';
  const subText = cancelled
    ? 'We regret to inform you that your order has been cancelled. If you have any questions, please contact us via WhatsApp or email. Here are the details of the cancelled order.'
    : confirmed
      ? 'Great news! Your order has been confirmed and is being prepared for shipping. Here are the complete details of your purchase.'
      : 'We have received your order and it is now pending confirmation. Here is the complete summary of the product(s) you ordered.';

  const itemsHtml = renderItemsHtml(items);

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2F6FED,#1e4fbf);padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${heading} &mdash; ${orderId}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello ${escapeHtml(c.fullName) || 'Valued Customer'},</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">${subText}</p>

          <!-- Order summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Order Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:600;">${orderId}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Date</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Status</td><td style="padding:4px 0;text-align:right;font-weight:600;color:${cancelled ? '#E5484D' : confirmed ? '#16a34a' : '#d97706'};">${statusLabel(order.status)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Payment</td><td style="padding:4px 0;text-align:right;">${paymentLabel(order.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Items</td><td style="padding:4px 0;text-align:right;font-weight:600;">${items.reduce((a, b) => a + (b.quantity || 1), 0)} items</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
            </table>
          </div>

          <!-- Products List -->
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Your Products (${items.length})</h3>
          ${itemsHtml}

          <!-- Payment Method Details -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Payment Details</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Method</td><td style="padding:4px 0;text-align:right;font-weight:600;">${paymentLabel(order.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Paid</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
              ${order.transactionRef ? `<tr><td style="padding:4px 0;color:#9ca3af;">Transaction Ref</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(order.transactionRef)}</td></tr>` : ''}
            </table>
            ${order.paymentMethod !== 'cod' && order.paymentReceipt ? `
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid #eef0f3;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:500;">Your Payment Receipt:</p>
              <img src="cid:payment-receipt" alt="Payment receipt" style="max-width:100%;max-height:320px;border-radius:10px;border:1px solid #e5e7eb;" />
            </div>
            ` : ''}
            ${order.paymentMethod === 'cod'
      ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Please keep <strong style="color:#374151;">${formatPrice(order.totalPrice)}</strong> ready to pay in cash when your order arrives.</p>`
      : order.paymentMethod !== 'cod' ? `<p style="margin:8px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Your online payment has been recorded. Thank you for your payment!</p>` : ''
    }
          </div>

          <!-- Shipping -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Delivery Details</h3>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(c.fullName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.phone)}${c.email ? ` &nbsp;&middot;&nbsp; ${escapeHtml(c.email)}` : ''}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.address)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.city)}${c.province || c.state ? `, ${escapeHtml(c.province || c.state)}` : ''}</p>
          </div>
        </div>

        <!-- Footer with contact info -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#374151;text-align:center;">Need Help? Contact Us</p>
          <div style="margin-top:10px;text-align:center;font-size:13px;color:#6b7280;">
            ${process.env.EMAIL_USER ? `<p style="margin:4px 0;">📧 Email: <a href="mailto:${escapeHtml(process.env.EMAIL_USER)}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.EMAIL_USER)}</a></p>` : ''}
            ${process.env.WHATSAPP_NUMBER ? `<p style="margin:4px 0;">💬 WhatsApp: <a href="https://wa.me/${escapeHtml(process.env.WHATSAPP_NUMBER.replace(/[^0-9]/g, ''))}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.WHATSAPP_NUMBER)}</a></p>` : ''}
          </div>
          <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            This is an automated message from Comfort Seats. For any questions, feel free to reach out via WhatsApp or email.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send a professional order email to the CUSTOMER with full product, pricing and delivery details.
 * @param {Object} order - The order document
 * @param {Object} opts - { confirmed: boolean }
 */
const sendCustomerOrderEmail = async (order, opts = {}) => {
  try {
    await ensureOrderProductSlug(order);
    const customerEmail = order.customer && order.customer.email;
    if (!customerEmail) {
      console.warn('[emailService] Customer has no email; skipping customer order email.');
      return { sent: false, reason: 'no-customer-email' };
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping customer notification email.');
      return { sent: false, reason: 'not-configured' };
    }

    const cancelled = !!opts.cancelled;
    const mailOptions = {
      from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `${cancelled ? 'Order Cancelled' : opts.confirmed ? 'Order Confirmed' : 'Order Received'} ${rawShortOrderId(order)} — Comfort Seats`,
      html: buildCustomerOrderEmailHtml(order, opts),
    };

    const items = getOrderItems(order);
    const itemAttachments = buildProductImageAttachments(items);
    const receiptAtt = buildReceiptAttachment(order.paymentReceipt);
    const attachments = [...itemAttachments, receiptAtt].filter(Boolean);
    if (attachments.length) {
      mailOptions.attachments = attachments;
    }

    const result = await sendEmail(mailOptions);
    if (result.sent) {
      return result;
    }
    console.error('[emailService] Failed to send customer order email:', result.reason);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send customer order email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Get subject line for customer status update email
 */
const getCustomerStatusEmailSubject = (status) => {
  switch (status) {
    case 'pending':
      return 'Your Order Has Been Received';
    case 'confirmed':
      return 'Your Order Has Been Confirmed';
    case 'processing':
      return 'Your Order Is Being Prepared';
    case 'shipped':
      return '📦 Your Order Has Been Shipped!';
    case 'delivered':
      return 'Your Order Has Been Delivered';
    case 'cancelled':
      return 'Your Order Has Been Cancelled';
    default:
      return `Order Status Updated: ${statusLabel(status)}`;
  }
};

/**
 * Build HTML email body for Customer status updates
 */
const buildStatusUpdateCustomerEmailHtml = (order, newStatus) => {
  const p = order.product || {};
  const c = order.customer || {};
  const s = order.shipping || {};
  const items = getOrderItems(order);
  const colorText = p.color
    ? (isHexColor(p.color) ? getColorName(p.color) : p.color)
    : 'N/A';
  const orderId = shortOrderId(order);
  const dateStr = order.updatedAt || order.createdAt
    ? new Date(order.updatedAt || order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  let heading = getCustomerStatusEmailSubject(newStatus);
  let subText = '';
  let headerBg = 'linear-gradient(135deg,#2F6FED,#1e4fbf)';

  switch (newStatus) {
    case 'pending':
      subText = 'Your order has been received and is currently awaiting confirmation. Here are your order details.';
      break;
    case 'confirmed':
      subText = 'Great news! Your order has been confirmed and will soon move to processing. Here are your purchase details.';
      headerBg = 'linear-gradient(135deg,#16a34a,#15803d)';
      break;
    case 'processing':
      subText = 'Our warehouse team is currently preparing your order for shipment. We will notify you as soon as your order ships!';
      headerBg = 'linear-gradient(135deg,#0284c7,#0369a1)';
      break;
    case 'shipped':
      subText = 'Great news! Your package has left our warehouse and is currently on its shipping journey to your delivery address.';
      headerBg = 'linear-gradient(135deg,#8b5cf6,#6d28d9)';
      break;
    case 'delivered':
      subText = 'Your order has been successfully delivered! We hope you enjoy your new purchase. Thank you for choosing Comfort Seats.';
      headerBg = 'linear-gradient(135deg,#10b981,#047857)';
      break;
    case 'cancelled':
      subText = 'We regret to inform you that your order has been cancelled. If you have any questions or require assistance, please contact our support team below.';
      headerBg = 'linear-gradient(135deg,#E5484D,#b91c1c)';
      break;
    default:
      subText = `Your order status has been updated to ${statusLabel(newStatus)}.`;
      break;
  }

  const itemsHtml = renderItemsHtml(items);

  const trackingBlock = (newStatus === 'shipped' || s.courierName || s.trackingNumber) ? `
        <!-- Shipment Tracking Details -->
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#0369a1;">Shipment Tracking Details</h3>
          <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
            ${s.courierName ? `<tr><td style="padding:4px 0;color:#0284c7;font-weight:500;">Courier</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${escapeHtml(s.courierName)}</td></tr>` : ''}
            ${s.trackingNumber ? `<tr><td style="padding:4px 0;color:#0284c7;font-weight:500;">Tracking Number</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">${escapeHtml(s.trackingNumber)}</td></tr>` : ''}
          </table>
          ${s.trackingUrl ? `
          <div style="margin-top:14px;text-align:center;">
            <a href="${escapeHtml(s.trackingUrl)}" target="_blank" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;">Track Package &rarr;</a>
          </div>
          ` : ''}
        </div>
    ` : '';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:${headerBg};padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">${heading} &mdash; ${orderId}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello ${escapeHtml(c.fullName) || 'Valued Customer'},</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">${subText}</p>

          ${trackingBlock}

          <!-- Order summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Order Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:600;">${orderId}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Last Updated</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Current Status</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#2F6FED;">${statusLabel(newStatus)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Payment Method</td><td style="padding:4px 0;text-align:right;">${paymentLabel(order.paymentMethod)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
            </table>
          </div>

          <!-- Products List -->
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Your Products (${items.length})</h3>
          ${itemsHtml}

          <!-- Delivery -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Delivery Address</h3>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(c.fullName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.phone)}${c.email ? ` &nbsp;&middot;&nbsp; ${escapeHtml(c.email)}` : ''}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.address)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.city)}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#374151;text-align:center;">Need Help? Contact Us</p>
          <div style="margin-top:10px;text-align:center;font-size:13px;color:#6b7280;">
            ${process.env.EMAIL_USER ? `<p style="margin:4px 0;">📧 Email: <a href="mailto:${escapeHtml(process.env.EMAIL_USER)}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.EMAIL_USER)}</a></p>` : ''}
            ${process.env.WHATSAPP_NUMBER ? `<p style="margin:4px 0;">💬 WhatsApp: <a href="https://wa.me/${escapeHtml(process.env.WHATSAPP_NUMBER.replace(/[^0-9]/g, ''))}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.WHATSAPP_NUMBER)}</a></p>` : ''}
          </div>
          <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            This is an automated message from Comfort Seats regarding your order.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Build HTML email body for Admin on order status updates
 */
const buildStatusUpdateAdminEmailHtml = (order, previousStatus, newStatus) => {
  const items = getOrderItems(order);
  const c = order.customer || {};
  const s = order.shipping || {};
  const orderId = shortOrderId(order);
  const dateStr = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const adminOrdersUrl = getAdminOrderUrl();
  const itemsHtml = renderItemsHtml(items);

  const trackingBlock = (newStatus === 'shipped' || s.courierName || s.trackingNumber) ? `
        <!-- Shipment Tracking Info -->
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#0369a1;">Shipment Tracking Info</h3>
          <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
            ${s.courierName ? `<tr><td style="padding:4px 0;color:#0284c7;font-weight:500;">Courier Company</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;">${escapeHtml(s.courierName)}</td></tr>` : ''}
            ${s.trackingNumber ? `<tr><td style="padding:4px 0;color:#0284c7;font-weight:500;">Tracking Number</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#0f172a;font-family:monospace;">${escapeHtml(s.trackingNumber)}</td></tr>` : ''}
            ${s.trackingUrl ? `<tr><td style="padding:4px 0;color:#0284c7;font-weight:500;">Tracking Link</td><td style="padding:4px 0;text-align:right;"><a href="${escapeHtml(s.trackingUrl)}" target="_blank" style="color:#0284c7;font-weight:600;text-decoration:none;">View Tracking &rarr;</a></td></tr>` : ''}
          </table>
        </div>
    ` : '';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2F6FED,#1e4fbf);padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats Admin</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Order Status Updated &mdash; ${orderId}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello Admin,</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 16px;line-height:1.5;">
            Order <strong style="color:#111827;">${orderId}</strong> status has been updated from <strong style="color:#6b7280;">${statusLabel(previousStatus)}</strong> to <strong style="color:#2F6FED;">${statusLabel(newStatus)}</strong>.
          </p>

          <!-- Direct Admin Action Button -->
          <div style="margin-bottom:20px;text-align:center;">
            <a href="${adminOrdersUrl}" target="_blank" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;">View & Manage Order in Admin Panel &rarr;</a>
          </div>

          ${trackingBlock}

          <!-- Update Log & Details -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Status Update Log</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:600;">${orderId}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Customer Name</td><td style="padding:4px 0;text-align:right;font-weight:600;">${escapeHtml(c.fullName)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Customer Email</td><td style="padding:4px 0;text-align:right;">${escapeHtml(c.email || 'N/A')}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Previous Status</td><td style="padding:4px 0;text-align:right;color:#6b7280;">${statusLabel(previousStatus)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">New Status</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#2F6FED;">${statusLabel(newStatus)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Update Time</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Total Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#111827;">${formatPrice(order.totalPrice)}</td></tr>
            </table>
          </div>

          <!-- Product Details List -->
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Ordered Products (${items.length})</h3>
          ${itemsHtml}

          <!-- Customer & Address -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Customer Shipping Address</h3>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(c.fullName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.phone)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.address)}, ${escapeHtml(c.city)}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            Automated administrative update notification from Comfort Seats system.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send status update email notifications to both Customer and Admin on any status change
 * @param {Object} params - { order, previousStatus, newStatus }
 */
const sendOrderStatusUpdateEmails = async ({ order, previousStatus, newStatus }) => {
  try {
    await ensureOrderProductSlug(order);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping status update notification emails.');
      return { customerSent: false, adminSent: false, reason: 'not-configured' };
    }

    const results = { customerSent: false, adminSent: false };

    // 1. Send Customer Email
    const customerEmail = order.customer && order.customer.email;
    if (customerEmail) {
      const customerSubject = `${getCustomerStatusEmailSubject(newStatus)} ${rawShortOrderId(order)} — Comfort Seats`;
      const mailOptionsCustomer = {
        from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: customerSubject,
        html: buildStatusUpdateCustomerEmailHtml(order, newStatus),
      };

      const items = getOrderItems(order);
      const itemAttachments = buildProductImageAttachments(items);
      const attachments = [...itemAttachments].filter(Boolean);
      if (attachments.length) {
        mailOptionsCustomer.attachments = attachments;
      }

      const custRes = await sendEmail(mailOptionsCustomer);
      results.customerSent = !!custRes.sent;
    } else {
      console.warn('[emailService] Customer has no email address; customer status email skipped.');
    }

    // 2. Send Admin Email
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      const adminSubject = `Order Status Updated: ${statusLabel(newStatus)} ${rawShortOrderId(order)} — Comfort Seats`;
      const mailOptionsAdmin = {
        from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: adminSubject,
        html: buildStatusUpdateAdminEmailHtml(order, previousStatus, newStatus),
      };

      const items = getOrderItems(order);
      const itemAttachments = buildProductImageAttachments(items);
      const attachments = [...itemAttachments].filter(Boolean);
      if (attachments.length) {
        mailOptionsAdmin.attachments = attachments;
      }

      const adminRes = await sendEmail(mailOptionsAdmin);
      results.adminSent = !!adminRes.sent;
    }

    return results;
  } catch (error) {
    console.error('[emailService] Error in sendOrderStatusUpdateEmails:', error.message);
    return { customerSent: false, adminSent: false, error: error.message };
  }
};


/**
 * Build the professional HTML email body for a new customization request.
 * @param {Object} customization - The customization document
 */
const buildCustomizationEmailHtml = (customization) => {
  const c = customization.customer || {};
  const dims = customization.dimensions || {};
  const dateStr = customization.createdAt
    ? new Date(customization.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  const colorDisplay = customization.colorName
    ? `${escapeHtml(customization.colorName)}${customization.color && customization.color !== customization.colorName ? ` (${escapeHtml(customization.color)})` : ''}`
    : customization.color
      ? (isHexColor(customization.color) ? getColorName(customization.color) : escapeHtml(customization.color))
      : 'N/A';

  const dimensionsText = dims.width && dims.height
    ? `${dims.width}" W × ${dims.height}" H${dims.depth ? ` × ${dims.depth}" D` : ''}`
    : 'Not specified';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">New Customization Request</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello Admin,</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">
            A customer has submitted a <strong style="color:#d97706;">new customization request</strong>. Please find the complete details below.
          </p>

          <!-- Request summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Request Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Date</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Category</td><td style="padding:4px 0;text-align:right;font-weight:600;">${escapeHtml(customization.category)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Stand Choice</td><td style="padding:4px 0;text-align:right;">${escapeHtml(customization.standChoice || 'N/A')}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Color</td><td style="padding:4px 0;text-align:right;">${colorDisplay}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Fabric Type</td><td style="padding:4px 0;text-align:right;">${escapeHtml(customization.fabricType || 'N/A')}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Dimensions</td><td style="padding:4px 0;text-align:right;">${dimensionsText}</td></tr>
            </table>
          </div>

          ${customization.notes ? `
          <!-- Notes -->
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#92400e;">Customer Notes</h3>
            <p style="margin:0;font-size:14px;color:#78350f;line-height:1.5;">${escapeHtml(customization.notes)}</p>
          </div>
          ` : ''}

          <!-- Customer -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Customer Details</h3>
            <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${escapeHtml(c.fullName)}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.phone)}</p>
            ${c.email ? `<p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.email)}</p>` : ''}
            ${c.address ? `<p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${escapeHtml(c.address)}</p>` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            This is an automated notification from Comfort Seats admin panel.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send a professional email to the admin about a new customization request.
 * @param {Object} customization - The customization document
 */
const sendCustomizationEmail = async (customization) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping customization notification email.');
      return { sent: false, reason: 'not-configured' };
    }

    const mailOptions = {
      from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Customization Request — ${customization.customer?.fullName || 'Anonymous'} — Comfort Seats`,
      html: buildCustomizationEmailHtml(customization),
    };

    const result = await sendEmail(mailOptions);
    if (result.sent) {
      return result;
    }
    console.error('[emailService] Failed to send customization email:', result.reason);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send customization email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build the professional HTML email body for the CUSTOMER (customization confirmation).
 * @param {Object} customization - The customization document
 */
const buildCustomizationCustomerEmailHtml = (customization) => {
  const c = customization.customer || {};
  const dateStr = customization.createdAt
    ? new Date(customization.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Customization Request Received</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello ${escapeHtml(c.fullName) || 'Valued Customer'},</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">
            Thank you for reaching out to us! We have received your customization request and our team will review it shortly.
            Here is a summary of what we received.
          </p>

          <!-- Request Summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Request Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Date</td><td style="padding:4px 0;text-align:right;">${dateStr}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Category</td><td style="padding:4px 0;text-align:right;font-weight:600;">${escapeHtml(customization.category || 'Custom Request')}</td></tr>
            </table>
          </div>

          ${customization.notes ? `
          <!-- Requirements -->
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#92400e;">Your Requirements</h3>
            <p style="margin:0;font-size:14px;color:#78350f;line-height:1.5;">${escapeHtml(customization.notes)}</p>
          </div>
          ` : ''}

          <!-- Next Steps -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">What Happens Next?</h3>
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
              Our team will review your requirements and contact you at <strong style="color:#374151;">${escapeHtml(c.phone)}</strong>
              ${c.email ? `or <strong style="color:#374151;">${escapeHtml(c.email)}</strong>` : ''}
              to discuss your customization and provide a quote.
            </p>
          </div>
        </div>

        <!-- Footer with contact info -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#374151;text-align:center;">Need Help? Contact Us</p>
          <div style="margin-top:10px;text-align:center;font-size:13px;color:#6b7280;">
            ${process.env.EMAIL_USER ? `<p style="margin:4px 0;">📧 Email: <a href="mailto:${escapeHtml(process.env.EMAIL_USER)}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.EMAIL_USER)}</a></p>` : ''}
            ${process.env.WHATSAPP_NUMBER ? `<p style="margin:4px 0;">💬 WhatsApp: <a href="https://wa.me/${escapeHtml(process.env.WHATSAPP_NUMBER.replace(/[^0-9]/g, ''))}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(process.env.WHATSAPP_NUMBER)}</a></p>` : ''}
          </div>
          <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            This is an automated message from Comfort Seats. We'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send a professional email to the customer confirming their customization request.
 * @param {Object} customization - The customization document
 */
const sendCustomizationCustomerEmail = async (customization) => {
  try {
    const customerEmail = customization.customer && customization.customer.email;
    if (!customerEmail) {
      console.warn('[emailService] Customer has no email; skipping customization customer email.');
      return { sent: false, reason: 'no-customer-email' };
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping customization customer email.');
      return { sent: false, reason: 'not-configured' };
    }

    const mailOptions = {
      from: `"Comfort Seats" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Customization Request Received — Comfort Seats`,
      html: buildCustomizationCustomerEmailHtml(customization),
    };

    const result = await sendEmail(mailOptions);
    if (result.sent) {
      return result;
    }
    console.error('[emailService] Failed to send customization customer email:', result.reason);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send customization customer email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build the professional HTML email body for a new contact form message.
 * @param {Object} contactMessage - The contact message document
 */
const buildContactMessageAdminEmailHtml = (contactMessage) => {
  const dateStr = contactMessage.createdAt
    ? new Date(contactMessage.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'N/A';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2F6FED,#1e4fbf);padding:24px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">Comfort Seats Admin</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">New Customer Contact Message</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 4px;">Hello Admin,</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.5;">
            A customer has submitted a new inquiry through the website contact form.
          </p>

          <!-- Contact details -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Sender Details</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#9ca3af;">Name</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(contactMessage.name)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Email</td><td style="padding:4px 0;text-align:right;"><a href="mailto:${escapeHtml(contactMessage.email)}" style="color:#2F6FED;text-decoration:none;font-weight:500;">${escapeHtml(contactMessage.email)}</a></td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Subject</td><td style="padding:4px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(contactMessage.subject)}</td></tr>
              <tr><td style="padding:4px 0;color:#9ca3af;">Date</td><td style="padding:4px 0;text-align:right;color:#6b7280;">${dateStr}</td></tr>
            </table>
          </div>

          <!-- Message Body -->
          <div style="background:#f0f7ff;border:1px solid #c7d2fe;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#1e4fbf;">Message Body</h3>
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;white-space:pre-wrap;">${escapeHtml(contactMessage.message)}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:18px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            This is an automated notification from Comfort Seats admin panel.
          </p>
        </div>
      </div>
    </div>
    `;
};

/**
 * Send an email notification to the admin when a new contact message is received.
 * @param {Object} contactMessage - The contact message document
 */
const sendContactMessageEmail = async (contactMessage) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[emailService] Email not configured; skipping contact message admin email.');
      return { sent: false, reason: 'not-configured' };
    }

    const mailOptions = {
      from: `"Comfort Seats Contact" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Message: ${contactMessage.subject} — From ${contactMessage.name}`,
      html: buildContactMessageAdminEmailHtml(contactMessage),
    };

    const result = await sendEmail(mailOptions);
    if (result.sent) {
      return result;
    }
    console.error('[emailService] Failed to send contact message email:', result.reason);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send contact message email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build professional HTML email body for CUSTOMER warranty claim confirmation.
 * @param {Object} claim - The WarrantyClaim document
 */
const buildWarrantyClaimCustomerEmailHtml = (claim) => {
  const dateStr = claim.createdAt
    ? new Date(claim.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : new Date().toLocaleDateString();

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2F6FED,#1e4fbf);padding:26px 32px;color:#ffffff;">
          <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Comfort Seats</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:0.92;">Warranty Claim Received &mdash; ${escapeHtml(claim.claimId)}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#111827;margin:0 0 6px;">Dear ${escapeHtml(claim.customerName)},</p>
          <p style="font-size:14px;color:#4b5563;margin:0 0 20px;line-height:1.6;">
            We have received your warranty claim. Our technical quality inspection team is currently reviewing your submission and attachments. Below is a copy of your claim record.
          </p>

          <!-- Claim Status Box -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#1e40af;font-weight:600;">Status</span>
              <p style="margin:2px 0 0;font-size:16px;font-weight:700;color:#1d4ed8;">${escapeHtml(claim.status || 'Pending Review')}</p>
            </div>
            <div style="text-align:right;">
              <span style="font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:600;">Claim ID</span>
              <p style="margin:2px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(claim.claimId)}</p>
            </div>
          </div>

          <!-- Claim Summary -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Claim Summary</h3>
            <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;">
              <tr><td style="padding:5px 0;color:#9ca3af;">Order Number</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(claim.orderNumber)}</td></tr>
              <tr><td style="padding:5px 0;color:#9ca3af;">Product Name</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#111827;">${escapeHtml(claim.productName)}</td></tr>
              ${claim.productSku ? `<tr><td style="padding:5px 0;color:#9ca3af;">SKU</td><td style="padding:5px 0;text-align:right;color:#6b7280;">${escapeHtml(claim.productSku)}</td></tr>` : ''}
              <tr><td style="padding:5px 0;color:#9ca3af;">Quantity</td><td style="padding:5px 0;text-align:right;color:#111827;">${claim.quantity || 1}</td></tr>
              <tr><td style="padding:5px 0;color:#9ca3af;">Issue Type</td><td style="padding:5px 0;text-align:right;font-weight:600;color:#d97706;">${escapeHtml(claim.issueType)}</td></tr>
              <tr><td style="padding:5px 0;color:#9ca3af;">Date Submitted</td><td style="padding:5px 0;text-align:right;color:#6b7280;">${dateStr}</td></tr>
            </table>
          </div>

          <!-- Description -->
          <div style="background:#f9fafb;border:1px solid #eef0f3;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:#6b7280;">Issue Description</h3>
            <p style="margin:0;font-size:13.5px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${escapeHtml(claim.description)}</p>
          </div>

          <!-- Next Steps -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;color:#15803d;">What Happens Next?</h3>
            <ul style="margin:0;padding-left:18px;font-size:13.5px;color:#166534;line-height:1.6;">
              <li>Our technical support team will examine your issue and submitted evidence within <strong>24 to 48 business hours</strong>.</li>
              <li>A representative may reach out via WhatsApp or phone if further testing or photos are needed.</li>
              <li>Once verified, we will arrange for warranty replacement, repair, or spare parts shipment right to your doorstep.</li>
            </ul>
          </div>

          <!-- Contact Support -->
          <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5;">
            Need urgent assistance? Reach out directly to our customer support at <a href="mailto:comfortseats.pk@gmail.com" style="color:#2F6FED;text-decoration:none;font-weight:600;">comfortseats.pk@gmail.com</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #eef0f3;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} Comfort Seats PK. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Send confirmation email to customer after warranty claim submission.
 * @param {Object} claim - The WarrantyClaim document
 */
const sendWarrantyClaimCustomerEmail = async (claim) => {
  try {
    if (!claim.customerEmail) {
      console.warn('[emailService] No customer email provided for warranty claim confirmation');
      return { sent: false, reason: 'no-recipient' };
    }

    if (!process.env.SENDGRID_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.warn('[emailService] Email credentials not configured; skipping warranty customer email.');
      return { sent: false, reason: 'not-configured' };
    }

    const mailOptions = {
      from: `"Comfort Seats Support" <${process.env.EMAIL_USER || 'support@comfortseatspk.com'}>`,
      to: claim.customerEmail,
      subject: `Warranty Claim Received — ${claim.claimId}`,
      html: buildWarrantyClaimCustomerEmailHtml(claim),
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send warranty claim customer email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build professional HTML email body for ADMIN notification of a new warranty claim.
 * @param {Object} claim - The WarrantyClaim document
 */
const buildWarrantyClaimAdminEmailHtml = (claim) => {
  const dateStr = claim.createdAt
    ? new Date(claim.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : new Date().toLocaleDateString();

  const attachmentsList = Array.isArray(claim.attachments) && claim.attachments.length > 0
    ? claim.attachments.map((att, idx) => `
        <li style="margin-bottom:6px;">
          <a href="${att.url}" target="_blank" rel="noopener noreferrer" style="color:#2F6FED;font-weight:600;text-decoration:none;">
            [${att.fileType.toUpperCase()}] ${escapeHtml(att.filename || `Attachment #${idx + 1}`)}
          </a>
          <span style="color:#9ca3af;font-size:12px;">(${att.size ? `${(att.size / 1024 / 1024).toFixed(2)} MB` : 'View Media'})</span>
        </li>
      `).join('')
    : '<li style="color:#9ca3af;">No files attached</li>';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f5f7; padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:24px 32px;color:#ffffff;">
          <span style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;text-transform:uppercase;letter-spacing:0.05em;">New Claim</span>
          <h1 style="margin:10px 0 0;font-size:20px;font-weight:700;">Warranty Claim &mdash; ${escapeHtml(claim.claimId)}</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Order: ${escapeHtml(claim.orderNumber)}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <!-- Customer Info -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Customer Details</h3>
            <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Name</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(claim.customerName)}</td></tr>
              <tr><td style="padding:4px 0;color:#94a3b8;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(claim.customerEmail)}" style="color:#2F6FED;text-decoration:none;">${escapeHtml(claim.customerEmail)}</a></td></tr>
              <tr><td style="padding:4px 0;color:#94a3b8;">Phone</td><td style="padding:4px 0;font-weight:600;"><a href="tel:${escapeHtml(claim.customerPhone)}" style="color:#334155;text-decoration:none;">${escapeHtml(claim.customerPhone)}</a></td></tr>
              <tr><td style="padding:4px 0;color:#94a3b8;">Address</td><td style="padding:4px 0;">${escapeHtml(claim.address)}, ${escapeHtml(claim.city)}${claim.state ? `, ${escapeHtml(claim.state)}` : ''}</td></tr>
            </table>
          </div>

          <!-- Order & Product Details -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Order & Product Information</h3>
            <table style="width:100%;font-size:14px;color:#334155;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Order Number</td><td style="padding:4px 0;font-weight:600;color:#0f172a;">${escapeHtml(claim.orderNumber)}</td></tr>
              <tr><td style="padding:4px 0;color:#94a3b8;">Order Date</td><td style="padding:4px 0;">${claim.orderDate ? new Date(claim.orderDate).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><td style="padding:4px 0;color:#94a3b8;">Product</td><td style="padding:4px 0;font-weight:600;color:#0f172a;">${escapeHtml(claim.productName)}</td></tr>
              ${claim.productSku ? `<tr><td style="padding:4px 0;color:#94a3b8;">SKU</td><td style="padding:4px 0;">${escapeHtml(claim.productSku)}</td></tr>` : ''}
              <tr><td style="padding:4px 0;color:#94a3b8;">Quantity</td><td style="padding:4px 0;">${claim.quantity || 1}</td></tr>
            </table>
          </div>

          <!-- Claim Issue Details -->
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <h3 style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#991b1b;">Issue: ${escapeHtml(claim.issueType)}</h3>
              <span style="font-size:12px;color:#991b1b;font-weight:600;">${dateStr}</span>
            </div>
            <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${escapeHtml(claim.description)}</p>
          </div>

          <!-- Attachments -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Uploaded Evidence (${claim.attachments ? claim.attachments.length : 0})</h3>
            <ul style="margin:0;padding-left:18px;font-size:13.5px;">
              ${attachmentsList}
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#64748b;">
            This is an automated notification from Comfort Seats admin system.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Send notification email to admin/seller when a new warranty claim is submitted.
 * @param {Object} claim - The WarrantyClaim document
 */
const sendWarrantyClaimAdminEmail = async (claim) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('[emailService] No admin notify email configured.');
      return { sent: false, reason: 'not-configured' };
    }

    const mailOptions = {
      from: `"Comfort Seats Warranty Alert" <${process.env.EMAIL_USER || 'support@comfortseatspk.com'}>`,
      to: adminEmail,
      subject: `New Warranty Claim — ${claim.claimId} — Order ${claim.orderNumber}`,
      html: buildWarrantyClaimAdminEmailHtml(claim),
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send warranty claim admin email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Escape HTML characters safely for email templates
 */
const escapeEmailHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Build professional HTML email for Customer Bulk Order Quote confirmation
 */
const buildBulkOrderCustomerEmailHtml = (order) => {
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  const productsList = order.products && order.products.length > 0
    ? order.products.map(p => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
            <div style="font-weight:600;color:#1e293b;">${escapeEmailHtml(p.productName)}</div>
            ${p.sku ? `<div style="font-size:12px;color:#64748b;">SKU: ${escapeEmailHtml(p.sku)}</div>` : ''}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#475569;">
            ${p.quantity || 1}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#0f172a;font-weight:600;">
            ${p.price ? `Rs. ${p.price.toLocaleString()}` : 'Custom'}
          </td>
        </tr>
      `).join('')
    : `<tr><td colspan="3" style="padding:10px 12px;color:#64748b;text-align:center;">Bulk Chairs Portfolio</td></tr>`;

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:28px 16px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#2F6FED 0%,#1d4ed8 100%);padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#93c5fd;margin-bottom:4px;">BULK ORDERS</div>
          <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.02em;">Comfort Seats PK</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#e0e7ff;">Bulk Order Request Received &mdash; ${escapeEmailHtml(order.quoteId)}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Dear <strong>${escapeEmailHtml(order.customerName)}</strong>,</p>
          <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.6;">
            Thank you for contacting <strong>ComfortSeats</strong> regarding your bulk order. We have received your request and our corporate sales team is currently reviewing your requirements. We will contact you shortly with customized corporate pricing, quantity discounts, and delivery timelines.
          </p>

          <!-- Quote Status Card -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="color:#3b82f6;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Quote Reference ID</td>
                <td style="text-align:right;font-weight:700;color:#1e40af;font-size:16px;">${escapeEmailHtml(order.quoteId)}</td>
              </tr>
              <tr>
                <td style="padding-top:8px;color:#64748b;">Company / Organization</td>
                <td style="padding-top:8px;text-align:right;font-weight:600;color:#1e293b;">${escapeEmailHtml(order.companyName)}</td>
              </tr>
              <tr>
                <td style="padding-top:6px;color:#64748b;">Total Chairs Requested</td>
                <td style="padding-top:6px;text-align:right;font-weight:700;color:#2F6FED;">${order.totalQuantity} Chairs</td>
              </tr>
              <tr>
                <td style="padding-top:6px;color:#64748b;">Current Status</td>
                <td style="padding-top:6px;text-align:right;font-weight:600;color:#059669;">${escapeEmailHtml(order.status || 'Pending')}</td>
              </tr>
              <tr>
                <td style="padding-top:6px;color:#64748b;">Request Date</td>
                <td style="padding-top:6px;text-align:right;color:#64748b;">${dateStr}</td>
              </tr>
            </table>
          </div>

          <!-- Products Table -->
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:700;">Requested Products</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13.5px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f8fafc;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">
                  <th style="padding:10px 12px;text-align:left;">Item</th>
                  <th style="padding:10px 12px;text-align:center;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;">Catalog Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsList}
              </tbody>
            </table>
          </div>

          <!-- Delivery Location -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:700;">Delivery Destination</h3>
            <p style="margin:0;font-size:13.5px;color:#1e293b;line-height:1.5;">
              ${escapeEmailHtml(order.deliveryAddress)}<br />
              ${escapeEmailHtml(order.city)}${order.state ? `, ${escapeEmailHtml(order.state)}` : ''}${order.postalCode ? ` - ${escapeEmailHtml(order.postalCode)}` : ''}<br />
              ${escapeEmailHtml(order.country || 'Pakistan')}
            </p>
          </div>

          ${order.additionalDetails ? `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <h3 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:700;">Special Requirements & Notes</h3>
              <p style="margin:0;font-size:13.5px;color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeEmailHtml(order.additionalDetails)}</p>
            </div>
          ` : ''}

          <!-- Support Notice -->
          <div style="border-top:1px solid #e2e8f0;padding-top:18px;margin-top:12px;">
            <p style="font-size:13px;color:#64748b;margin:0;line-height:1.6;">
              Questions about your bulk inquiry? Contact our dedicated corporate support desk at <a href="mailto:support@comfortseatspk.com" style="color:#2F6FED;text-decoration:none;font-weight:600;">support@comfortseatspk.com</a> or call our team for expedited assistance.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f1f5f9;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#64748b;">
            &copy; ${new Date().getFullYear()} Comfort Seats PK. Ergonomic Seating & Furniture Solutions.
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Send confirmation email to customer after bulk order submission
 */
const sendBulkOrderCustomerEmail = async (order) => {
  try {
    if (!order.email) {
      console.warn('[emailService] No customer email provided for bulk order confirmation');
      return { sent: false, reason: 'no-recipient' };
    }

    const mailOptions = {
      from: `"Comfort Seats Bulk Orders" <${process.env.EMAIL_USER || 'support@comfortseatspk.com'}>`,
      to: order.email,
      subject: `Bulk Order Request Received — [${order.quoteId}]`,
      html: buildBulkOrderCustomerEmailHtml(order),
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send bulk order customer email:', error.message);
    return { sent: false, reason: error.message };
  }
};

/**
 * Build HTML notification email for ADMIN when new bulk order is requested
 */
const buildBulkOrderAdminEmailHtml = (order) => {
  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  const productsList = order.products && order.products.length > 0
    ? order.products.map(p => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#0f172a;">${escapeEmailHtml(p.productName)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;">${escapeEmailHtml(p.sku || 'N/A')}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${p.quantity || 1}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;">Rs. ${(p.price || 0).toLocaleString()}</td>
        </tr>
      `).join('')
    : `<tr><td colspan="4" style="padding:8px 10px;text-align:center;color:#64748b;">No individual products specified</td></tr>`;

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;padding:28px 16px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.18);">
        <!-- Admin Alert Banner -->
        <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:24px 32px;color:#ffffff;border-bottom:4px solid #2F6FED;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#60a5fa;">NEW INQUIRY NOTIFICATION</div>
          <h2 style="margin:4px 0 0;font-size:20px;color:#ffffff;">New Bulk Order Request &mdash; ${escapeEmailHtml(order.quoteId)}</h2>
          <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Received on ${dateStr}</p>
        </div>

        <div style="padding:28px 32px;">
          <!-- Customer & Company Details -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Client Name</span>
              <p style="margin:2px 0 10px;font-size:14px;font-weight:700;color:#0f172a;">${escapeEmailHtml(order.customerName)}</p>

              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Email</span>
              <p style="margin:2px 0 0;font-size:14px;color:#2F6FED;">${order.email ? `<a href="mailto:${order.email}" style="color:#2F6FED;text-decoration:none;">${escapeEmailHtml(order.email)}</a>` : '<span style="color:#94a3b8;font-style:italic;">Not provided</span>'}</p>
            </div>
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Company / Org</span>
              <p style="margin:2px 0 10px;font-size:14px;font-weight:700;color:#0f172a;">${escapeEmailHtml(order.companyName || 'Individual / Not specified')}</p>

              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Phone / WhatsApp</span>
              <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#0f172a;">${escapeEmailHtml(order.phone)}</p>
            </div>
          </div>

          <!-- Order Summary & Volume -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <h3 style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#1d4ed8;">Volume & Estimated Pricing</h3>
            <table style="width:100%;font-size:13.5px;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#475569;">Total Quantity Requested</td>
                <td style="padding:4px 0;text-align:right;font-weight:700;color:#1e40af;font-size:16px;">${order.totalQuantity} Chairs</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#475569;">Applicable Discount Tier</td>
                <td style="padding:4px 0;text-align:right;font-weight:600;color:#059669;">${escapeEmailHtml(order.discountTier || `${order.discountPercentage}% OFF`)}</td>
              </tr>
              ${order.estimatedSubtotal ? `
                <tr>
                  <td style="padding:4px 0;color:#475569;">Estimated Subtotal</td>
                  <td style="padding:4px 0;text-align:right;color:#64748b;">Rs. ${order.estimatedSubtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#475569;">Estimated Bulk Discount (${order.discountPercentage}%)</td>
                  <td style="padding:4px 0;text-align:right;color:#dc2626;font-weight:600;">- Rs. ${(order.estimatedDiscount || 0).toLocaleString()}</td>
                </tr>
                <tr style="border-top:1px solid #bfdbfe;">
                  <td style="padding:8px 0 0;font-weight:700;color:#0f172a;">Estimated Total</td>
                  <td style="padding:8px 0 0;text-align:right;font-weight:700;color:#2F6FED;font-size:16px;">Rs. ${(order.estimatedTotal || 0).toLocaleString()}</td>
                </tr>
              ` : ''}
            </table>
          </div>

          <!-- Product Details -->
          <div style="margin-bottom:20px;">
            <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Products Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
              <thead>
                <tr style="background:#f1f5f9;color:#475569;font-size:11px;text-transform:uppercase;">
                  <th style="padding:8px 10px;text-align:left;">Product</th>
                  <th style="padding:8px 10px;text-align:left;">SKU</th>
                  <th style="padding:8px 10px;text-align:center;">Qty</th>
                  <th style="padding:8px 10px;text-align:right;">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsList}
              </tbody>
            </table>
          </div>

          <!-- Delivery Location -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:20px;">
            <h3 style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Delivery Destination</h3>
            <p style="margin:0;font-size:13.5px;color:#1e293b;">
              ${escapeEmailHtml(order.deliveryAddress)}, ${escapeEmailHtml(order.city)}${order.state ? `, ${escapeEmailHtml(order.state)}` : ''}${order.postalCode ? ` - ${escapeEmailHtml(order.postalCode)}` : ''}, ${escapeEmailHtml(order.country || 'Pakistan')}
            </p>
          </div>

          ${order.additionalDetails ? `
            <!-- Client Additional Requirements -->
            <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
              <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#b45309;font-weight:700;">Customer Requirements & Delivery Details</h3>
              <p style="margin:0;font-size:13.5px;color:#78350f;line-height:1.6;white-space:pre-wrap;">${escapeEmailHtml(order.additionalDetails)}</p>
            </div>
          ` : ''}

          <div style="text-align:center;padding-top:12px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Manage this quote directly from the ComfortSeats Admin Dashboard under Bulk Orders.
            </p>
          </div>
        </div>

        <div style="background:#f1f5f9;padding:14px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#64748b;">
            Comfort Seats PK Internal Automation &bull; Automated Sales Notification
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Send notification email to admin/seller when a new bulk order request is placed
 */
const sendBulkOrderAdminEmail = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      console.warn('[emailService] No admin email configured for bulk order notification');
      return { sent: false, reason: 'not-configured' };
    }

    const companyDisplay = order.companyName ? order.companyName : (order.customerName || 'Inquiry');
    const qtyDisplay = order.totalQuantity ? `${order.totalQuantity} chairs` : 'Quantity open';

    const mailOptions = {
      from: `"Comfort Seats Corporate Leads" <${process.env.EMAIL_USER || 'support@comfortseatspk.com'}>`,
      to: adminEmail,
      subject: `New Bulk Order Request — [${order.quoteId}] — ${companyDisplay} (${qtyDisplay})`,
      html: buildBulkOrderAdminEmailHtml(order),
    };

    const result = await sendEmail(mailOptions);
    return result;
  } catch (error) {
    console.error('[emailService] Failed to send bulk order admin email:', error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  buildOrderEmailHtml,
  sendCustomerOrderEmail,
  buildCustomerOrderEmailHtml,
  sendOrderStatusUpdateEmails,
  sendCustomizationEmail,
  buildCustomizationEmailHtml,
  sendCustomizationCustomerEmail,
  buildCustomizationCustomerEmailHtml,
  sendContactMessageEmail,
  sendWarrantyClaimCustomerEmail,
  buildWarrantyClaimCustomerEmailHtml,
  sendWarrantyClaimAdminEmail,
  buildWarrantyClaimAdminEmailHtml,
  sendBulkOrderCustomerEmail,
  buildBulkOrderCustomerEmailHtml,
  sendBulkOrderAdminEmail,
  buildBulkOrderAdminEmailHtml,
};
