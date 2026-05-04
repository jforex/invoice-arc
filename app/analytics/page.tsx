'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrency } from '@/lib/currency';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  ArrowLeft,
  Calendar,
  Award,
  LineChart as LineChartIcon,
  BarChart3,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  total: number;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string;
  created_at: string;
}

interface Stats {
  totalRevenue: number;
  totalInvoices: number;
  averageInvoice: number;
  uniqueClients: number;
  paidCount: number;
  pendingCount: number;
}

type TimeFilter = '7d' | '30d' | '90d' | 'all';
type ChartType = 'line' | 'bar';

export default function AnalyticsPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalInvoices: 0,
    averageInvoice: 0,
    uniqueClients: 0,
    paidCount: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterByTime();
  }, [timeFilter, invoices]);

  const loadData = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('default_currency')
        .limit(1)
        .single();

      if (company?.default_currency) {
        setDefaultCurrency(company.default_currency);
      }

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesData) {
        setInvoices(invoicesData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const filterByTime = () => {
    const now = new Date();
    let filtered = invoices;

    if (timeFilter !== 'all') {
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = invoices.filter((inv) => new Date(inv.created_at) >= cutoff);
    }

    setFilteredInvoices(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data: Invoice[]) => {
    const totalRevenue = data.reduce((sum, inv) => sum + inv.total, 0);
    const uniqueClients = new Set(data.map((inv) => inv.client_email)).size;
    const paidCount = data.filter((inv) => inv.status === 'paid').length;
    const pendingCount = data.filter((inv) => inv.status === 'pending').length;
    const averageInvoice = data.length > 0 ? totalRevenue / data.length : 0;

    setStats({
      totalRevenue,
      totalInvoices: data.length,
      averageInvoice,
      uniqueClients,
      paidCount,
      pendingCount,
    });
  };

  // Tooltip formatter helper - handles type safety
  const tooltipFormatter = (value: any): string => {
    return formatCurrency(Number(value) || 0, defaultCurrency);
  };

  const getRevenueByDate = () => {
    const grouped: { [key: string]: number } = {};
    
    filteredInvoices.forEach((inv) => {
      const date = new Date(inv.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      grouped[date] = (grouped[date] || 0) + inv.total;
    });

    return Object.entries(grouped)
      .map(([date, revenue]) => ({ date, revenue }))
      .reverse();
  };

  const getStatusData = () => {
    const paid = filteredInvoices.filter((inv) => inv.status === 'paid').length;
    const pending = filteredInvoices.filter((inv) => inv.status === 'pending').length;
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
    ].filter((item) => item.value > 0);
  };

  const getCurrencyData = () => {
    const grouped: { [key: string]: { count: number; total: number } } = {};
    
    filteredInvoices.forEach((inv) => {
      const curr = inv.currency || 'USD';
      if (!grouped[curr]) {
        grouped[curr] = { count: 0, total: 0 };
      }
      grouped[curr].count += 1;
      grouped[curr].total += inv.total;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    
    return Object.entries(grouped).map(([currency, data], index) => ({
      name: `${getCurrency(currency).flag} ${currency}`,
      value: data.count,
      color: colors[index % colors.length],
    }));
  };

  const getTopClients = () => {
    const clients: { [key: string]: { name: string; total: number; count: number } } = {};
    
    filteredInvoices.forEach((inv) => {
      if (!clients[inv.client_email]) {
        clients[inv.client_email] = {
          name: inv.client_name,
          total: 0,
          count: 0,
        };
      }
      clients[inv.client_email].total += inv.total;
      clients[inv.client_email].count += 1;
    });

    return Object.entries(clients)
      .map(([email, data]) => ({
        email,
        name: data.name,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const revenueData = getRevenueByDate();
  const statusData = getStatusData();
  const currencyData = getCurrencyData();
  const topClients = getTopClients();
  const hasData = filteredInvoices.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
              <p className="text-gray-600 mt-1">Insights into your business performance</p>
            </div>
            
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
              {(['7d', '30d', '90d', 'all'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter === '7d' && '7 Days'}
                  {filter === '30d' && '30 Days'}
                  {filter === '90d' && '90 Days'}
                  {filter === 'all' && 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h2>
            <p className="text-gray-600 mb-6">
              Create some invoices to see insights and analytics here.
            </p>
            <button
              onClick={() => router.push('/dashboard/invoices/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create First Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue, defaultCurrency)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Invoices</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {stats.paidCount} paid · {stats.pendingCount} pending
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Average Invoice</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageInvoice, defaultCurrency)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Unique Clients</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueClients}</p>
              </div>
            </div>

            {/* Revenue Chart with Type Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                  <p className="text-sm text-gray-500 mt-1">Daily revenue over time</p>
                </div>
                
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      chartType === 'bar'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      chartType === 'line'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                    Line
                  </button>
                </div>
              </div>
              
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'bar' ? (
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        formatter={tooltipFormatter}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        formatter={tooltipFormatter}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">No revenue data for this period</div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Status</h2>
                <p className="text-sm text-gray-500 mb-6">Breakdown of paid vs pending</p>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">By Currency</h2>
                <p className="text-sm text-gray-500 mb-6">Invoices grouped by currency</p>
                {currencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={currencyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {currencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">No data available</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Top Clients</h2>
                  <p className="text-sm text-gray-500 mt-1">Your highest paying clients</p>
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              {topClients.length > 0 ? (
                <div className="space-y-3">
                  {topClients.map((client, index) => (
                    <div
                      key={client.email}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? 'bg-yellow-500'
                              : index === 1
                              ? 'bg-gray-400'
                              : index === 2
                              ? 'bg-orange-600'
                              : 'bg-blue-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(client.total, defaultCurrency)}
                        </p>
                        <p className="text-sm text-gray-500">{client.count} invoices</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No clients yet</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
