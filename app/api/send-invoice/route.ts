import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { InvoiceEmailTemplate } from '@/lib/InvoiceEmailTemplate';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import React from 'react';

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

    // Fetch company settings
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single();

    // Generate PDF buffer with company branding
    const pdfElement = React.createElement(InvoicePDF as any, { 
      invoice: { ...invoice, items: items || [] },
      company: company || undefined,
    }) as any;
    
    const pdfBlob = await pdf(pdfElement).toBlob();
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Format dates for email
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Create PUBLIC invoice URL using public_token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const invoiceUrl = invoice.public_token 
      ? `${baseUrl}/invoice/${invoice.public_token}`
      : `${baseUrl}/dashboard/invoices/${invoiceId}`;

    // Initialize Resend inside the function
    const resend = new Resend(process.env.RESEND_API_KEY);

    const companyName = company?.name || 'Christian Design Studio';

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [invoice.client_email],
      subject: `Invoice ${invoice.invoice_number} from ${companyName}`,
      html: InvoiceEmailTemplate({
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.client_name,
        total: `$${invoice.total.toFixed(2)}`,
        dueDate: formatDate(invoice.due_date),
        invoiceUrl: invoiceUrl,
        companyName: company?.name,
        companyEmail: company?.email,
        companyAddress: company?.address,
        companyPhone: company?.phone,
        companyWebsite: company?.website,
        brandColor: company?.brand_color,
        logoUrl: company?.logo_url,
        emailSignature: company?.email_signature,
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
