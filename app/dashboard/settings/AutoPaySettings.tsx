'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import {
  Zap,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Mail,
} from 'lucide-react';

export default function AutoPaySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [maxAmount, setMaxAmount] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [trustedSenders, setTrustedSenders] = useState<any[]>([]);
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: company } = await supabase
      .from('companies')
      .select('id, auto_pay_enabled, auto_pay_max_amount, auto_pay_notify_email')
      .eq('user_id', user.id)
      .single();

    if (company) {
      setCompanyId(company.id);
      setEnabled(company.auto_pay_enabled || false);
      setMaxAmount(company.auto_pay_max_amount || 0);
      setNotifyEmail(company.auto_pay_notify_email !== false);

      const { data: senders } = await supabase
        .from('trusted_senders')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (senders) setTrustedSenders(senders);
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('companies')
      .update({
        auto_pay_enabled: enabled,
        auto_pay_max_amount: maxAmount,
        auto_pay_notify_email: notifyEmail,
      })
      .eq('id', companyId);
    setSaving(false);
    alert('Auto-pay settings saved');
  };

  const addTrustedSender = async () => {
    if (!newSenderEmail) return;
    setAdding(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('trusted_senders')
      .insert({
        company_id: companyId,
        sender_email: newSenderEmail.toLowerCase(),
        sender_name: newSenderName || null,
      })
      .select()
      .single();

    if (error) {
      alert('Error: ' + error.message);
    } else if (data) {
      setTrustedSenders([data, ...trustedSenders]);
      setNewSenderEmail('');
      setNewSenderName('');
    }
    setAdding(false);
  };

  const removeTrustedSender = async (id: string) => {
    if (!confirm('Remove this trusted sender?')) return;
    const supabase = createClient();
    await supabase.from('trusted_senders').delete().eq('id', id);
    setTrustedSenders(trustedSenders.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-amber/30 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-deep" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold text-coffee">
              Auto-Pay
            </h2>
            <p className="text-sm text-coffee/60 mt-0.5">
              Automatically pay invoices from trusted senders
            </p>
          </div>
        </div>

        {/* Master toggle */}
        <div className="bg-cream rounded-2xl border border-coffee/10 p-5 mb-5">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-coffee/15 rounded-full peer-checked:bg-coffee transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-cream rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-coffee">Enable Auto-Pay</span>
              <p className="text-sm text-coffee/60 mt-1">
                When enabled, invoices from trusted senders within your spending limit will be automatically paid
              </p>
            </div>
          </label>
        </div>

        {enabled && (
          <>
            {/* Max amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-coffee mb-2">
                Maximum amount per invoice (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee/40 text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-cream border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all"
                />
              </div>
              <p className="text-xs text-coffee/50 mt-2">
                Invoices above this amount will require manual approval
              </p>
            </div>

            {/* Email notify */}
            <div className="bg-cream rounded-2xl border border-coffee/10 p-5">
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-coffee/15 rounded-full peer-checked:bg-coffee transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-cream rounded-full transition-transform peer-checked:translate-x-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-coffee/70" />
                    <span className="font-medium text-coffee">
                      Email notifications
                    </span>
                  </div>
                  <p className="text-sm text-coffee/60 mt-1">
                    Get an email when an invoice is auto-paid
                  </p>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Warning */}
        {enabled && (
          <div className="mt-5 flex items-start gap-3 bg-amber/15 border border-amber-deep/20 rounded-2xl p-4">
            <AlertTriangle
              className="w-4 h-4 text-amber-deep flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
            />
            <p className="text-xs text-coffee/80 leading-relaxed">
              Auto-pay uses your wallet&apos;s PIN-less authorization. Only enable for trusted senders and set a reasonable max amount.
            </p>
          </div>
        )}

        <button
          onClick={saveSettings}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Auto-Pay Settings'}
        </button>
      </div>

      {/* Trusted senders */}
      {enabled && (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="font-display text-xl font-semibold text-coffee mb-1">
              Trusted Senders
            </h3>
            <p className="text-sm text-coffee/60">
              Only invoices from these senders will be auto-paid
            </p>
          </div>

          {/* Add new */}
          <div className="bg-cream rounded-2xl border border-coffee/10 p-5 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="email"
                placeholder="sender@example.com"
                value={newSenderEmail}
                onChange={(e) => setNewSenderEmail(e.target.value)}
                className="px-4 py-2.5 bg-cream-soft border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all text-sm"
              />
              <input
                type="text"
                placeholder="Optional name"
                value={newSenderName}
                onChange={(e) => setNewSenderName(e.target.value)}
                className="px-4 py-2.5 bg-cream-soft border border-coffee/10 rounded-xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee transition-all text-sm"
              />
            </div>
            <button
              onClick={addTrustedSender}
              disabled={!newSenderEmail || adding}
              className="inline-flex items-center gap-2 bg-coffee text-cream px-4 py-2 rounded-xl text-sm font-medium hover:bg-coffee-deep transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {adding ? 'Adding...' : 'Add Trusted Sender'}
            </button>
          </div>

          {/* List */}
          {trustedSenders.length === 0 ? (
            <p className="text-coffee/60 text-sm text-center py-6">
              No trusted senders yet. Add one above.
            </p>
          ) : (
            <div className="space-y-2">
              {trustedSenders.map((sender) => (
                <div
                  key={sender.id}
                  className="flex items-center justify-between bg-cream rounded-xl border border-coffee/10 p-4"
                >
                  <div>
                    <p className="font-medium text-coffee text-sm">
                      {sender.sender_name || sender.sender_email}
                    </p>
                    {sender.sender_name && (
                      <p className="text-xs text-coffee/60">
                        {sender.sender_email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeTrustedSender(sender.id)}
                    className="text-coffee/40 hover:text-red-600 transition-colors p-2"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
