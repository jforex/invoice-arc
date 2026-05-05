'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import {
  ArrowLeft,
  Bell,
  Mail,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  CheckCircle,
} from 'lucide-react';

interface OverdueInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  total: number;
  currency: string;
  due_date: string;
  status: string;
  last_reminder_sent?: string;
  reminder_count?: number;
}

export default function RemindersPage() {
  const router = useRouter();
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
  const [upcomingInvoices, setUpcomingInvoices] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('default_currency')
        .limit(1)
        .single();

      if (company?.default_currency) {
        setDefaultCurrency(company.default_currency);
      }

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .neq('status', 'paid')
        .order('due_date', { ascending: true });

      if (invoices) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue: OverdueInvoice[] = [];
        const upcoming: OverdueInvoice[] = [];

        invoices.forEach((inv) => {
          const dueDate = new Date(inv.due_date);
          dueDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff > 0) {
            overdue.push(inv);
          } else if (daysDiff >= -7) {
            upcoming.push(inv);
          }
        });

        setOverdueInvoices(overdue);
        setUpcomingInvoices(upcoming);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading:', error);
      setLoading(false);
    }
  };

  const sendReminder = async (invoice: OverdueInvoice) => {
    if (!confirm(`Send reminder email to ${invoice.client_name} (${invoice.client_email})?`)) return;

    setSending(invoice.id);
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');

      alert(`✓ Reminder sent successfully!\nThis was reminder #${data.reminderCount}`);
      loadInvoices();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Failed to send reminder');
    } finally {
      setSending(null);
    }
  };

  const sendAllReminders = async () => {
    if (!confirm(`Send reminders to all ${overdueInvoices.length} overdue invoices?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const invoice of overdueInvoices) {
      try {
        const response = await fetch('/api/send-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: invoice.id }),
        });
        if (response.ok) successCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }

    alert(`✓ Sent ${successCount} reminders\n${failCount > 0 ? `✗ Failed: ${failCount}` : ''}`);
    loadInvoices();
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getUrgencyBadge = (daysOverdue: number) => {
    if (daysOverdue > 30) return { color: 'bg-red-100 text-red-800 border-red-300', label: '🚨 Critical' };
    if (daysOverdue > 14) return { color: 'bg-orange-100 text-orange-800 border-orange-300', label: '⚠️ Urgent' };
    if (daysOverdue > 7) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: '⏰ Overdue' };
    return { color: 'bg-blue-100 text-blue-800 border-blue-300', label: '📌 Recent' };
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading...</p></div></div>;
  }

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔔 Reminders</h1>
              <p className="text-gray-600 mt-1">Manage overdue invoice reminders</p>
            </div>
            {overdueInvoices.length > 0 && (
              <button
                onClick={sendAllReminders}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send All Reminders ({overdueInvoices.length})
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Overdue Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{overdueInvoices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOverdue, defaultCurrency)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Due Soon (7 days)</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingInvoices.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Overdue Invoices
          </h2>

          {overdueInvoices.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear! 🎉</h3>
              <p className="text-gray-600">No overdue invoices at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueInvoices.map((invoice) => {
                const daysOverdue = getDaysOverdue(invoice.due_date);
                const urgency = getUrgencyBadge(daysOverdue);
                
                return (
                  <div key={invoice.id} className={`bg-white rounded-xl border-2 p-6 ${urgency.color.includes('red') ? 'border-red-200' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgency.color}`}>
                            {urgency.label}
                          </span>
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                            {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                          </span>
                          {invoice.reminder_count && invoice.reminder_count > 0 && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                              📧 {invoice.reminder_count} {invoice.reminder_count === 1 ? 'reminder' : 'reminders'} sent
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <p className="text-xs text-gray-500 mb-1">DUE DATE</p>
                            <p className="font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
                            {invoice.last_reminder_sent && (
                              <p className="text-xs text-gray-500 mt-1">
                                Last reminder: {formatDate(invoice.last_reminder_sent)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => sendReminder(invoice)}
                          disabled={sending === invoice.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          {sending === invoice.id ? 'Sending...' : 'Send Reminder'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming */}
        {upcomingInvoices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Due Soon (Next 7 Days)
            </h2>

            <div className="space-y-3">
              {upcomingInvoices.map((invoice) => {
                const daysUntil = -getDaysOverdue(invoice.due_date);
                
                return (
                  <div key={invoice.id} className="bg-white rounded-xl border border-yellow-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">CLIENT</p>
                            <p className="font-medium text-gray-900">{invoice.client_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">AMOUNT</p>
                            <p className="font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency || 'USD')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">DUE DATE</p>
                            <p className="font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
