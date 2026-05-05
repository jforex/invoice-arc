import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    // Get the recurring invoice template
    const { data: template, error: templateError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!template.is_recurring) {
      return NextResponse.json({ error: 'This is not a recurring invoice' }, { status: 400 });
    }

    // Get original items
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    // Generate new invoice number
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.length > 0) {
      const lastNumber = parseInt(lastInvoice[0].invoice_number.replace('INV-', ''));
      nextNumber = lastNumber + 1;
    }
    const newInvoiceNumber = `INV-${String(nextNumber).padStart(3, '0')}`;

    // Calculate dates for new invoice
    const today = new Date();
    const dueDate = new Date(today);
    
    // Calculate due date based on original spread
    const originalIssue = new Date(template.issue_date);
    const originalDue = new Date(template.due_date);
    const daysDiff = Math.ceil((originalDue.getTime() - originalIssue.getTime()) / (1000 * 60 * 60 * 24));
    dueDate.setDate(today.getDate() + daysDiff);

    // Create new invoice (NOT marked as recurring - it's a generated copy)
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: newInvoiceNumber,
        client_name: template.client_name,
        client_email: template.client_email,
        client_address: template.client_address,
        issue_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        subtotal: template.subtotal,
        tax: template.tax,
        total: template.total,
        notes: template.notes,
        public_token: uuidv4(),
        currency: template.currency,
        is_recurring: false,
        parent_invoice_id: template.id,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Copy items
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        invoice_id: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
      }));

      await supabase.from('invoice_items').insert(itemsToInsert);
    }

    // Update next recurring date on template
    const nextDate = new Date(template.recurring_next_date);
    switch (template.recurring_frequency) {
      case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break;
      case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
      case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
      case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }

    // Check if end date reached
    let stillActive = true;
    if (template.recurring_end_date) {
      const endDate = new Date(template.recurring_end_date);
      if (nextDate > endDate) {
        stillActive = false;
      }
    }

    await supabase
      .from('invoices')
      .update({
        recurring_next_date: nextDate.toISOString().split('T')[0],
        recurring_active: stillActive,
      })
      .eq('id', template.id);

    // Log activity
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    if (companies && companies.length > 0) {
      await supabase.from('activity').insert({
        company_id: companies[0].id,
        type: 'invoice_created',
        invoice_id: newInvoice.id,
        client_name: template.client_name,
        invoice_number: newInvoiceNumber,
        amount: template.total,
      });
    }

    return NextResponse.json({
      success: true,
      newInvoiceId: newInvoice.id,
      newInvoiceNumber: newInvoiceNumber,
    });
  } catch (error: any) {
    console.error('Error generating recurring invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
