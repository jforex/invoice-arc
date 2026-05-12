import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getUserWallets, getWalletBalance } from '@/lib/circle';
import { getCurrentCompany } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const { user, company, error } = await getCurrentCompany();

    if (error || !company) {
      return NextResponse.json({ error: error || 'Not authenticated' }, { status: 401 });
    }

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

    const supabase = await createClient();
    await supabase
      .from('companies')
      .update({
        circle_wallet_id: primaryWallet.id,
        circle_wallet_address: primaryWallet.address,
        circle_pin_set: true,
      })
      .eq('id', company.id);

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
