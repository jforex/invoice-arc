'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import { 
  DollarSign, FileText, Clock, CheckCircle, TrendingUp, Plus, Eye, Settings, 
  BarChart3, Users, Repeat, Bell, LogOut, Wallet
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, invoicesSent: 0, pendingAmount: 0, paidThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [recurringCount, setRecurringCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
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
      const pendingAmount = invoicesData.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);
      const paidThisMonth = invoicesData.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
      const recurring = invoicesData.filter(inv => inv.is_recurring && inv.recurring_active).length;
      
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
    setLoading(false);
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (invoice: any) => {
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
              <p className="text-gray-600 mt-1">{userEmail}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/dashboard/invoices/create" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-5 h-5" />Create Invoice
              </Link>
              <Link href="/wallet" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50" title="Wallet">
                <Wallet className="w-5 h-5" />
              </Link>
              <Link href="/reminders" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 relative" title="Reminders">
                <Bell className="w-5 h-5" />
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {overdueCount}
                  </span>
                )}
              </Link>
              <Link href="/recurring" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 relative" title="Recurring">
                <Repeat className="w-5 h-5" />
                {recurringCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {recurringCount}
                  </span>
                )}
              </Link>
              <Link href="/clients" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50" title="Clients">
                <Users className="w-5 h-5" />
              </Link>
              <Link href="/analytics" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50" title="Analytics">
                <BarChart3 className="w-5 h-5" />
              </Link>
              <Link href="/settings" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50" title="Settings">
                <Settings className="w-5 h-5" />
              </Link>
              <button onClick={handleSignOut} className="p-3 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600" title="Sign Out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {overdueCount > 0 && (
          <Link href="/reminders" className="block mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-900">⚠️ You have {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}</p>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue, defaultCurrency)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Invoices Sent</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.invoicesSent}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Pending Amount</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount, defaultCurrency)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Paid This Month</h3>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.paidThisMonth, defaultCurrency)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
          </div>

          {invoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <Link href="/dashboard/invoices/create" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                <Plus className="w-5 h-5" />Create Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-sm text-gray-500">{formatDate(invoice.issue_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency || 'USD')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${isOverdue(invoice) ? 'bg-red-100 text-red-800' : getStatusColor(invoice.status)}`}>
                          {isOverdue(invoice) ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(invoice.due_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          <Eye className="w-4 h-4" />View
                        </Link>
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
