import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { getCurrentCompany } from '@/lib/auth-helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { company, error: authError } = await getCurrentCompany();
    if (authError || !company) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { invoiceId } = await request.json();
    if (!invoiceId) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });

    const supabase = await createClient();
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('company_id', company.id)
      .single();

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice.public_token}`;

    await resend.emails.send({
      from: 'invoices@yourdomain.com',
      to: invoice.client_email,
      subject: `Reminder: Invoice ${invoice.invoice_number} is overdue`,
      html: `
        <h2>Friendly Reminder</h2>
        <p>Hi ${invoice.client_name},</p>
        <p>Your invoice ${invoice.invoice_number} for ${invoice.currency} ${invoice.total} is overdue.</p>
        <p><a href="${publicUrl}">Pay Now</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
