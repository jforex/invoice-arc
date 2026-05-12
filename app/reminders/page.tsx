'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, Bell, Mail, AlertCircle } from 'lucide-react';

export default function RemindersPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .neq('status', 'paid');

    if (data) {
      const overdue = data.filter(inv => {
        const due = new Date(inv.due_date);
        due.setHours(0, 0, 0, 0);
        return due < today;
      });
      setInvoices(overdue);
    }
    setLoading(false);
  };

  const sendReminder = async (invoiceId: string) => {
    setSending(invoiceId);
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Reminder sent!');
        loadData();
      } else {
        alert(data.error || 'Failed to send');
      }
    } catch (err: any) {
      alert(err.message);
    }
    setSending(null);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔔 Overdue Invoices</h1>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No overdue invoices 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-xl border-2 border-red-200 p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900">{inv.invoice_number}</h3>
                    <p className="text-sm text-gray-600">{inv.client_name} • {inv.client_email}</p>
                    <p className="text-sm text-gray-900 font-medium mt-1">{formatCurrency(inv.total, inv.currency || 'USD')}</p>
                    <p className="text-xs text-red-600 mt-1">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => sendReminder(inv.id)} disabled={sending === inv.id} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 disabled:opacity-50">
                  <Mail className="w-4 h-4" />
                  {sending === inv.id ? 'Sending...' : 'Send Reminder'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
