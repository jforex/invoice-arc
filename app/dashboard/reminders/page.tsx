'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  Bell,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

export default function RemindersPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      const overdue = data
        .filter((inv) => {
          const due = new Date(inv.due_date);
          due.setHours(0, 0, 0, 0);
          return due < today;
        })
        .sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
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
        alert('Reminder sent successfully');
        loadData();
      } else {
        alert(data.error || 'Failed to send reminder');
      }
    } catch (err: any) {
      alert(err.message);
    }
    setSending(null);
  };

  const daysOverdue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.floor(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const totalOverdueAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.total),
    0
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Checking overdue invoices…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-coffee/60 text-sm mb-1.5">Follow-ups</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
            Reminders
          </h1>
          <p className="text-coffee/60 mt-2">
            Nudge clients to pay overdue invoices
          </p>
        </div>
        {invoices.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-coffee/60">Overdue</p>
              <p className="font-display text-2xl font-semibold text-coffee">
                {invoices.length}
              </p>
            </div>
            <div className="w-px h-10 bg-coffee/10" />
            <div>
              <p className="text-coffee/60">Total amount</p>
              <p className="font-display text-2xl font-semibold text-coffee">
                {invoices[0]
                  ? formatCurrency(
                      totalOverdueAmount,
                      invoices[0].currency || 'USD'
                    )
                  : '$0'}
              </p>
            </div>
          </div>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-sage/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2
              className="w-7 h-7 text-sage-deep"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-display text-2xl font-semibold text-coffee mb-2">
            All clear
          </h3>
          <p className="text-coffee/60 max-w-md mx-auto">
            No overdue invoices right now. Everything is on schedule.
          </p>
        </div>
      ) : (
        <>
          {/* Summary banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">
                {invoices.length} invoice{invoices.length > 1 ? 's' : ''} past
                due
              </p>
              <p className="text-sm text-red-700/80 mt-0.5">
                Send a polite reminder to help speed up collection.
              </p>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {invoices.map((inv) => {
              const days = daysOverdue(inv.due_date);
              return (
                <div
                  key={inv.id}
                  className="bg-cream-soft border border-coffee/5 hover:border-red-200 rounded-2xl p-5 lg:p-6 transition-all hover:shadow-md hover:shadow-coffee/5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
                        <Bell
                          className="w-4 h-4 text-red-600"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-display font-semibold text-coffee">
                            {inv.invoice_number}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            <Clock className="w-3 h-3" />
                            {days} {days === 1 ? 'day' : 'days'} overdue
                          </span>
                        </div>
                        <p className="text-sm text-coffee/70 truncate">
                          {inv.client_name} ·{' '}
                          <span className="text-coffee/50">
                            {inv.client_email}
                          </span>
                        </p>
                        <p className="text-sm mt-1.5">
                          <span className="font-display font-semibold text-coffee">
                            {formatCurrency(inv.total, inv.currency || 'USD')}
                          </span>
                          <span className="text-coffee/50">
                            {' · Due '}
                            {new Date(inv.due_date).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sendReminder(inv.id)}
                        disabled={sending === inv.id}
                        className="inline-flex items-center gap-2 bg-coffee text-cream px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-coffee-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending === inv.id ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            Send Reminder
                          </>
                        )}
                      </button>
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="p-2.5 text-coffee/60 hover:text-coffee hover:bg-cream rounded-xl transition-colors"
                        aria-label="View invoice"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}