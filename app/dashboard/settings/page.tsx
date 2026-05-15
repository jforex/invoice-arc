'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import {
  Save,
  Building,
  Palette,
  Sliders,
  Upload,
  X,
  Check,
} from 'lucide-react';
import { CURRENCIES } from '@/lib/currency';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'branding' | 'defaults'>(
    'company'
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    logo_url: '',
    brand_color: '#3d2817',
    default_currency: 'USD',
    default_tax_rate: 0,
    invoice_notes: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        brand_color: company.brand_color || '#3d2817',
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
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileName = `logo-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from('logos')
      .upload(fileName, file);
    if (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
    setForm({ ...form, logo_url: data.publicUrl });
    setUploading(false);
  };

  const removeLogo = () => {
    setForm({ ...form, logo_url: '' });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'company' as const, label: 'Company', icon: Building },
    { id: 'branding' as const, label: 'Branding', icon: Palette },
    { id: 'defaults' as const, label: 'Defaults', icon: Sliders },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">Workspace</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Settings
        </h1>
        <p className="text-coffee/60 mt-2">
          Configure your company details, branding, and invoice defaults
        </p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar tabs */}
        <aside>
          <nav className="bg-cream-soft border border-coffee/5 rounded-2xl p-2 lg:sticky lg:top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[15px] transition-all ${
                    active
                      ? 'bg-coffee text-cream font-medium'
                      : 'text-coffee/70 hover:text-coffee hover:bg-cream'
                  }`}
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    strokeWidth={active ? 2 : 1.75}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Form panel */}
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-coffee">
                  Company Info
                </h2>
                <p className="text-coffee/60 text-sm mt-1">
                  This information appears on your invoices and emails
                </p>
              </div>

              <Field label="Company Name" required>
                <input
                  type="text"
                  placeholder="Your Company Inc."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  placeholder="billing@yourcompany.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Address">
                <textarea
                  placeholder="123 Main St, City, State, Country"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-coffee">
                  Branding
                </h2>
                <p className="text-coffee/60 text-sm mt-1">
                  Customize how your invoices look to clients
                </p>
              </div>

              {/* Logo */}
              <Field label="Logo">
                <div className="flex items-start gap-5">
                  {form.logo_url ? (
                    <div className="relative group">
                      <div className="w-28 h-28 bg-cream rounded-2xl border border-coffee/10 flex items-center justify-center overflow-hidden p-3">
                        <Image
                          src={form.logo_url}
                          alt="Company logo"
                          width={112}
                          height={112}
                          className="object-contain max-h-full max-w-full"
                          unoptimized
                        />
                      </div>
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-coffee text-cream rounded-full flex items-center justify-center hover:bg-coffee-deep transition-colors shadow-md"
                        aria-label="Remove logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-cream border-2 border-dashed border-coffee/15 rounded-2xl flex items-center justify-center">
                      <Building
                        className="w-7 h-7 text-coffee/30"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 bg-cream hover:bg-tan-soft border border-coffee/10 px-4 py-2.5 rounded-xl text-sm font-medium text-coffee cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {uploading
                        ? 'Uploading…'
                        : form.logo_url
                        ? 'Replace logo'
                        : 'Upload logo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-coffee/50 mt-3 leading-relaxed">
                      PNG or JPG. Recommended size 400×400px. Max 2MB.
                    </p>
                  </div>
                </div>
              </Field>

              {/* Brand color */}
              <Field label="Brand Color">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={form.brand_color}
                      onChange={(e) =>
                        setForm({ ...form, brand_color: e.target.value })
                      }
                      className="w-14 h-14 rounded-2xl border-2 border-coffee/10 cursor-pointer overflow-hidden"
                      style={{ padding: 2 }}
                    />
                  </div>
                  <input
                    type="text"
                    value={form.brand_color}
                    onChange={(e) =>
                      setForm({ ...form, brand_color: e.target.value })
                    }
                    placeholder="#3d2817"
                    className={`${inputClass} font-mono uppercase max-w-40`}
                  />
                  <span className="text-sm text-coffee/50">
                    Used on invoice accents
                  </span>
                </div>
              </Field>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold text-coffee">
                  Invoice Defaults
                </h2>
                <p className="text-coffee/60 text-sm mt-1">
                  These pre-fill when you create a new invoice
                </p>
              </div>

              <Field label="Default Currency">
                <select
                  value={form.default_currency}
                  onChange={(e) =>
                    setForm({ ...form, default_currency: e.target.value })
                  }
                  className={inputClass}
                >
                  {Object.entries(CURRENCIES).map(
                    ([code, info]: [string, any]) => (
                      <option key={code} value={code}>
                        {info.symbol} {code} — {info.name}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Default Tax Rate (%)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.default_tax_rate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      default_tax_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
                <p className="text-xs text-coffee/50 mt-2">
                  Leave at 0 if you don&apos;t charge tax
                </p>
              </Field>

              <Field label="Default Invoice Notes">
                <textarea
                  value={form.invoice_notes}
                  onChange={(e) =>
                    setForm({ ...form, invoice_notes: e.target.value })
                  }
                  rows={4}
                  placeholder="Payment terms, thank you notes, etc."
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          )}

          {/* Save bar */}
          <div className="mt-8 pt-6 border-t border-coffee/10 flex items-center justify-between gap-4">
            <p className="text-xs text-coffee/50">
              Changes apply to all future invoices
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-xl font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="bg-coffee text-cream px-5 py-3 rounded-full shadow-2xl shadow-coffee/30 flex items-center gap-2.5 text-sm font-medium">
            <div className="w-5 h-5 bg-sage rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-coffee" strokeWidth={3} />
            </div>
            Settings saved
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── helpers ─────────── */

const inputClass =
  'w-full px-4 py-3.5 bg-cream border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all';

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