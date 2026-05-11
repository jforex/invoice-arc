import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUser, createUserToken } from '@/lib/circle';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (!companies || companies.length === 0) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const company = companies[0];

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
