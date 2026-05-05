'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import {
  ArrowLeft,
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Search,
  Edit,
  Trash2,
  FileText,
  X,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface ClientWithStats extends Client {
  invoiceCount: number;
  totalSpent: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get default currency
      const { data: company } = await supabase
        .from('companies')
        .select('default_currency')
        .limit(1)
        .single();

      if (company?.default_currency) {
        setDefaultCurrency(company.default_currency);
      }

      // Get clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsData) {
        // Get invoice stats for each client
        const clientsWithStats = await Promise.all(
          clientsData.map(async (client) => {
            const { data: invoices } = await supabase
              .from('invoices')
              .select('total')
              .eq('client_email', client.email);

            const invoiceCount = invoices?.length || 0;
            const totalSpent = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0;

            return { ...client, invoiceCount, totalSpent };
          })
        );

        setClients(clientsWithStats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading clients:', error);
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || '');
    setAddress(client.address || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !email) {
      alert('Name and email are required');
      return;
    }

    setSaving(true);
    try {
      // Get company ID
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      const companyId = companies?.[0]?.id;

      if (editingClient) {
        // Update existing
        const { error } = await supabase
          .from('clients')
          .update({
            name,
            email,
            phone: phone || null,
            address: address || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClient.id);

        if (error) throw error;
        alert('Client updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('clients')
          .insert({
            company_id: companyId,
            name,
            email,
            phone: phone || null,
            address: address || null,
          });

        if (error) throw error;
        alert('Client added successfully!');
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving client:', error);
      alert(error.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;
      alert('Client deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Clients</h1>
              <p className="text-gray-600 mt-1">Manage your client database</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter((c) => c.invoiceCount > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter((c) => {
                    const created = new Date(c.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && 
                           created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Add your first client to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.invoiceCount} invoices</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(client.totalSpent, defaultCurrency)}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/invoices/create?client=${client.id}`)}
                    className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                  >
                    + Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@acme.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, city, country"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingClient ? 'Update' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
