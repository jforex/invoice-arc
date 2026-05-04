'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CompanySettings {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  brand_color: string;
  default_tax_rate: number;
  default_payment_terms: number;
  default_notes: string;
  email_signature: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'branding' | 'invoice' | 'email'>('company');
  const [company, setCompany] = useState<CompanySettings | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) {
        console.error('Error fetching company:', error);
        alert('Failed to load company settings');
        return;
      }

      setCompany(data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          email: company.email,
          address: company.address,
          phone: company.phone,
          website: company.website,
          logo_url: company.logo_url,
          brand_color: company.brand_color,
          default_tax_rate: company.default_tax_rate,
          default_payment_terms: company.default_payment_terms,
          default_notes: company.default_notes,
          email_signature: company.email_signature,
        })
        .eq('id', company.id);

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${company.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      setCompany({ ...company, logo_url: urlData.publicUrl });
      alert('Logo uploaded! Click Save to apply changes.');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (!company) return;
    if (!confirm('Remove the logo?')) return;
    setCompany({ ...company, logo_url: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your company information and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('company')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'company'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                 Company Info
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'branding'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                 Branding
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'invoice'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                 Invoice Defaults
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'email'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                 Email
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Company Info Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
                  <p className="text-gray-600 text-sm mb-6">This information will appear on your invoices and emails.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) => setCompany({ ...company, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={company.address}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={company.phone || ''}
                      onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={company.website || ''}
                      onChange={(e) => setCompany({ ...company, website: e.target.value })}
                      placeholder="https://yoursite.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Branding</h2>
                  <p className="text-gray-600 text-sm mb-6">Customize the look of your invoices and emails.</p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {company.logo_url ? (
                      <div className="relative">
                        <img 
                          src={company.logo_url} 
                          alt="Company logo" 
                          className="w-24 h-24 object-contain border border-gray-200 rounded-lg bg-white p-2"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                        🏢
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer inline-block"
                      >
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, or SVG. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={company.brand_color}
                      onChange={(e) => setCompany({ ...company, brand_color: e.target.value })}
                      className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={company.brand_color}
                      onChange={(e) => setCompany({ ...company, brand_color: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white w-32"
                    />
                    <div 
                      className="px-6 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: company.brand_color }}
                    >
                      Preview
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This color will be used in invoices and emails.</p>
                </div>
              </div>
            )}

            {/* Invoice Defaults Tab */}
            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Defaults</h2>
                  <p className="text-gray-600 text-sm mb-6">Set default values for new invoices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={(company.default_tax_rate * 100).toFixed(3)}
                      onChange={(e) => setCompany({ ...company, default_tax_rate: parseFloat(e.target.value) / 100 || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current: {(company.default_tax_rate * 100).toFixed(3)}%</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Payment Terms (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={company.default_payment_terms}
                      onChange={(e) => setCompany({ ...company, default_payment_terms: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Net {company.default_payment_terms} days</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Invoice Notes
                    </label>
                    <textarea
                      value={company.default_notes}
                      onChange={(e) => setCompany({ ...company, default_notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will appear on all new invoices by default.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Settings</h2>
                  <p className="text-gray-600 text-sm mb-6">Customize how your invoices appear in emails.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Signature
                  </label>
                  <textarea
                    value={company.email_signature}
                    onChange={(e) => setCompany({ ...company, email_signature: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="Best regards,"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will appear at the end of your invoice emails (before company name).</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2"> Preview</h3>
                  <p className="text-sm text-blue-800">
                    {company.email_signature}<br />
                    <strong>{company.name}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 px-6 md:px-8 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
