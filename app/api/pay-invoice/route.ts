import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transferUSDC, getTransactionStatus } from '@/lib/circle';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, payerWalletId } = await request.json();

    if (!invoiceId || !payerWalletId) {
      return NextResponse.json(
        { error: 'Invoice ID and payer wallet ID required' },
        { status: 400 }
      );
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get the recipient's wallet (the freelancer's company wallet)
    const { data: companies } = await supabase
      .from('companies')
      .select('circle_wallet_address')
      .limit(1)
      .single();

    if (!companies?.circle_wallet_address) {
      return NextResponse.json(
        { error: 'Recipient wallet not configured' },
        { status: 400 }
      );
    }

    // Convert invoice total to USDC amount (USDC has 6 decimals on Arc ERC-20)
    const amount = invoice.total.toFixed(2);

    // Initiate USDC transfer
    const { transactionId } = await transferUSDC(
      payerWalletId,
      companies.circle_wallet_address,
      amount
    );

    // Update invoice with transaction info
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_method: 'usdc_arc',
        transaction_hash: transactionId,
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Payment initiated successfully',
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}

// Check transaction status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    const status = await getTransactionStatus(transactionId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
