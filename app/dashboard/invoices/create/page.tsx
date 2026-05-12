'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [invoice, setInvoice] = useState({
    invoice_number: `INV-${String(Date.now()).slice(-6)}`,
    client_name: '',
    client_email: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Payment via USDC • 0% fees • 10-second settlement',
    currency: 'USD',
    tax_rate: 0,
    is_recurring: false,
    recurring_frequency: 'monthly',
  });

  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id, default_currency, default_tax_rate, invoice_notes')
      .eq('user_id', user.id)
      .single();

    if (company) {
      setCompanyId(company.id);
      setDefaultCurrency(company.default_currency || 'USD');
      setInvoice(prev => ({
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
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setInvoice({
          ...invoice,
          client_name: client.name,
          client_email: client.email,
          client_address: client.address || '',
        });
      }
    }
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * (invoice.tax_rate / 100);
  const total = subtotal + tax;

  const handleSubmit = async () => {
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
        .filter(item => item.description && item.quantity > 0)
        .map(item => ({
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📝 Create Invoice</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
              <input type="text" value={invoice.invoice_number} onChange={e => setInvoice({...invoice, invoice_number: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select value={invoice.currency} onChange={e => setInvoice({...invoice, currency: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                {Object.entries(CURRENCIES).map(([code, info]: [string, any]) => (
                  <option key={code} value={code}>{info.symbol} {code}</option>
                ))}
              </select>
            </div>
          </div>

          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Client (optional)</label>
              <select value={selectedClient} onChange={e => handleClientSelect(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                <option value="">-- New client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Client Name" value={invoice.client_name} onChange={e => setInvoice({...invoice, client_name: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
            <input type="email" placeholder="Client Email" value={invoice.client_email} onChange={e => setInvoice({...invoice, client_email: e.target.value})} className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
          </div>
          <textarea placeholder="Client Address" value={invoice.client_address} onChange={e => setInvoice({...invoice, client_address: e.target.value})} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <input type="date" value={invoice.issue_date} onChange={e => setInvoice({...invoice, issue_date: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input type="date" value={invoice.due_date} onChange={e => setInvoice({...invoice, due_date: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Items</h3>
              <button onClick={addItem} className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-sm"><Plus className="w-4 h-4" /> Add Item</button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <input type="text" placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm" />
                <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm" />
                <input type="number" step="0.01" placeholder="Price" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm" />
                <button onClick={() => removeItem(idx)} className="col-span-1 text-red-600 hover:text-red-700 flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input type="number" step="0.01" value={invoice.tax_rate} onChange={e => setInvoice({...invoice, tax_rate: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
          </div>

          <textarea placeholder="Notes" value={invoice.notes} onChange={e => setInvoice({...invoice, notes: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" checked={invoice.is_recurring} onChange={e => setInvoice({...invoice, is_recurring: e.target.checked})} className="w-4 h-4" />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Recurring Invoice</label>
            {invoice.is_recurring && (
              <select value={invoice.recurring_frequency} onChange={e => setInvoice({...invoice, recurring_frequency: e.target.value})} className="ml-3 px-3 py-1 border border-gray-300 rounded text-gray-900 bg-white text-sm">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>{formatCurrency(subtotal, invoice.currency)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax:</span><span>{formatCurrency(tax, invoice.currency)}</span></div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2"><span>Total:</span><span>{formatCurrency(total, invoice.currency)}</span></div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !invoice.client_name} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
