import { NextRequest, NextResponse } from 'next/server';
import { initializeUser } from '@/lib/circle';

export async function POST(request: NextRequest) {
  try {
    const { userToken } = await request.json();

    if (!userToken) {
      return NextResponse.json({ error: 'User token required' }, { status: 400 });
    }

    const { challengeId } = await initializeUser(userToken);

    return NextResponse.json({
      success: true,
      challengeId,
    });
  } catch (error: any) {
    console.error('Error creating PIN challenge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
