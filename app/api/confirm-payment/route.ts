import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, transactionId } = body;


    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    const updateData: any = {
      status: 'paid',
      payment_method: 'usdc_arc',
      paid_at: new Date().toISOString(),
    };

    if (transactionId) {
      updateData.transaction_hash = transactionId;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice marked as paid',
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}