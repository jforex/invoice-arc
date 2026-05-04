interface EmailTemplateProps {
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string;
  invoiceUrl: string;
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyWebsite?: string;
  brandColor?: string;
  logoUrl?: string;
  emailSignature?: string;
}

export const InvoiceEmailTemplate = ({
  invoiceNumber,
  clientName,
  total,
  dueDate,
  invoiceUrl,
  companyName = 'Christian Design Studio',
  companyEmail = 'hello@christiandesign.com',
  companyAddress = 'Port Harcourt, Rivers State, Nigeria',
  companyPhone,
  companyWebsite,
  brandColor = '#2563eb',
  logoUrl,
  emailSignature = 'Best regards,',
}: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f6f8;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f6f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header with Brand Color -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%); padding: 40px 30px; text-align: center;">
              ${logoUrl ? `
                <div style="margin-bottom: 16px;">
                  <img src="${logoUrl}" alt="${companyName}" style="max-width: 80px; max-height: 80px; background-color: #ffffff; padding: 8px; border-radius: 12px;">
                </div>
              ` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">INVOICE</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 16px;">${invoiceNumber}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
                Hi ${clientName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                You've received a new invoice from <strong>${companyName}</strong>. Please find the details below.
              </p>
              
              <!-- Invoice Details Card -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount Due:</td>
                        <td style="padding: 8px 0; text-align: right; color: ${brandColor}; font-size: 20px; font-weight: bold;">${total}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Invoice Number:</td>
                        <td style="padding: 8px 0; text-align: right; color: #1e293b; font-size: 14px; font-weight: 600;">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Due Date:</td>
                        <td style="padding: 8px 0; text-align: right; color: #1e293b; font-size: 14px; font-weight: 600;">${dueDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- View Invoice Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${invoiceUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600;">
                      View Invoice
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Fast Payment Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${brandColor}10; border: 1px solid ${brandColor}30; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: ${brandColor}; font-size: 14px; font-weight: 600;">
                      💰 Fast Payment Options
                    </p>
                    <p style="margin: 0; color: ${brandColor}; font-size: 13px; line-height: 1.5;">
                      Pay with USDC • 0% fees • 10-second settlement
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- PDF Notice -->
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                The invoice is also attached as a PDF for your records.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you have any questions, please reply to this email.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #1e293b; font-size: 15px; line-height: 1.6;">
                ${emailSignature}<br>
                <strong>${companyName}</strong>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">${companyName}</p>
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">${companyAddress}</p>
              ${companyPhone ? `<p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">${companyPhone}</p>` : ''}
              <p style="margin: 0 0 8px 0;">
                <a href="mailto:${companyEmail}" style="color: ${brandColor}; text-decoration: none; font-size: 12px;">${companyEmail}</a>
              </p>
              ${companyWebsite ? `
                <p style="margin: 0;">
                  <a href="${companyWebsite}" style="color: ${brandColor}; text-decoration: none; font-size: 12px;">${companyWebsite}</a>
                </p>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
