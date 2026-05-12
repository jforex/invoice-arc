'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, BarChart3, TrendingUp, Users, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const { data: { user } } = await supabase.auth.getUser();
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
        const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        months[key] = (months[key] || 0) + Number(inv.total);
      }
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  };

  const getTopClients = () => {
    const clients: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        clients[inv.client_name] = (clients[inv.client_name] || 0) + Number(inv.total);
      }
    });
    return Object.entries(clients)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const avgInvoice = paidCount > 0 ? totalRevenue / paidCount : 0;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const monthlyData = getMonthlyRevenue();
  const topClients = getTopClients();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue, defaultCurrency)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-gray-600 text-sm">Paid Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <p className="text-gray-600 text-sm">Avg Invoice</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgInvoice, defaultCurrency)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
            <div className="flex gap-2">
              <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Bar</button>
              <button onClick={() => setChartType('line')} className={`px-4 py-2 rounded-lg ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Line</button>
            </div>
          </div>
          {monthlyData.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value), defaultCurrency)} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              ) : (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value), defaultCurrency)} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Clients</h2>
          {topClients.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No paid invoices yet</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                    <span className="font-medium text-gray-900">{client.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(client.total, defaultCurrency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
