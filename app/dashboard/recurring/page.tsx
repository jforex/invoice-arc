'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import { Repeat, Pause, Play, Calendar, ArrowUpRight } from 'lucide-react';

export default function RecurringPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_recurring', true)
      .order('created_at', { ascending: false });

    if (data) setInvoices(data);
    setLoading(false);
  };

  const togglePause = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase
      .from('invoices')
      .update({ recurring_active: !current })
      .eq('id', id);
    loadData();
  };

  const activeCount = invoices.filter((i) => i.recurring_active).length;
  const pausedCount = invoices.filter((i) => !i.recurring_active).length;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading recurring invoices…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-coffee/60 text-sm mb-1.5">Automation</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
            Recurring Invoices
          </h1>
          <p className="text-coffee/60 mt-2">
            Set it once and get paid on schedule
          </p>
        </div>
        {invoices.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-coffee/60">Active</p>
              <p className="font-display text-2xl font-semibold text-coffee">
                {activeCount}
              </p>
            </div>
            <div className="w-px h-10 bg-coffee/10" />
            <div>
              <p className="text-coffee/60">Paused</p>
              <p className="font-display text-2xl font-semibold text-coffee">
                {pausedCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Repeat className="w-6 h-6 text-coffee" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold text-coffee mb-2">
            No recurring invoices yet
          </h3>
          <p className="text-coffee/60 mb-6 max-w-md mx-auto">
            When creating an invoice, mark it as recurring to automate billing
            on a weekly, monthly, or custom schedule.
          </p>
          <Link
            href="/dashboard/invoices/create"
            className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all"
          >
            Create Invoice
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="group bg-cream-soft border border-coffee/5 hover:border-coffee/15 rounded-2xl p-5 lg:p-6 transition-all hover:shadow-md hover:shadow-coffee/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left: invoice info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      inv.recurring_active
                        ? 'bg-coffee text-cream'
                        : 'bg-cream-deep text-coffee/50'
                    }`}
                  >
                    <Repeat className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-coffee">
                        {inv.invoice_number}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          inv.recurring_active
                            ? 'bg-sage/40 text-sage-deep border border-sage-deep/20'
                            : 'bg-coffee/10 text-coffee/70 border border-coffee/15'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.recurring_active
                              ? 'bg-sage-deep animate-pulse-dot'
                              : 'bg-coffee/40'
                          }`}
                        />
                        {inv.recurring_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-sm text-coffee/70">
                      {inv.client_name} ·{' '}
                      <span className="font-medium text-coffee">
                        {formatCurrency(inv.total, inv.currency || 'USD')}
                      </span>
                    </p>
                    <p className="text-xs text-coffee/50 mt-1 flex items-center gap-1.5 capitalize">
                      <Calendar className="w-3 h-3" />
                      {inv.recurring_frequency}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      togglePause(inv.id, inv.recurring_active)
                    }
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      inv.recurring_active
                        ? 'bg-cream hover:bg-tan-soft text-coffee'
                        : 'bg-coffee text-cream hover:bg-coffee-deep'
                    }`}
                  >
                    {inv.recurring_active ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Resume
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
          ))}
        </div>
      )}
    </div>
  );
}