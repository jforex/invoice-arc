import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { InvoiceEmailTemplate } from '@/lib/InvoiceEmailTemplate';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Fetch invoice from database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Fetch invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch invoice items' },
        { status: 500 }
      );
    }

    // Generate PDF buffer - TypeScript type assertion needed here
    // @ts-expect-error - pdf() accepts this component but TypeScript can't infer the correct type
    const pdfBlob = await pdf(
      React.createElement(InvoicePDF, { 
        invoice: { ...invoice, items: items || [] } 
      })
    ).toBlob();

    // Convert blob to buffer
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Format dates for email
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Create invoice URL (for production, use your actual domain)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invoiceUrl = `${baseUrl}/dashboard/invoices/${invoiceId}`;

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: 'Christian Design Studio <onboarding@resend.dev>', // Use resend test domain for now
      to: [invoice.client_email],
      subject: `Invoice ${invoice.invoice_number} from Christian Design Studio`,
      html: InvoiceEmailTemplate({
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        total: `$${invoice.total.toFixed(2)}`,
        dueDate: formatDate(invoice.due_date),
        invoiceUrl: invoiceUrl,
      }),
      attachments: [
        {
          filename: `${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    // Log activity in database
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (companies && companies.length > 0) {
      await supabase.from('activity').insert({
        company_id: companies[0].id,
        type: 'email_sent',
        invoice_id: invoiceId,
        client_name: invoice.client_name,
        invoice_number: invoice.invoice_number,
        amount: invoice.total,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Invoice email sent successfully',
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
