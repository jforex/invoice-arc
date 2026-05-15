'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Crown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

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
      .select('id, default_currency')
      .eq('user_id', user.id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    if (company.default_currency) setDefaultCurrency(company.default_currency);

    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id);

    if (invoicesData) setInvoices(invoicesData);
    setLoading(false);
  };

  const getMonthlyRevenue = () => {
    const months: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        const date = new Date(inv.paid_at || inv.created_at);
        const key = `${date.toLocaleString('default', {
          month: 'short',
        })} ${date.getFullYear()}`;
        months[key] = (months[key] || 0) + Number(inv.total);
      }
    });
    return Object.entries(months).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  };

  const getTopClients = () => {
    const clients: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        clients[inv.client_name] =
          (clients[inv.client_name] || 0) + Number(inv.total);
      }
    });
    return Object.entries(clients)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const totalRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.total), 0);
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const pendingCount = invoices.filter((i) => i.status === 'pending').length;
  const avgInvoice = paidCount > 0 ? totalRevenue / paidCount : 0;
  const totalClients = new Set(invoices.map((i) => i.client_name)).size;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Crunching the numbers…</span>
        </div>
      </div>
    );
  }

  const monthlyData = getMonthlyRevenue();
  const topClients = getTopClients();
  const maxClient = topClients[0]?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">Performance</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Analytics
        </h1>
        <p className="text-coffee/60 mt-2">
          Track your revenue, clients, and invoice activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Featured dark card */}
        <div className="bg-coffee text-cream rounded-2xl p-6 relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 bg-cream/10 rounded-xl flex items-center justify-center mb-5">
              <TrendingUp
                className="w-4 h-4 text-cream"
                strokeWidth={1.75}
              />
            </div>
            <p className="text-cream/60 text-sm mb-2">Total Revenue</p>
            <p className="font-display text-3xl lg:text-4xl font-semibold">
              {formatCurrency(totalRevenue, defaultCurrency)}
            </p>
            <p className="text-tan text-xs mt-2">All-time paid</p>
          </div>
        </div>

        <StatCard
          icon={FileText}
          label="Paid Invoices"
          value={paidCount.toString()}
          hint="Total settled"
        />
        <StatCard
          icon={BarChart3}
          label="Pending"
          value={pendingCount.toString()}
          hint="Awaiting payment"
        />
        <StatCard
          icon={Users}
          label="Avg Invoice"
          value={formatCurrency(avgInvoice, defaultCurrency)}
          hint={`Across ${totalClients} ${
            totalClients === 1 ? 'client' : 'clients'
          }`}
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="font-display text-xl font-semibold text-coffee">
              Monthly Revenue
            </h2>
            <p className="text-coffee/60 text-sm mt-0.5">
              Paid invoices grouped by month
            </p>
          </div>
          <div className="inline-flex bg-cream border border-coffee/5 rounded-full p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                chartType === 'bar'
                  ? 'bg-coffee text-cream'
                  : 'text-coffee/60 hover:text-coffee'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                chartType === 'line'
                  ? 'bg-coffee text-cream'
                  : 'text-coffee/60 hover:text-coffee'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {monthlyData.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-5 h-5 text-coffee" strokeWidth={1.5} />
            </div>
            <p className="text-coffee/60">No revenue data yet</p>
            <p className="text-coffee/50 text-sm mt-1">
              Get paid on an invoice to see it here
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'bar' ? (
              <BarChart
                data={monthlyData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3d2817"
                  strokeOpacity={0.08}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#3d2817"
                  strokeOpacity={0.4}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#3d2817"
                  strokeOpacity={0.4}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#3d2817',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f5efe6',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#e8d5b7' }}
                  cursor={{ fill: '#3d2817', fillOpacity: 0.05 }}
                  formatter={(value: any) => [
                    formatCurrency(Number(value), defaultCurrency),
                    'Revenue',
                  ]}
                />
                <Bar dataKey="revenue" fill="#3d2817" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart
                data={monthlyData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3d2817"
                  strokeOpacity={0.08}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#3d2817"
                  strokeOpacity={0.4}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#3d2817"
                  strokeOpacity={0.4}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#3d2817',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#f5efe6',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#e8d5b7' }}
                  cursor={{ stroke: '#3d2817', strokeOpacity: 0.2 }}
                  formatter={(value: any) => [
                    formatCurrency(Number(value), defaultCurrency),
                    'Revenue',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3d2817"
                  strokeWidth={2.5}
                  dot={{ fill: '#3d2817', r: 4 }}
                  activeDot={{ r: 6, fill: '#c89968' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Top clients */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
        <div className="mb-7">
          <h2 className="font-display text-xl font-semibold text-coffee">
            Top Clients
          </h2>
          <p className="text-coffee/60 text-sm mt-0.5">
            Your highest-paying clients by total revenue
          </p>
        </div>

        {topClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-5 h-5 text-coffee" strokeWidth={1.5} />
            </div>
            <p className="text-coffee/60">No paid invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topClients.map((client, idx) => {
              const percent = maxClient > 0 ? (client.total / maxClient) * 100 : 0;
              const isTop = idx === 0;
              return (
                <div
                  key={idx}
                  className="relative bg-cream rounded-2xl p-5 overflow-hidden group hover:shadow-md hover:shadow-coffee/5 transition-shadow"
                >
                  {/* Bar fill */}
                  <div
                    className="absolute inset-y-0 left-0 bg-tan/30 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-sm ${
                          isTop
                            ? 'bg-coffee text-cream'
                            : 'bg-cream-deep text-coffee'
                        }`}
                      >
                        {isTop ? (
                          <Crown className="w-4 h-4" strokeWidth={2} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className="font-medium text-coffee truncate">
                        {client.name}
                      </span>
                    </div>
                    <span className="font-display font-semibold text-coffee whitespace-nowrap">
                      {formatCurrency(client.total, defaultCurrency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    <div className="bg-cream-soft rounded-2xl border border-coffee/5 p-6 hover:border-coffee/15 hover:shadow-md hover:shadow-coffee/5 transition-all">
      <div className="w-10 h-10 bg-tan-soft rounded-xl flex items-center justify-center mb-5">
        <Icon className="w-4 h-4 text-coffee" strokeWidth={1.75} />
      </div>
      <p className="text-coffee/60 text-sm mb-2">{label}</p>
      <p className="font-display text-2xl lg:text-3xl font-semibold text-coffee">
        {value}
      </p>
      <p className="text-xs text-coffee/50 mt-2">{hint}</p>
    </div>
  );
}