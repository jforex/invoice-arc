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
      subject: `Invoice ${invoice.invoice_number} from ${company.name}`,
      html: `
        <h2>Invoice ${invoice.invoice_number}</h2>
        <p>Hi ${invoice.client_name},</p>
        <p>You have a new invoice from ${company.name}.</p>
        <p>Amount: ${invoice.currency} ${invoice.total}</p>
        <p><a href="${publicUrl}">View & Pay Invoice</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
