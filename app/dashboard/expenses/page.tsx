'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  Plus,
  Trash2,
  Receipt,
  TrendingDown,
  Calendar,
  Tag,
  X,
  Edit2,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { name: 'Software & Tools', color: '#c89968' },
  { name: 'Marketing', color: '#e8c068' },
  { name: 'Travel', color: '#c8d5b9' },
  { name: 'Office', color: '#e8d5b7' },
  { name: 'Professional Services', color: '#6b8e5f' },
  { name: 'Equipment', color: '#b8862f' },
  { name: 'Other', color: '#3d2817' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState('all');

  const [form, setForm] = useState({
    description: '',
    amount: 0,
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

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

    setCompanyId(company.id);
    if (company.default_currency) setDefaultCurrency(company.default_currency);

    // Load categories - create defaults if none exist
    let { data: cats } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('company_id', company.id);

    if (!cats || cats.length === 0) {
      // Create default categories
      const defaultCats = DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        company_id: company.id,
        is_default: true,
      }));
      const { data: newCats } = await supabase
        .from('expense_categories')
        .insert(defaultCats)
        .select();
      cats = newCats || [];
    }
    setCategories(cats || []);

    // Load expenses
    const { data: exp } = await supabase
      .from('expenses')
      .select('*, expense_categories(name, color)')
      .eq('company_id', company.id)
      .order('expense_date', { ascending: false });

    if (exp) setExpenses(exp);
    setLoading(false);
  };

  const handleSave = async () => {
    const supabase = createClient();
    if (editing) {
      await supabase
        .from('expenses')
        .update({
          ...form,
          currency: defaultCurrency,
        })
        .eq('id', editing.id);
    } else {
      await supabase.from('expenses').insert({
        ...form,
        company_id: companyId,
        currency: defaultCurrency,
        category_id: form.category_id || null,
      });
    }
    setShowModal(false);
    setEditing(null);
    setForm({
      description: '',
      amount: 0,
      category_id: '',
      expense_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const supabase = createClient();
    await supabase.from('expenses').delete().eq('id', id);
    loadData();
  };

  const handleEdit = (expense: any) => {
    setEditing(expense);
    setForm({
      description: expense.description,
      amount: expense.amount,
      category_id: expense.category_id || '',
      expense_date: expense.expense_date,
      notes: expense.notes || '',
    });
    setShowModal(true);
  };

  // Filter by month
  const filteredExpenses = expenses.filter((e) => {
    if (filterMonth === 'all') return true;
    const expMonth = new Date(e.expense_date).toISOString().slice(0, 7);
    return expMonth === filterMonth;
  });

  // Stats
  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = expenses
    .filter((e) => {
      const expMonth = new Date(e.expense_date).toISOString().slice(0, 7);
      const currentMonth = new Date().toISOString().slice(0, 7);
      return expMonth === currentMonth;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Available months
  const availableMonths = Array.from(
    new Set(
      expenses.map((e) => new Date(e.expense_date).toISOString().slice(0, 7))
    )
  ).sort().reverse();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading expenses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-coffee/60 text-sm mb-1.5">Bookkeeping</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
            Expenses
          </h1>
          <p className="text-coffee/60 mt-2">
            Track your business expenses for tax and reporting
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              description: '',
              amount: 0,
              category_id: '',
              expense_date: new Date().toISOString().split('T')[0],
              notes: '',
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-coffee text-cream px-5 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-coffee text-cream rounded-2xl p-6 lg:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="w-10 h-10 bg-cream/10 rounded-xl flex items-center justify-center mb-5">
              <TrendingDown className="w-4 h-4 text-cream" strokeWidth={1.75} />
            </div>
            <p className="text-cream/60 text-sm mb-2">Total Expenses</p>
            <p className="font-display text-3xl lg:text-4xl font-semibold">
              {formatCurrency(total, defaultCurrency)}
            </p>
            <p className="text-cream/60 text-xs mt-2">
              {filterMonth === 'all' ? 'All time' : 'Filtered'}
            </p>
          </div>
        </div>

        <div className="bg-cream-soft border border-coffee/5 rounded-2xl p-6 lg:p-7">
          <div className="w-10 h-10 bg-tan-soft rounded-xl flex items-center justify-center mb-5">
            <Calendar className="w-4 h-4 text-coffee" strokeWidth={1.75} />
          </div>
          <p className="text-coffee/60 text-sm mb-2">This Month</p>
          <p className="font-display text-3xl lg:text-4xl font-semibold text-coffee">
            {formatCurrency(thisMonth, defaultCurrency)}
          </p>
        </div>

        <div className="bg-cream-soft border border-coffee/5 rounded-2xl p-6 lg:p-7">
          <div className="w-10 h-10 bg-tan-soft rounded-xl flex items-center justify-center mb-5">
            <Receipt className="w-4 h-4 text-coffee" strokeWidth={1.75} />
          </div>
          <p className="text-coffee/60 text-sm mb-2">Total Entries</p>
          <p className="font-display text-3xl lg:text-4xl font-semibold text-coffee">
            {filteredExpenses.length}
          </p>
        </div>
      </div>

      {/* Filter */}
      {availableMonths.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-coffee/60">Filter:</span>
          <button
            onClick={() => setFilterMonth('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterMonth === 'all'
                ? 'bg-coffee text-cream'
                : 'bg-cream-soft text-coffee/70 hover:text-coffee border border-coffee/10'
            }`}
          >
            All time
          </button>
          {availableMonths.map((month) => {
            const date = new Date(month + '-01');
            return (
              <button
                key={month}
                onClick={() => setFilterMonth(month)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterMonth === month
                    ? 'bg-coffee text-cream'
                    : 'bg-cream-soft text-coffee/70 hover:text-coffee border border-coffee/10'
                }`}
              >
                {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </button>
            );
          })}
        </div>
      )}

      {/* Expense list */}
      <div className="bg-cream-soft rounded-3xl border border-coffee/5 overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-coffee/5">
          <h2 className="font-display text-xl font-semibold text-coffee">
            All Expenses
          </h2>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="w-16 h-16 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Receipt className="w-6 h-6 text-coffee" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl font-semibold text-coffee mb-2">
              No expenses yet
            </h3>
            <p className="text-coffee/60 max-w-sm mx-auto">
              Add your first expense to start tracking your business spending.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-coffee/5">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="px-6 lg:px-8 py-4 flex items-center justify-between gap-4 hover:bg-cream/60 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: expense.expense_categories?.color
                        ? expense.expense_categories.color + '30'
                        : '#e8d5b730',
                    }}
                  >
                    <Tag
                      className="w-4 h-4"
                      style={{
                        color: expense.expense_categories?.color || '#3d2817',
                      }}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-coffee truncate">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-coffee/60">
                        {expense.expense_categories?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-coffee/40">·</span>
                      <span className="text-xs text-coffee/60">
                        {new Date(expense.expense_date).toLocaleDateString(
                          'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-coffee">
                    -{formatCurrency(expense.amount, expense.currency || 'USD')}
                  </span>
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-coffee/40 hover:text-coffee transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-coffee/40 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-coffee/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-up"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-cream rounded-3xl max-w-md w-full p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-coffee">
                {editing ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-coffee/60 hover:text-coffee rounded-xl hover:bg-coffee/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Description" required>
                <input
                  type="text"
                  placeholder="e.g. Adobe subscription"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Amount" required>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount || ''}
                  onChange={(e) =>
                    setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Category">
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">-- Select category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) =>
                    setForm({ ...form, expense_date: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-coffee/15 rounded-2xl text-coffee/70 hover:bg-coffee/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.description || !form.amount}
                className="flex-1 bg-coffee text-cream font-medium py-3 rounded-2xl hover:bg-coffee-deep transition-all hover:shadow-lg disabled:opacity-50"
              >
                {editing ? 'Update' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 bg-cream-soft border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-coffee mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
