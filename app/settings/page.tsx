'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { ArrowLeft, Save, Building, DollarSign, Palette, Upload } from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    logo_url: '',
    brand_color: '#3b82f6',
    default_currency: 'USD',
    default_tax_rate: 0,
    invoice_notes: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (company) {
      setCompanyId(company.id);
      setForm({
        name: company.name || '',
        email: company.email || '',
        address: company.address || '',
        phone: company.phone || '',
        logo_url: company.logo_url || '',
        brand_color: company.brand_color || '#3b82f6',
        default_currency: company.default_currency || 'USD',
        default_tax_rate: company.default_tax_rate || 0,
        invoice_notes: company.invoice_notes || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('companies').update(form).eq('id', companyId);
    setSaving(false);
    alert('Settings saved!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const fileName = `logo-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('logos').upload(fileName, file);
    if (error) {
      alert('Upload failed: ' + error.message);
      return;
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
    setForm({ ...form, logo_url: data.publicUrl });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Settings</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('company')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'company' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>Company</button>
          <button onClick={() => setActiveTab('branding')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>Branding</button>
          <button onClick={() => setActiveTab('defaults')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'defaults' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>Defaults</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'company' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
              <input type="text" placeholder="Company Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              <textarea placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                {form.logo_url && <img src={form.logo_url} alt="Logo" className="h-20 mb-2" />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                <input type="color" value={form.brand_color} onChange={e => setForm({...form, brand_color: e.target.value})} className="h-12 w-24 rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Defaults</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select value={form.default_currency} onChange={e => setForm({...form, default_currency: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                  {Object.entries(CURRENCIES).map(([code, info]: [string, any]) => (
                    <option key={code} value={code}>{info.symbol} {code} - {info.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                <input type="number" step="0.01" value={form.default_tax_rate} onChange={e => setForm({...form, default_tax_rate: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Invoice Notes</label>
                <textarea value={form.invoice_notes} onChange={e => setForm({...form, invoice_notes: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white" />
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 disabled:opacity-50">
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
