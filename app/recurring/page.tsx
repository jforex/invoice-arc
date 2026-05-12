'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, Repeat, Pause, Play, Calendar } from 'lucide-react';

export default function RecurringPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_recurring', true);

    if (data) setInvoices(data);
    setLoading(false);
  };

  const togglePause = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from('invoices').update({ recurring_active: !current }).eq('id', id);
    loadData();
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔄 Recurring Invoices</h1>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recurring invoices yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">{inv.invoice_number}</h3>
                  <p className="text-sm text-gray-600">{inv.client_name} • {formatCurrency(inv.total, inv.currency || 'USD')}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {inv.recurring_frequency}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inv.recurring_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {inv.recurring_active ? 'Active' : 'Paused'}
                  </span>
                  <button onClick={() => togglePause(inv.id, inv.recurring_active)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1">
                    {inv.recurring_active ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
