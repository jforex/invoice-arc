'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { ArrowLeft, Plus, Edit2, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';

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
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const supabase = createClient();
    if (editingClient) {
      await supabase.from('clients').update(form).eq('id', editingClient.id);
    } else {
      await supabase.from('clients').insert({ ...form, company_id: companyId });
    }
    setShowModal(false);
    setEditingClient(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    const supabase = createClient();
    await supabase.from('clients').delete().eq('id', id);
    loadData();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({ name: client.name, email: client.email, phone: client.phone || '', address: client.address || '' });
    setShowModal(true);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900">👥 Clients</h1>
          <button onClick={() => { setEditingClient(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No clients yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{client.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {client.email}</p>
                      {client.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {client.phone}</p>}
                      {client.address && <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {client.address}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button onClick={() => handleEdit(client)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
                <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
                <textarea placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                <button onClick={handleSave} disabled={!form.name || !form.email} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
