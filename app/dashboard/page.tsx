import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle2,
  Plus,
  ArrowRight,
  Eye,
  Send,
  AlertCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

// Fetch real data from Supabase
async function getStats() {
  const { data: invoices } = await supabase.from('invoices').select('total, status');
  
  const paid = invoices?.filter(inv => inv.status === 'paid') || [];
  const pending = invoices?.filter(inv => inv.status === 'pending') || [];
  
  return {
    totalRevenue: paid.reduce((sum, inv) => sum + Number(inv.total), 0) || 0,
    invoicesSent: invoices?.length || 0,
    paidCount: paid.length || 0,
    pendingCount: pending.length || 0,
    pendingAmount: pending.reduce((sum, inv) => sum + Number(inv.total), 0) || 0
  };
}

async function getRecentInvoices() {
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  return data || [];
}

async function getActivity() {
  const { data } = await supabase
    .from('activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  return data || [];
}

// Mock chart data (we'll make this dynamic later)
const chartData = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 1800 },
  { day: 'Wed', amount: 1400 },
  { day: 'Thu', amount: 2200 },
  { day: 'Fri', amount: 2800 },
  { day: 'Sat', amount: 1600 },
  { day: 'Sun', amount: 1500 }
];

function StatCard({ 
  title, 
  value, 
  trend, 
  subtitle,
  icon: Icon,
  color = 'blue' 
}: { 
  title: string;
  value: string | number;
  trend?: number;
  subtitle?: string;
  icon: any;
  color?: 'blue' | 'green' | 'orange' | 'amber';
}) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: typeof chartData }) {
  const max = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-600">Last 7 days</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          This Week
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((item, idx) => {
          const height = (item.amount / max) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative flex-1 flex items-end w-full">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityFeed({ activities }: { activities: any[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'view': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-600" />;
      case 'created': return <FileText className="w-4 h-4 text-gray-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityText = (activity: any) => {
    const amount = activity.amount ? `$${Number(activity.amount).toLocaleString()}` : '';
    
    switch (activity.type) {
      case 'payment':
        return <><span className="font-semibold text-gray-900">{activity.client_name}</span> paid <span className="font-semibold text-emerald-600">{amount}</span></>;
      case 'view':
        return <><span className="font-semibold text-gray-900">{activity.client_name}</span> viewed <span className="font-semibold">{activity.invoice_number}</span></>;
      case 'sent':
        return <>Sent <span className="font-semibold">{activity.invoice_number}</span> to <span className="font-semibold text-gray-900">{activity.client_name}</span></>;
      case 'created':
        return <>Created <span className="font-semibold">{activity.invoice_number}</span> for <span className="font-semibold text-gray-900">{activity.client_name}</span></>;
      case 'overdue':
        return <><span className="font-semibold text-red-600">{activity.invoice_number}</span> from <span className="font-semibold text-gray-900">{activity.client_name}</span> is overdue</>;
      default:
        return activity.client_name;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No activity yet. Create your first invoice!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            <div className="mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(activity.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceTable({ invoices }: { invoices: any[] }) {
  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      overdue: 'bg-red-50 text-red-700 border-red-200',
      draft: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
            <Link
              href="/dashboard/invoices/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-600 mb-6">Create your first invoice to get started</p>
          <Link
            href="/dashboard/invoices/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
          <Link
            href="/dashboard/invoices/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{invoice.client_name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">${Number(invoice.total).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: Zap, label: '10-Second Settlement', color: 'from-blue-500 to-blue-600', desc: 'Instant USDC payments' },
    { icon: Shield, label: 'Blockchain Verified', color: 'from-emerald-500 to-emerald-600', desc: 'Every invoice protected' },
    { icon: Globe, label: 'Global Payments', color: 'from-amber-500 to-amber-600', desc: 'No conversion fees' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <div 
          key={idx}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{action.label}</h4>
          <p className="text-sm text-gray-600">{action.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default async function Dashboard() {
  const stats = await getStats();
  const invoices = await getRecentInvoices();
  const activities = await getActivity();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Inv
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <Link
              href="/dashboard/invoices/create"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            trend={23}
            subtitle="This month"
            icon={DollarSign}
            color="blue"
          />
          <StatCard
            title="Invoices Sent"
            value={stats.invoicesSent}
            trend={12}
            subtitle={`${stats.paidCount} paid`}
            icon={FileText}
            color="green"
          />
          <StatCard
            title="Pending Amount"
            value={`$${stats.pendingAmount.toLocaleString()}`}
            subtitle={`${stats.pendingCount} invoices`}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Paid This Month"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            subtitle={`${stats.paidCount} invoices`}
            icon={CheckCircle2}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Chart & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MiniChart data={chartData} />
          </div>
          <div>
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
