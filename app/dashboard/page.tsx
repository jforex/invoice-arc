'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
  Settings,
  BarChart3,
  Users,
  Repeat,
  Bell
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: string;
  issue_date: string;
  due_date: string;
  created_at: string;
  currency?: string;
}

interface Stats {
  totalRevenue: number;
  invoicesSent: number;
  pendingAmount: number;
  paidThisMonth: number;
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, invoicesSent: 0, pendingAmount: 0, paidThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [recurringCount, setRecurringCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('default_currency')
        .limit(1)
        .single();

      if (company?.default_currency) setDefaultCurrency(company.default_currency);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesData) {
        setInvoices(invoicesData);
        const totalRevenue = invoicesData.reduce((sum, inv) => sum + inv.total, 0);
        const pendingAmount = invoicesData.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);
        const paidThisMonth = invoicesData.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
        const recurring = invoicesData.filter(inv => (inv as any).is_recurring && (inv as any).recurring_active).length;
        
        // Calculate overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = invoicesData.filter(inv => {
          if (inv.status === 'paid') return false;
          const dueDate = new Date(inv.due_date);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today;
        }).length;
        
        setRecurringCount(recurring);
        setOverdueCount(overdue);
        setStats({ totalRevenue, invoicesSent: invoicesData.length, pendingAmount, paidThisMonth });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(invoice.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><div className="text-lg text-gray-600">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inv</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/dashboard/invoices/create" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />Create Invoice
              </Link>
              <Link href="/reminders" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors relative" title="Reminders">
                <Bell className="w-5 h-5" />
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {overdueCount}
                  </span>
                )}
              </Link>
              <Link href="/recurring" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors relative" title="Recurring">
                <Repeat className="w-5 h-5" />
                {recurringCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {recurringCount}
                  </span>
                )}
              </Link>
              <Link href="/clients" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors" title="Clients">
                <Users className="w-5 h-5" />
              </Link>
              <Link href="/analytics" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors" title="Analytics">
                <BarChart3 className="w-5 h-5" />
              </Link>
              <Link href="/settings" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors" title="Settings">
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <Link href="/reminders" className="block mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">⚠️ You have {overdueCount} overdue {overdueCount === 1 ? 'invoice' : 'invoices'}</p>
                    <p className="text-sm text-red-700">Click here to send reminders</p>
                  </div>
                </div>
                <span className="text-red-600 font-medium text-sm">Manage Reminders →</span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-white" /></div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium"><TrendingUp className="w-4 h-4" /><span>23%</span></div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue, defaultCurrency)}</p>
            <p className="text-gray-500 text-sm mt-1">This month</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-white" /></div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium"><TrendingUp className="w-4 h-4" /><span>12%</span></div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Invoices Sent</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.invoicesSent}</p>
            <p className="text-gray-500 text-sm mt-1">{invoices.filter(i => i.status === 'paid').length} paid</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-white" /></div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Amount</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount, defaultCurrency)}</p>
            <p className="text-gray-500 text-sm mt-1">{invoices.filter(i => i.status === 'pending').length} invoices</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-white" /></div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Paid This Month</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.paidThisMonth, defaultCurrency)}</p>
            <p className="text-gray-500 text-sm mt-1">{invoices.filter(i => i.status === 'paid').length} invoices</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <div className="flex gap-2 flex-wrap">
              <Link href="/reminders" className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 relative">
                <Bell className="w-4 h-4" />Reminders
                {overdueCount > 0 && (<span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{overdueCount}</span>)}
              </Link>
              <Link href="/recurring" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2">
                <Repeat className="w-4 h-4" />Recurring
                {recurringCount > 0 && (<span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-0.5">{recurringCount}</span>)}
              </Link>
              <Link href="/clients" className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"><Users className="w-4 h-4" />Clients</Link>
              <Link href="/analytics" className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center gap-2"><BarChart3 className="w-4 h-4" />Analytics</Link>
              <Link href="/dashboard/invoices/create" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />New Invoice</Link>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600 mb-6">Create your first invoice to get started</p>
              <Link href="/dashboard/invoices/create" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"><Plus className="w-5 h-5" />Create Invoice</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3"><FileText className="w-5 h-5 text-blue-600" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              {invoice.invoice_number}
                              {(invoice as any).is_recurring && (<Repeat className="w-3 h-3 text-blue-500" />)}
                              {isOverdue(invoice) && (<Bell className="w-3 h-3 text-red-500" />)}
                            </div>
                            <div className="text-sm text-gray-500">{formatDate(invoice.issue_date)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{invoice.client_name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency || 'USD')}</div>
                        <div className="text-xs text-gray-500">{invoice.currency || 'USD'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isOverdue(invoice) ? 'bg-red-100 text-red-800' : getStatusColor(invoice.status)}`}>
                          {isOverdue(invoice) ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"><Eye className="w-4 h-4" />View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
