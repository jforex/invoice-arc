import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserWallets, getWalletBalance } from '@/lib/circle';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userToken } = await request.json();

    if (!userToken) {
      return NextResponse.json({ error: 'User token required' }, { status: 400 });
    }

    const wallets = await getUserWallets(userToken);

    if (wallets.length === 0) {
      return NextResponse.json({ wallets: [], balance: '0' });
    }

    const primaryWallet = wallets[0];
    const balance = await getWalletBalance(userToken, primaryWallet.id);

    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (companies && companies.length > 0) {
      await supabase
        .from('companies')
        .update({
          circle_wallet_id: primaryWallet.id,
          circle_wallet_address: primaryWallet.address,
          circle_pin_set: true,
        })
        .eq('id', companies[0].id);
    }

    return NextResponse.json({
      success: true,
      wallets,
      primaryWallet,
      balance,
    });
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallets' },
      { status: 500 }
    );
  }
}