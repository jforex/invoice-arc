import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/circle';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: 'Wallet ID required' },
        { status: 400 }
      );
    }

    const balance = await getWalletBalance(walletId);

    return NextResponse.json({
      success: true,
      balance,
    });
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
