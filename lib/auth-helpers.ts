import { createClient } from '@/lib/supabase-server';

export async function getCurrentCompany() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, company: null, error: 'Not authenticated' };
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !company) {
    return { user, company: null, error: 'Company not found' };
  }

  return { user, company, error: null };
}
