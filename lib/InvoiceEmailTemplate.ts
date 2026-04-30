interface EmailTemplateProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  invoiceUrl: string;
}

export const InvoiceEmailTemplate = ({
  invoiceNumber,
  clientName,
  total,
  dueDate,
  invoiceUrl,
}: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">INVOICE</h1>
      <p style="margin: 10px 0 0 0; color: #E0E7FF; font-size: 18px;">${invoiceNumber}</p>
    </div>

    <!-- Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      
      <!-- Greeting -->
      <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.5;">
        Hi ${clientName},
      </p>
      
      <p style="margin: 0 0 30px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
        You've received a new invoice from <strong>Christian Design Studio</strong>. Please find the details below.
      </p>

      <!-- Invoice Details Card -->
      <div style="background-color: #F9FAFB; border: 2px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #6B7280; font-size: 14px;">Amount Due:</span>
          <span style="color: #111827; font-size: 18px; font-weight: bold;">${total}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #6B7280; font-size: 14px;">Invoice Number:</span>
          <span style="color: #111827; font-size: 14px; font-weight: 600;">${invoiceNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7280; font-size: 14px;">Due Date:</span>
          <span style="color: #111827; font-size: 14px; font-weight: 600;">${dueDate}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${invoiceUrl}" style="display: inline-block; background-color: #1E40AF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(30, 64, 175, 0.3);">
          View Invoice
        </a>
      </div>

      <!-- Payment Info -->
      <div style="background-color: #DBEAFE; border-left: 4px solid #1E40AF; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; color: #1E40AF; font-size: 14px; font-weight: 600;">
          💰 Fast Payment Options
        </p>
        <p style="margin: 0; color: #1E3A8A; font-size: 13px; line-height: 1.5;">
          Pay with USDC • 0% fees • 10-second settlement
        </p>
      </div>

      <!-- Footer Message -->
      <p style="margin: 0 0 10px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
        The invoice is also attached as a PDF for your records.
      </p>
      
      <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
        If you have any questions, please reply to this email.
      </p>

      <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.6;">
        Best regards,<br>
        <strong>Christian Design Studio</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px 0 20px;">
      <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
        Christian Design Studio<br>
        Port Harcourt, Rivers State, Nigeria<br>
        hello@christiandesign.com
      </p>
    </div>

  </div>
</body>
</html>
  `;
};
