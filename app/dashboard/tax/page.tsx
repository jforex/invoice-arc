'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  Save,
  Download,
  AlertCircle,
} from 'lucide-react';

export default function TaxPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [taxCountry, setTaxCountry] = useState('');

  const [year, setYear] = useState(new Date().getFullYear());
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState<any[]>([]);
  const [expenseList, setExpenseList] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id, default_currency, tax_rate_estimate, tax_country')
      .eq('user_id', user.id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    setCompanyId(company.id);
    if (company.default_currency) setDefaultCurrency(company.default_currency);
    setTaxRate(company.tax_rate_estimate || 0);
    setTaxCountry(company.tax_country || '');

    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    // Get paid invoices for the year
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total, paid_at, invoice_number, client_name')
      .eq('company_id', company.id)
      .eq('status', 'paid')
      .gte('paid_at', yearStart)
      .lte('paid_at', yearEnd + 'T23:59:59');

    if (invoices) {
      setPaidInvoices(invoices);
      const totalRev = invoices.reduce((sum, i) => sum + Number(i.total), 0);
      setRevenue(totalRev);
    }

    // Get expenses for the year
    const { data: exp } = await supabase
      .from('expenses')
      .select('amount, expense_date, description, expense_categories(name)')
      .eq('company_id', company.id)
      .gte('expense_date', yearStart)
      .lte('expense_date', yearEnd);

    if (exp) {
      setExpenseList(exp);
      const totalExp = exp.reduce((sum, e) => sum + Number(e.amount), 0);
      setExpenses(totalExp);
    }

    setLoading(false);
  };

  const handleSaveTaxSettings = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('companies')
      .update({
        tax_rate_estimate: taxRate,
        tax_country: taxCountry,
      })
      .eq('id', companyId);
    setSaving(false);
    alert('Tax settings saved');
  };

  const exportCSV = () => {
    const rows = [
      ['Type', 'Date', 'Description', 'Category', 'Amount'],
      ...paidInvoices.map((i) => [
        'Revenue',
        i.paid_at?.split('T')[0] || '',
        `Invoice ${i.invoice_number} - ${i.client_name}`,
        'Invoice',
        i.total.toString(),
      ]),
      ...expenseList.map((e) => [
        'Expense',
        e.expense_date,
        e.description,
        e.expense_categories?.name || 'Uncategorized',
        `-${e.amount}`,
      ]),
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invflow-${year}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const netIncome = revenue - expenses;
  const estimatedTax = netIncome > 0 ? netIncome * (taxRate / 100) : 0;
  const afterTax = netIncome - estimatedTax;

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading tax data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">Bookkeeping</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Tax & Reports
        </h1>
        <p className="text-coffee/60 mt-2">
          Track your profitability and estimate tax obligations
        </p>
      </div>

      {/* Year filter + Export */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-coffee/60">Year:</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-cream-soft border border-coffee/10 rounded-xl text-coffee text-sm"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-cream-soft border border-coffee/10 hover:bg-tan-soft text-coffee px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={formatCurrency(revenue, defaultCurrency)}
          hint={`${paidInvoices.length} paid invoices`}
          color="sage"
        />
        <StatCard
          icon={TrendingDown}
          label="Expenses"
          value={formatCurrency(expenses, defaultCurrency)}
          hint={`${expenseList.length} entries`}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label="Net Income"
          value={formatCurrency(netIncome, defaultCurrency)}
          hint={netIncome > 0 ? 'Profit' : 'Loss'}
          highlight
        />
        <StatCard
          icon={Percent}
          label="Estimated Tax"
          value={formatCurrency(estimatedTax, defaultCurrency)}
          hint={`at ${taxRate}%`}
          color="tan"
        />
      </div>

      {/* Profit summary card */}
      <div className="bg-coffee text-cream rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <p className="text-cream/60 text-sm uppercase tracking-wider mb-1">
            {year} After-Tax Profit
          </p>
          <p className="font-display text-5xl lg:text-6xl font-semibold mb-6">
            {formatCurrency(afterTax, defaultCurrency)}
          </p>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-cream/10">
            <div>
              <p className="text-cream/60 text-xs mb-1">Revenue</p>
              <p className="font-display text-xl font-semibold">
                +{formatCurrency(revenue, defaultCurrency)}
              </p>
            </div>
            <div>
              <p className="text-cream/60 text-xs mb-1">Expenses</p>
              <p className="font-display text-xl font-semibold">
                -{formatCurrency(expenses, defaultCurrency)}
              </p>
            </div>
            <div>
              <p className="text-cream/60 text-xs mb-1">Tax ({taxRate}%)</p>
              <p className="font-display text-xl font-semibold">
                -{formatCurrency(estimatedTax, defaultCurrency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax settings */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8 mb-8">
        <h2 className="font-display text-xl font-semibold text-coffee mb-1">
          Tax Settings
        </h2>
        <p className="text-sm text-coffee/60 mb-6">
          Configure your estimated tax rate. Used for tax calculations only - not actual tax advice.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-coffee mb-2">
              Estimated Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-cream border border-coffee/10 rounded-xl text-coffee focus:outline-none focus:border-coffee transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee mb-2">
              Country / Region (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Nigeria, USA"
              value={taxCountry}
              onChange={(e) => setTaxCountry(e.target.value)}
              className="w-full px-4 py-3 bg-cream border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 bg-amber/15 border border-amber-deep/20 rounded-2xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-coffee/80 leading-relaxed">
            This is a rough estimate to help you set aside funds. Always consult a tax professional for accurate filing.
          </p>
        </div>

        <button
          onClick={handleSaveTaxSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-coffee text-cream px-5 py-3 rounded-xl font-medium hover:bg-coffee-deep transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Tax Settings'}
        </button>
      </div>

      {/* Quarterly breakdown */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
        <h2 className="font-display text-xl font-semibold text-coffee mb-6">
          Quarterly Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((q) => {
            const qStart = (q - 1) * 3 + 1;
            const qEnd = q * 3;
            const qRevenue = paidInvoices
              .filter((i) => {
                const m = new Date(i.paid_at).getMonth() + 1;
                return m >= qStart && m <= qEnd;
              })
              .reduce((sum, i) => sum + Number(i.total), 0);
            const qExpenses = expenseList
              .filter((e) => {
                const m = new Date(e.expense_date).getMonth() + 1;
                return m >= qStart && m <= qEnd;
              })
              .reduce((sum, e) => sum + Number(e.amount), 0);
            const qNet = qRevenue - qExpenses;
            const qTax = qNet > 0 ? qNet * (taxRate / 100) : 0;

            return (
              <div
                key={q}
                className="bg-cream border border-coffee/5 rounded-2xl p-5"
              >
                <p className="text-xs uppercase tracking-wider text-coffee/50 mb-2">
                  Q{q} {year}
                </p>
                <p className="font-display text-2xl font-semibold text-coffee mb-3">
                  {formatCurrency(qNet, defaultCurrency)}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-coffee/60">
                    <span>Revenue</span>
                    <span>+{formatCurrency(qRevenue, defaultCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-coffee/60">
                    <span>Expenses</span>
                    <span>-{formatCurrency(qExpenses, defaultCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-amber-deep font-medium pt-1 border-t border-coffee/5">
                    <span>Est. Tax</span>
                    <span>{formatCurrency(qTax, defaultCurrency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = 'tan',
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  color?: string;
  highlight?: boolean;
}) {
  const iconBg =
    color === 'sage'
      ? 'bg-sage/30 text-sage-deep'
      : color === 'amber'
      ? 'bg-amber/30 text-amber-deep'
      : 'bg-tan-soft text-coffee';

  return (
    <div
      className={`${
        highlight
          ? 'bg-coffee text-cream'
          : 'bg-cream-soft border border-coffee/5'
      } rounded-2xl p-6 lg:p-7`}
    >
      <div
        className={`w-10 h-10 ${
          highlight ? 'bg-cream/10' : iconBg
        } rounded-xl flex items-center justify-center mb-5`}
      >
        <Icon
          className={`w-4 h-4 ${highlight ? 'text-cream' : ''}`}
          strokeWidth={1.75}
        />
      </div>
      <p className={`text-sm mb-2 ${highlight ? 'text-cream/60' : 'text-coffee/60'}`}>
        {label}
      </p>
      <p
        className={`font-display text-2xl lg:text-3xl font-semibold ${
          highlight ? '' : 'text-coffee'
        }`}
      >
        {value}
      </p>
      <p
        className={`text-xs mt-2 ${highlight ? 'text-cream/60' : 'text-coffee/50'}`}
      >
        {hint}
      </p>
    </div>
  );
}
