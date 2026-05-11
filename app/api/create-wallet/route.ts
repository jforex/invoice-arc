import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWallet } from '@/lib/circle';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the company
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (fetchError) throw fetchError;
    if (!companies || companies.length === 0) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const company = companies[0];

    // Check if wallet already exists
    if (company.circle_wallet_id) {
      return NextResponse.json({
        success: true,
        message: 'Wallet already exists',
        walletAddress: company.circle_wallet_address,
        walletId: company.circle_wallet_id,
      });
    }

    // Create new wallet on Arc Testnet
    const { walletId, walletAddress, walletSetId } = await createWallet();

    // Save to database
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        circle_wallet_id: walletId,
        circle_wallet_address: walletAddress,
        circle_wallet_set_id: walletSetId,
      })
      .eq('id', company.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Wallet created successfully',
      walletAddress,
      walletId,
    });
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    );
  }
}
