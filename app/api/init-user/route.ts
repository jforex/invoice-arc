import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createUser, createUserToken } from '@/lib/circle';
import { getCurrentCompany } from '@/lib/auth-helpers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { user, company, error } = await getCurrentCompany();

    if (error || !company) {
      return NextResponse.json({ error: error || 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();
    let circleUserId = company.circle_user_id;

    if (!circleUserId) {
      circleUserId = uuidv4();
      await createUser(circleUserId);

      await supabase
        .from('companies')
        .update({ circle_user_id: circleUserId })
        .eq('id', company.id);
    }

    const { userToken, encryptionKey } = await createUserToken(circleUserId);

    return NextResponse.json({
      success: true,
      userId: circleUserId,
      userToken,
      encryptionKey,
      pinSet: company.circle_pin_set || false,
    });
  } catch (error: any) {
    console.error('Error initializing user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize user' },
      { status: 500 }
    );
  }
}
