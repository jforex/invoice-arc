'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  Bell,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    invoicesSent: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [overdueCount, setOverdueCount] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || '');

    const { data: company } = await supabase
      .from('companies')
      .select('id, default_currency')
      .eq('user_id', user?.id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    if (company.default_currency) setDefaultCurrency(company.default_currency);

    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (invoicesData) {
      setInvoices(invoicesData);
      const totalRevenue = invoicesData.reduce((sum, inv) => sum + inv.total, 0);
      const pendingAmount = invoicesData
        .filter((inv) => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.total, 0);
      const paidThisMonth = invoicesData
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const overdue = invoicesData.filter((inv) => {
        if (inv.status === 'paid') return false;
        const dueDate = new Date(inv.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      }).length;

      setOverdueCount(overdue);
      setStats({
        totalRevenue,
        invoicesSent: invoicesData.length,
        pendingAmount,
        paidThisMonth,
      });
    }
    setLoading(false);
  };

  const isOverdue = (invoice: any) => {
    if (invoice.status === 'paid') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(invoice.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const statusBadge = (invoice: any) => {
    if (isOverdue(invoice)) {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    switch (invoice.status) {
      case 'paid':
        return 'bg-sage/40 text-sage-deep border border-sage-deep/20';
      case 'pending':
        return 'bg-amber/30 text-amber-deep border border-amber-deep/20';
      default:
        return 'bg-coffee/10 text-coffee/70 border border-coffee/15';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading your workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-coffee/60 text-sm mb-1.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
            Welcome back
          </h1>
        </div>
        <Link
          href="/dashboard/invoices/create"
          className="group hidden sm:inline-flex items-center gap-2 bg-coffee text-cream px-5 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <Link href="/dashboard/reminders" className="block mb-8">
          <div className="group bg-red-50 border border-red-200 rounded-2xl p-5 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">
                    {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-700/80">
                    Send a reminder to get paid faster
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Total Revenue — featured dark card */}
        <div className="bg-coffee text-cream rounded-2xl p-6 lg:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 bg-cream/10 rounded-xl flex items-center justify-center mb-5">
              <DollarSign className="w-4 h-4 text-cream" strokeWidth={1.75} />
            </div>
            <p className="text-cream/60 text-sm mb-2">Total Revenue</p>
            <p className="font-display text-3xl lg:text-4xl font-semibold">
              {formatCurrency(stats.totalRevenue, defaultCurrency)}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-tan text-xs">
              <TrendingUp className="w-3 h-3" />
              All-time
            </div>
          </div>
        </div>

        <StatCard
          icon={FileText}
          label="Invoices Sent"
          value={stats.invoicesSent.toString()}
          hint="Total"
        />
        <StatCard
          icon={Clock}
          label="Pending Amount"
          value={formatCurrency(stats.pendingAmount, defaultCurrency)}
          hint="Awaiting payment"
        />
        <StatCard
          icon={CheckCircle}
          label="Paid This Month"
          value={formatCurrency(stats.paidThisMonth, defaultCurrency)}
          hint="Collected"
        />
      </div>

      {/* Recent Invoices */}
      <div className="bg-cream-soft rounded-3xl border border-coffee/5 overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-coffee/5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-coffee">
            Recent Invoices
          </h2>
          {invoices.length > 0 && (
            <span className="text-sm text-coffee/60">
              {invoices.length} total
            </span>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="w-16 h-16 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-6 h-6 text-coffee" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold text-coffee mb-2">
              No invoices yet
            </h3>
            <p className="text-coffee/60 mb-6 max-w-sm mx-auto">
              Create your first invoice and start getting paid in USDC.
            </p>
            <Link
              href="/dashboard/invoices/create"
              className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-coffee/50 uppercase tracking-wider border-b border-coffee/5">
                  <th className="px-6 lg:px-8 py-4">Invoice</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 lg:px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee/5">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-cream/60 transition-colors"
                  >
                    <td className="px-6 lg:px-8 py-5">
                      <p className="font-medium text-coffee">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-xs text-coffee/50 mt-0.5">
                        {formatDate(invoice.issue_date)}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-coffee">
                      {invoice.client_name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-display font-semibold text-coffee">
                        {formatCurrency(
                          invoice.total,
                          invoice.currency || 'USD'
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(
                          invoice
                        )}`}
                      >
                        {isOverdue(invoice)
                          ? 'Overdue'
                          : invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-coffee/70">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-right">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1.5 text-sm text-coffee/70 hover:text-coffee transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile floating CTA */}
      <Link
        href="/dashboard/invoices/create"
        className="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-coffee text-cream rounded-full flex items-center justify-center shadow-xl shadow-coffee/30"
        aria-label="Create invoice"
      >
        <Plus className="w-5 h-5" />
      </Link>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-cream-soft rounded-2xl border border-coffee/5 p-6 lg:p-7 hover:border-coffee/15 hover:shadow-lg hover:shadow-coffee/5 transition-all">
      <div className="w-10 h-10 bg-tan-soft rounded-xl flex items-center justify-center mb-5">
        <Icon className="w-4 h-4 text-coffee" strokeWidth={1.75} />
      </div>
      <p className="text-coffee/60 text-sm mb-2">{label}</p>
      <p className="font-display text-3xl lg:text-4xl font-semibold text-coffee">
        {value}
      </p>
      <p className="text-xs text-coffee/50 mt-2">{hint}</p>
    </div>
  );
}