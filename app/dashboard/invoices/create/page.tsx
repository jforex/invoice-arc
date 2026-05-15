'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import {
  Plus,
  Trash2,
  Save,
  FileText,
  User,
  Calendar,
  Receipt,
  Repeat,
  StickyNote,
} from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [invoice, setInvoice] = useState({
    invoice_number: `INV-${String(Date.now()).slice(-6)}`,
    client_name: '',
    client_email: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    notes: 'Payment via USDC · 0% fees · 10-second settlement',
    currency: 'USD',
    tax_rate: 0,
    is_recurring: false,
    recurring_frequency: 'monthly',
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user?.id, user?.email);
    if (!user) return;

    const { data: company, error } = await supabase
      .from('companies')
      .select('id, default_currency, default_tax_rate, invoice_notes')
      .eq('user_id', user.id)
      .single();

    console.log('Company:', company);
    console.log('Company error:', error);

    if (company) {
      setCompanyId(company.id);
      setInvoice((prev) => ({
        ...prev,
        currency: company.default_currency || 'USD',
        tax_rate: company.default_tax_rate || 0,
        notes: company.invoice_notes || prev.notes,
      }));

      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id);
      if (clientsData) setClients(clientsData);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setInvoice({
          ...invoice,
          client_name: client.name,
          client_email: client.email,
          client_address: client.address || '',
        });
      }
    } else {
      setInvoice({
        ...invoice,
        client_name: '',
        client_email: '',
        client_address: '',
      });
    }
  };

  const addItem = () =>
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  const removeItem = (idx: number) =>
    setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = subtotal * (invoice.tax_rate / 100);
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!companyId) {
      alert('Company not loaded yet. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const publicToken = crypto.randomUUID();

      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          company_id: companyId,
          subtotal,
          tax,
          total,
          status: 'pending',
          public_token: publicToken,
          recurring_active: invoice.is_recurring,
        })
        .select()
        .single();

      if (error) throw error;

      const itemsToInsert = items
        .filter((item) => item.description && item.quantity > 0)
        .map((item) => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: item.quantity * item.price,
        }));

      if (itemsToInsert.length > 0) {
        await supabase.from('invoice_items').insert(itemsToInsert);
      }

      router.push(`/dashboard/invoices/${newInvoice.id}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  const currencySymbol =
    (CURRENCIES as any)[invoice.currency]?.symbol || '$';

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14 pb-32 lg:pb-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">New Document</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Create Invoice
        </h1>
        <p className="text-coffee/60 mt-2">
          Fill in the details below and send for instant USDC payment
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* ─────────── Main form ─────────── */}
        <div className="space-y-6">
          {/* Section: Invoice details */}
          <Section
            icon={FileText}
            title="Invoice Details"
            subtitle="Basic information about this invoice"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Invoice Number">
                <input
                  type="text"
                  value={invoice.invoice_number}
                  onChange={(e) =>
                    setInvoice({ ...invoice, invoice_number: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Currency">
                <select
                  value={invoice.currency}
                  onChange={(e) =>
                    setInvoice({ ...invoice, currency: e.target.value })
                  }
                  className={inputClass}
                >
                  {Object.entries(CURRENCIES).map(
                    ([code, info]: [string, any]) => (
                      <option key={code} value={code}>
                        {info.symbol} {code}
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>
          </Section>

          {/* Section: Client */}
          <Section
            icon={User}
            title="Bill To"
            subtitle="Who is this invoice for?"
          >
            {clients.length > 0 && (
              <Field label="Select existing client (optional)">
                <select
                  value={selectedClient}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— New client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Client Name" required>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={invoice.client_name}
                  onChange={(e) =>
                    setInvoice({ ...invoice, client_name: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Client Email" required>
                <input
                  type="email"
                  placeholder="billing@acme.com"
                  value={invoice.client_email}
                  onChange={(e) =>
                    setInvoice({ ...invoice, client_email: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Client Address">
              <textarea
                placeholder="123 Main St, City, Country"
                value={invoice.client_address}
                onChange={(e) =>
                  setInvoice({ ...invoice, client_address: e.target.value })
                }
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </Section>

          {/* Section: Dates */}
          <Section
            icon={Calendar}
            title="Dates"
            subtitle="Issue and due dates"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Issue Date">
                <input
                  type="date"
                  value={invoice.issue_date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, issue_date: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Due Date">
                <input
                  type="date"
                  value={invoice.due_date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, due_date: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {/* Section: Items */}
          <Section
            icon={Receipt}
            title="Line Items"
            subtitle="What are you billing for?"
          >
            <div className="hidden md:grid grid-cols-12 gap-3 px-3 mb-2 text-xs font-medium text-coffee/50 uppercase tracking-wider">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Price</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <input
                    type="text"
                    placeholder="Service or product description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, 'description', e.target.value)
                    }
                    className={`col-span-12 md:col-span-6 ${itemInputClass}`}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        'quantity',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`col-span-4 md:col-span-2 ${itemInputClass}`}
                  />
                  <div className="col-span-7 md:col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee/40 text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          'price',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`${itemInputClass} pl-7`}
                    />
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="col-span-1 flex items-center justify-center text-coffee/40 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-2"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-coffee/70 hover:text-coffee font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add line item
            </button>
          </Section>

          {/* Section: Notes & options */}
          <Section
            icon={StickyNote}
            title="Notes & Options"
            subtitle="Additional details and recurring settings"
          >
            <Field label="Tax Rate (%)">
              <input
                type="number"
                step="0.01"
                value={invoice.tax_rate}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    tax_rate: parseFloat(e.target.value) || 0,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                placeholder="Payment terms, thank you message, etc."
                value={invoice.notes}
                onChange={(e) =>
                  setInvoice({ ...invoice, notes: e.target.value })
                }
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="bg-cream rounded-2xl border border-coffee/10 p-5">
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={invoice.is_recurring}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        is_recurring: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-coffee/15 rounded-full peer-checked:bg-coffee transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-cream rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-coffee/70" />
                    <span className="font-medium text-coffee">
                      Recurring Invoice
                    </span>
                  </div>
                  <p className="text-sm text-coffee/60 mt-1">
                    Automatically generate this invoice on a schedule
                  </p>
                </div>
              </label>

              {invoice.is_recurring && (
                <div className="mt-4 pl-14">
                  <label className="block text-xs font-medium text-coffee/60 mb-2 uppercase tracking-wider">
                    Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map(
                      (freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() =>
                            setInvoice({
                              ...invoice,
                              recurring_frequency: freq,
                            })
                          }
                          className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                            invoice.recurring_frequency === freq
                              ? 'bg-coffee text-cream'
                              : 'bg-cream-soft text-coffee/70 hover:text-coffee hover:bg-tan-soft'
                          }`}
                        >
                          {freq}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* ─────────── Summary sidebar ─────────── */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-coffee text-cream rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <p className="text-cream/50 text-xs uppercase tracking-wider mb-1">
                Invoice Total
              </p>
              <p className="font-display text-5xl font-semibold mb-6">
                {formatCurrency(total, invoice.currency)}
              </p>

              <div className="space-y-3 pb-5 border-b border-cream/10">
                <Row
                  label="Subtotal"
                  value={formatCurrency(subtotal, invoice.currency)}
                />
                <Row
                  label={`Tax (${invoice.tax_rate}%)`}
                  value={formatCurrency(tax, invoice.currency)}
                />
              </div>

              <div className="flex justify-between items-baseline pt-5 mb-6">
                <span className="text-cream/70 text-sm">Total</span>
                <span className="font-display text-2xl font-semibold">
                  {formatCurrency(total, invoice.currency)}
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  loading || !invoice.client_name || !invoice.client_email
                }
                className="group w-full bg-cream text-coffee font-medium py-4 rounded-2xl hover:bg-tan-soft transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-coffee rounded-full animate-pulse-dot" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Invoice
                  </>
                )}
              </button>

              <p className="text-xs text-cream/50 text-center mt-4">
                {items.filter((i) => i.description).length}{' '}
                {items.filter((i) => i.description).length === 1
                  ? 'item'
                  : 'items'}{' '}
                · Due{' '}
                {new Date(invoice.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-t border-coffee/10 p-4 z-20">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <p className="text-xs text-coffee/60">Total</p>
            <p className="font-display text-xl font-semibold text-coffee">
              {formatCurrency(total, invoice.currency)}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !invoice.client_name || !invoice.client_email}
            className="inline-flex items-center gap-2 bg-coffee text-cream px-5 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                Creating…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── helpers ─────────── */

const inputClass =
  'w-full px-4 py-3 bg-cream border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all';

const itemInputClass =
  'w-full px-3 py-2.5 bg-cream border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all text-sm';

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 bg-tan-soft rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-coffee" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-coffee">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-coffee/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-cream/60">{label}</span>
      <span className="text-cream font-medium">{value}</span>
    </div>
  );
}