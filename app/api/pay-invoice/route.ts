import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUserToken, createTransferChallenge } from '@/lib/circle';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, payerUserId } = await request.json();

    if (!invoiceId || !payerUserId) {
      return NextResponse.json(
        { error: 'Invoice ID and payer user ID required' },
        { status: 400 }
      );
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
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Get recipient's wallet address
    const { data: companies } = await supabase
      .from('companies')
      .select('circle_wallet_address')
      .not('circle_wallet_address', 'is', null)
      .limit(1)
      .single();

    if (!companies?.circle_wallet_address) {
      return NextResponse.json(
        { error: 'Recipient wallet not configured' },
        { status: 400 }
      );
    }

    // Get payer's user token and wallets
    const { userToken, encryptionKey } = await createUserToken(payerUserId);

    // Get payer's wallet
    const { initiateUserControlledWalletsClient } = await import('@circle-fin/user-controlled-wallets');
    const client = initiateUserControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
    });

    const walletsResponse = await client.listWallets({ userToken });
    const payerWallet = walletsResponse.data?.wallets?.[0];

    if (!payerWallet) {
      return NextResponse.json({ error: 'Payer has no wallet' }, { status: 400 });
    }

    // Create transfer challenge
    const amount = invoice.total.toFixed(2);
    const { challengeId } = await createTransferChallenge(
      userToken,
      payerWallet.id,
      companies.circle_wallet_address,
      amount
    );

    return NextResponse.json({
      success: true,
      challengeId,
      userToken,
      encryptionKey,
    });
  } catch (error: any) {
    console.error('Error creating payment challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
