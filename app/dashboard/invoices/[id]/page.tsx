'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import { formatCurrency } from '@/lib/currency';
import React from 'react';
import {
  ArrowLeft,
  Link as LinkIcon,
  Download,
  Mail,
  CheckCircle2,
  Building2,
  Calendar,
  Check,
  Copy,
  Zap,
  Clock,
} from 'lucide-react';

interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  public_token?: string;
  currency?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface CompanyData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  brand_color: string;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (invoiceError || !invoiceData) {
        showToast('error', 'Invoice not found');
        setTimeout(() => router.push('/dashboard'), 1500);
        return;
      }

      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceData.id);

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();

      setInvoice({ ...invoiceData, items: items || [] });
      setCompany(companyData);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const pdfElement = React.createElement(InvoicePDF as any, {
        invoice,
        company: company || undefined,
      }) as any;
      const blob = await pdf(pdfElement).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoice_number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    if (!confirm(`Send invoice to ${invoice.client_email}?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      showToast('success', `Invoice sent to ${invoice.client_email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('error', 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    if (!confirm('Mark this invoice as paid?')) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;

      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      if (companies && companies.length > 0) {
        await supabase.from('activity').insert({
          company_id: companies[0].id,
          type: 'invoice_paid',
          invoice_id: invoice.id,
          client_name: invoice.client_name,
          invoice_number: invoice.invoice_number,
          amount: invoice.total,
        });
      }

      setInvoice({ ...invoice, status: 'paid' });
      showToast('success', 'Invoice marked as paid');
    } catch (error) {
      console.error('Error updating invoice:', error);
      showToast('error', 'Failed to update invoice');
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!invoice?.public_token) {
      showToast('error', 'No public link available');
      return;
    }

    const url = `${window.location.origin}/invoice/${invoice.public_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading invoice…</span>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const currency = invoice.currency || 'USD';
  const isPaid = invoice.status === 'paid';

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Top bar */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-coffee/60 hover:text-coffee transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
                {invoice.invoice_number}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                  isPaid
                    ? 'bg-sage/40 text-sage-deep border border-sage-deep/20'
                    : 'bg-amber/30 text-amber-deep border border-amber-deep/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPaid
                      ? 'bg-sage-deep animate-pulse-dot'
                      : 'bg-amber-deep animate-pulse-dot'
                  }`}
                />
                {isPaid ? 'Paid' : 'Pending'}
              </span>
            </div>
            <p className="text-coffee/60">
              Issued {formatDate(invoice.issue_date)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-2 bg-cream-soft border border-coffee/10 text-coffee px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-tan-soft transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-sage-deep" />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5" />
                  Share Link
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-cream-soft border border-coffee/10 text-coffee px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-tan-soft transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="w-1.5 h-1.5 bg-coffee rounded-full animate-pulse-dot" />
                  Generating…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="inline-flex items-center gap-2 bg-coffee text-cream px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-coffee-deep transition-all hover:shadow-md hover:shadow-coffee/20 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  Send Email
                </>
              )}
            </button>

            {!isPaid && (
              <button
                onClick={handleMarkAsPaid}
                disabled={updating}
                className="inline-flex items-center gap-2 bg-sage-deep text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />
                    Updating…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark as Paid
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────── Invoice document ───────────────── */}
      <div className="bg-cream-soft border border-coffee/5 rounded-3xl overflow-hidden">
        {/* Hero strip */}
        <div className="bg-coffee text-cream px-8 lg:px-12 py-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-cream/50 text-xs uppercase tracking-wider mb-2">
                Total Due
              </p>
              <p className="font-display text-4xl lg:text-5xl font-semibold">
                {formatCurrency(invoice.total, currency)}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-cream/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 sm:justify-end">
                <Calendar className="w-3 h-3" />
                Due Date
              </p>
              <p className="font-display text-2xl font-semibold">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 lg:p-12">
          {/* From / Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-4">
                From
              </h3>
              <div className="flex items-start gap-3">
                {company?.logo_url ? (
                  <div className="w-12 h-12 rounded-xl bg-cream border border-coffee/10 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src={company.logo_url}
                      alt="Company logo"
                      width={48}
                      height={48}
                      className="object-contain max-h-full max-w-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-coffee text-cream flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-semibold text-coffee">
                    {company?.name || 'Christian Design Studio'}
                  </p>
                  <p className="text-coffee/60 text-sm">
                    {company?.email || 'hello@christiandesign.com'}
                  </p>
                  <p className="text-coffee/60 text-sm">
                    {company?.address || 'Port Harcourt, Rivers State, Nigeria'}
                  </p>
                  {company?.phone && (
                    <p className="text-coffee/60 text-sm">{company.phone}</p>
                  )}
                  {company?.website && (
                    <p className="text-coffee/60 text-sm">{company.website}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-4">
                Bill To
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-tan-soft rounded-xl flex items-center justify-center font-display font-semibold text-coffee flex-shrink-0">
                  {invoice.client_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-coffee">
                    {invoice.client_name}
                  </p>
                  <p className="text-coffee/60 text-sm">
                    {invoice.client_email}
                  </p>
                  {invoice.client_address && (
                    <p className="text-coffee/60 text-sm whitespace-pre-line">
                      {invoice.client_address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <div className="overflow-x-auto -mx-4 lg:mx-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-coffee/10">
                    <th className="text-left py-3 px-4 lg:px-0 text-xs font-medium text-coffee/50 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-coffee/50 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-coffee/50 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-right py-3 px-4 lg:px-0 text-xs font-medium text-coffee/50 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-coffee/5 last:border-b-0"
                    >
                      <td className="py-4 px-4 lg:px-0 text-coffee">
                        {item.description}
                      </td>
                      <td className="py-4 px-4 text-coffee/70 text-center">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-4 text-coffee/70 text-right">
                        {formatCurrency(item.price, currency)}
                      </td>
                      <td className="py-4 px-4 lg:px-0 text-right">
                        <span className="font-display font-semibold text-coffee">
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-coffee/60">Subtotal</span>
                <span className="font-medium text-coffee">
                  {formatCurrency(invoice.subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-coffee/60">Tax</span>
                <span className="font-medium text-coffee">
                  {formatCurrency(invoice.tax, currency)}
                </span>
              </div>
              <div className="border-t border-coffee/10 pt-3 flex justify-between items-baseline">
                <span className="text-coffee/70 font-medium">Total</span>
                <span className="font-display text-2xl font-semibold text-coffee">
                  {formatCurrency(invoice.total, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-cream rounded-2xl border border-coffee/5 p-5 mb-6">
              <p className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-2">
                Notes
              </p>
              <p className="text-coffee/80 leading-relaxed whitespace-pre-line">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Payment note */}
          <div className="flex items-center gap-3 pt-6 border-t border-coffee/10">
            <div className="w-9 h-9 bg-tan-soft rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap
                className="w-3.5 h-3.5 text-coffee fill-coffee"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-sm text-coffee/70">
              Payment via{' '}
              <span className="font-medium text-coffee">USDC</span> · 0% fees ·
              <span className="inline-flex items-center gap-1 ml-1">
                <Clock className="w-3 h-3" />
                10-second settlement
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div
            className={`px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-coffee text-cream shadow-coffee/30'
                : 'bg-red-600 text-white shadow-red-600/30'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 bg-sage rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-coffee" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">!</span>
              </div>
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}