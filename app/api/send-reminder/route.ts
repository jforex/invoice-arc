import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { generateReminderEmailHTML, generateReminderSubject } from '@/lib/ReminderEmailTemplate';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single();

    const companyName = company?.name || 'Your Company';
    const brandColor = company?.brand_color || '#3b82f6';
    const logoUrl = company?.logo_url;
    const signature = company?.email_signature;
    const companyEmail = company?.email;

    // Calculate days overdue
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue < 0) {
      return NextResponse.json({ error: 'Invoice is not yet due' }, { status: 400 });
    }

    // Format amount with currency
    const amount = formatCurrency(invoice.total, invoice.currency || 'USD');
    const formattedDueDate = dueDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Generate public link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
    const publicLink = `${baseUrl}/invoice/${invoice.public_token}`;

    // Get current reminder count
    const reminderCount = invoice.reminder_count || 0;

    // Generate email
    const emailHTML = generateReminderEmailHTML({
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.client_name,
      amount,
      dueDate: formattedDueDate,
      daysOverdue,
      publicLink,
      companyName,
      companyEmail,
      brandColor,
      logoUrl,
      signature,
      reminderCount,
    });

    const subject = generateReminderSubject(invoice.invoice_number, daysOverdue, reminderCount);

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'Inv <onboarding@resend.dev>',
      to: invoice.client_email,
      subject,
      html: emailHTML,
    });

    if (emailError) {
      console.error('Email error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Update invoice with reminder info
    await supabase
      .from('invoices')
      .update({
        last_reminder_sent: new Date().toISOString(),
        reminder_count: reminderCount + 1,
      })
      .eq('id', invoice.id);

    // Log activity
    if (company?.id) {
      await supabase.from('activity').insert({
        company_id: company.id,
        type: 'reminder_sent',
        invoice_id: invoice.id,
        client_name: invoice.client_name,
        invoice_number: invoice.invoice_number,
        amount: invoice.total,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${invoice.client_email}`,
      reminderCount: reminderCount + 1,
      daysOverdue,
    });
  } catch (error: any) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
