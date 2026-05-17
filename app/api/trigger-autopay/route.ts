import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, companies!inner(name, email)')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ skipped: true, reason: 'already_paid' });
    }

    // Find the recipient's InvFlow account by email
    const { data: recipientUsers } = await supabase
      .from('companies')
      .select('id, user_id, name, email, auto_pay_enabled, auto_pay_max_amount, circle_user_id, circle_wallet_id')
      .ilike('email', invoice.client_email);

    if (!recipientUsers || recipientUsers.length === 0) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'recipient_not_invflow_user' 
      });
    }

    const recipient = recipientUsers[0];

    // Check if auto-pay enabled
    if (!recipient.auto_pay_enabled) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'auto_pay_disabled' 
      });
    }

    // Check max amount
    if (invoice.total > recipient.auto_pay_max_amount) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'exceeds_max_amount',
        max: recipient.auto_pay_max_amount,
        total: invoice.total
      });
    }

    // Check if sender is trusted
    const senderEmail = invoice.companies?.email?.toLowerCase();
    if (!senderEmail) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'sender_email_missing' 
      });
    }

console.log('Looking for trusted sender:', {
  company_id: recipient.id,
  sender_email: senderEmail
});

const { data: trusted, error: trustedError } = await supabase
  .from('trusted_senders')
  .select('id')
  .eq('company_id', recipient.id)
  .eq('sender_email', senderEmail)
  .maybeSingle();

console.log('Trusted result:', trusted, 'Error:', trustedError);

    if (!trusted) {
      return NextResponse.json({ 
        skipped: true, 
        reason: 'sender_not_trusted',
        sender: senderEmail
      });
    }

    // All checks passed - this invoice qualifies for auto-pay
    // For now, just mark it as eligible. Actual payment requires user's PIN
    // which means we can't fully auto-pay without their device.
    // 
    // Reality check: True auto-pay would require either:
    // 1. Server-side wallet (developer-controlled) - changes security model
    // 2. Pre-authorized signed permission - complex EIP-3009 flow
    // 3. Notification + 1-click confirm - most practical for v1
    //
    // For v1, we mark eligible invoices and notify the receiver to confirm.

    await supabase
      .from('invoices')
      .update({ auto_paid: true })
      .eq('id', invoiceId);

    return NextResponse.json({
      success: true,
      eligible: true,
      message: 'Invoice marked as auto-pay eligible. Recipient will be notified to confirm.',
      recipient: recipient.name,
    });
  } catch (error: any) {
    console.error('Auto-pay error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-pay failed' },
      { status: 500 }
    );
  }
}
