interface ReminderEmailProps {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  publicLink: string;
  companyName: string;
  companyEmail?: string;
  brandColor?: string;
  logoUrl?: string;
  signature?: string;
  reminderCount: number;
}

export function generateReminderEmailHTML({
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  daysOverdue,
  publicLink,
  companyName,
  companyEmail,
  brandColor = '#3b82f6',
  logoUrl,
  signature,
  reminderCount,
}: ReminderEmailProps): string {
  const isFirstReminder = reminderCount === 0;
  const isUrgent = daysOverdue > 14;

  const subject = isFirstReminder
    ? `Friendly Reminder: Invoice ${invoiceNumber}`
    : isUrgent
    ? `URGENT: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`
    : `Reminder: Invoice ${invoiceNumber} is overdue`;

  const greeting = isFirstReminder
    ? `Hi ${clientName},`
    : isUrgent
    ? `Dear ${clientName},`
    : `Hello ${clientName},`;

  const message = isFirstReminder
    ? `This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> is now overdue. The original due date was ${dueDate}.`
    : isUrgent
    ? `Invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> is now <strong>${daysOverdue} days overdue</strong>. We kindly request immediate payment to avoid any disruption to our services.`
    : `This is a reminder that invoice <strong>${invoiceNumber}</strong> for <strong>${amount}</strong> is <strong>${daysOverdue} days overdue</strong>. The due date was ${dueDate}.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%); padding: 40px 30px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 60px; margin-bottom: 16px;" />` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                ${isUrgent ? '⚠️ Urgent Payment Reminder' : '📧 Payment Reminder'}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                ${greeting}
              </p>

              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                ${message}
              </p>

              <!-- Invoice Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${isUrgent ? '#fef2f2' : '#fef9c3'}; border-left: 4px solid ${isUrgent ? '#ef4444' : '#eab308'}; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 500; text-transform: uppercase;">Invoice Details</p>
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Invoice Number:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Amount Due:</td>
                        <td style="color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">${amount}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Original Due Date:</td>
                        <td style="color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${dueDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Days Overdue:</td>
                        <td style="color: ${isUrgent ? '#dc2626' : '#ea580c'}; font-size: 14px; font-weight: 700; text-align: right;">${daysOverdue} days</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${publicLink}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      View & Pay Invoice
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                If you've already made the payment, please disregard this message. If you have any questions or concerns, please don't hesitate to reach out.
              </p>

              ${
                isUrgent
                  ? `<div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">
                  ⚠️ Please prioritize this payment to avoid further delays. Continued non-payment may affect future services.
                </p>
              </div>`
                  : ''
              }

              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                Thank you for your prompt attention to this matter.
              </p>

              ${
                signature
                  ? `<div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">${signature}</p>
              </div>`
                  : `<p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 16px 0 0 0;">
                Best regards,<br><strong>${companyName}</strong>
              </p>`
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">
                This is reminder #${reminderCount + 1} for invoice ${invoiceNumber}
              </p>
              ${companyEmail ? `<p style="color: #6b7280; font-size: 13px; margin: 8px 0 0 0;">Contact us: <a href="mailto:${companyEmail}" style="color: ${brandColor};">${companyEmail}</a></p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateReminderSubject(invoiceNumber: string, daysOverdue: number, reminderCount: number): string {
  if (reminderCount === 0) return `Friendly Reminder: Invoice ${invoiceNumber}`;
  if (daysOverdue > 14) return `URGENT: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`;
  return `Reminder: Invoice ${invoiceNumber} is overdue`;
}
