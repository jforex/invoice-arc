'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import {
  ArrowLeft,
  Repeat,
  Pause,
  Play,
  Calendar,
  Trash2,
  Zap,
  Eye,
} from 'lucide-react';

interface RecurringInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  total: number;
  currency: string;
  recurring_frequency: string;
  recurring_next_date: string;
  recurring_end_date?: string;
  recurring_active: boolean;
  created_at: string;
}

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const [recurring, setRecurring] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadRecurring();
  }, []);

  const loadRecurring = async () => {
    try {
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('is_recurring', true)
        .order('recurring_next_date', { ascending: true });

      if (data) setRecurring(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recurring invoices:', error);
      setLoading(false);
    }
  };

  const togglePause = async (invoice: RecurringInvoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ recurring_active: !invoice.recurring_active })
        .eq('id', invoice.id);

      if (error) throw error;
      loadRecurring();
    } catch (error) {
      console.error('Error toggling pause:', error);
      alert('Failed to update');
    }
  };

  const stopRecurring = async (invoice: RecurringInvoice) => {
    if (!confirm(`Stop recurring for ${invoice.invoice_number}? This won't delete the invoice, just stop creating new ones.`)) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ is_recurring: false, recurring_active: false })
        .eq('id', invoice.id);

      if (error) throw error;
      loadRecurring();
    } catch (error) {
      console.error('Error stopping recurring:', error);
    }
  };

  const generateNow = async (invoice: RecurringInvoice) => {
    if (!confirm(`Generate a new invoice from ${invoice.invoice_number} now?`)) return;

    setGenerating(invoice.id);
    try {
      const response = await fetch('/api/generate-recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');

      alert(`Invoice ${data.newInvoiceNumber} created successfully!`);
      loadRecurring();
    } catch (error: any) {
      console.error('Error generating:', error);
      alert(error.message || 'Failed to generate');
    } finally {
      setGenerating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: { [key: string]: string } = {
      weekly: '📅 Weekly',
      monthly: '📅 Monthly',
      quarterly: '📅 Quarterly',
      yearly: '📅 Yearly',
    };
    return labels[freq] || freq;
  };

  const getDaysUntil = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔄 Recurring Invoices</h1>
              <p className="text-gray-600 mt-1">Manage your auto-generating invoices</p>
            </div>
            <button onClick={() => router.push('/dashboard/invoices/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              New Recurring
            </button>
          </div>
        </div>

        {recurring.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Repeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Recurring Invoices Yet</h2>
            <p className="text-gray-600 mb-6">Create an invoice and check "Make this recurring" to set it up</p>
            <button onClick={() => router.push('/dashboard/invoices/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Create First Recurring Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recurring.map((invoice) => (
              <div key={invoice.id} className={`bg-white rounded-xl border-2 p-6 transition-colors ${
                invoice.recurring_active ? 'border-blue-200' : 'border-gray-200 opacity-60'
              }`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {getFrequencyLabel(invoice.recurring_frequency)}
                      </span>
                      {invoice.recurring_active ? (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CLIENT</p>
                        <p className="font-medium text-gray-900">{invoice.client_name}</p>
                        <p className="text-sm text-gray-500">{invoice.client_email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AMOUNT</p>
                        <p className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.total, invoice.currency || 'USD')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">NEXT INVOICE</p>
                        <p className="font-medium text-gray-900">{formatDate(invoice.recurring_next_date)}</p>
                        <p className="text-sm text-blue-600">{getDaysUntil(invoice.recurring_next_date)}</p>
                      </div>
                    </div>

                    {invoice.recurring_end_date && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ends on {formatDate(invoice.recurring_end_date)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {invoice.recurring_active && (
                      <button
                        onClick={() => generateNow(invoice)}
                        disabled={generating === invoice.id}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                        title="Generate Now"
                      >
                        <Zap className="w-4 h-4" />
                        {generating === invoice.id ? 'Creating...' : 'Generate'}
                      </button>
                    )}

                    <button
                      onClick={() => togglePause(invoice)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                        invoice.recurring_active
                          ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                          : 'bg-green-50 hover:bg-green-100 text-green-700'
                      }`}
                      title={invoice.recurring_active ? 'Pause' : 'Resume'}
                    >
                      {invoice.recurring_active ? <><Pause className="w-4 h-4" />Pause</> : <><Play className="w-4 h-4" />Resume</>}
                    </button>

                    <button
                      onClick={() => stopRecurring(invoice)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                      title="Stop Recurring"
                    >
                      <Trash2 className="w-4 h-4" />
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
