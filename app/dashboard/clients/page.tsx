'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  X,
  Search,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company_id: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!company) {
      setLoading(false);
      return;
    }

    setCompanyId(company.id);

    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });

    if (clientsData) setClients(clientsData);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    if (editingClient) {
      await supabase.from('clients').update(form).eq('id', editingClient.id);
    } else {
      await supabase.from('clients').insert({ ...form, company_id: companyId });
    }
    setShowModal(false);
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    await loadData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    const supabase = createClient();
    await supabase.from('clients').delete().eq('id', id);
    loadData();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  const filtered = clients.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading clients…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-coffee/60 text-sm mb-1.5">Directory</p>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
            Clients
          </h1>
          <p className="text-coffee/60 mt-2">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'} in
            your workspace
          </p>
        </div>
        <button
          onClick={openAdd}
          className="group inline-flex items-center gap-2 bg-coffee text-cream px-5 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee/40" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
          />
        </div>
      )}

      {/* Content */}
      {clients.length === 0 ? (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Users className="w-6 h-6 text-coffee" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold text-coffee mb-2">
            No clients yet
          </h3>
          <p className="text-coffee/60 mb-6 max-w-sm mx-auto">
            Add your first client to start sending invoices and tracking
            payments.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Client
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-12 text-center">
          <p className="text-coffee/60">
            No clients match &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="group bg-cream-soft border border-coffee/5 hover:border-coffee/15 rounded-3xl p-6 transition-all hover:shadow-lg hover:shadow-coffee/5"
            >
              {/* Avatar + name */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 w-12 h-12 bg-coffee text-cream rounded-2xl flex items-center justify-center font-display font-semibold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-coffee truncate">
                    {client.name}
                  </h3>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-sm text-coffee/70 mb-5">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-coffee/40 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-coffee/40 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-coffee/40 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-coffee/5">
                <button
                  onClick={() => handleEdit(client)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cream hover:bg-tan-soft text-coffee px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="inline-flex items-center justify-center gap-1.5 bg-cream hover:bg-red-50 text-coffee hover:text-red-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                  aria-label="Delete client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────── Modal ───────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-coffee/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-up"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-cream rounded-3xl max-w-md w-full p-6 lg:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-coffee">
                  {editingClient ? 'Edit Client' : 'Add Client'}
                </h2>
                <p className="text-coffee/60 text-sm mt-1">
                  {editingClient
                    ? 'Update client details'
                    : 'Add a new client to your workspace'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-coffee/60 hover:text-coffee rounded-xl hover:bg-coffee/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="billing@acme.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee mb-2">
                  Address
                </label>
                <textarea
                  placeholder="123 Main St, City, Country"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3.5 bg-cream-soft border border-coffee/10 text-coffee rounded-2xl font-medium hover:bg-cream-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.email || saving}
                className="flex-1 px-4 py-3.5 bg-coffee text-cream rounded-2xl font-medium hover:bg-coffee-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                    Saving…
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}