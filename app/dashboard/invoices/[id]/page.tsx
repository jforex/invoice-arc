'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import React from 'react';

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

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (invoiceError || !invoiceData) {
        alert('Invoice not found');
        router.push('/dashboard');
        return;
      }

      // Fetch invoice items
      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceData.id);

      // Fetch company settings
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
        company: company || undefined 
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
      alert('Failed to generate PDF');
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

      alert(`Invoice sent successfully to ${invoice.client_email}!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
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

      const { data: companies } = await supabase.from('companies').select('id').limit(1);
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
      alert('Invoice marked as paid!');
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice');
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!invoice?.public_token) {
      alert('No public link available for this invoice');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const brandColor = company?.brand_color || '#2563eb';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <p className="text-gray-600">Issued {formatDate(invoice.issue_date)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyShareLink}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Share Link'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {downloading ? 'Generating...' : '📄 Download PDF'}
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {sending ? 'Sending...' : '✉️ Send Email'}
            </button>

            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? 'Updating...' : '✓ Mark as Paid'}
              </button>
            )}
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Status & Due Date */}
          <div className="flex flex-col md:flex-row md:justify-between mb-8 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">📅 Due Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
            </div>
            <div className={`inline-flex items-center self-start md:self-auto px-4 py-2 rounded-full text-sm font-semibold ${
              invoice.status === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice.status === 'paid' ? '✓ Paid' : '⏱ Pending'}
            </div>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">FROM</h3>
              <div className="flex items-start gap-3">
                {company?.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt="Company logo" 
                    className="w-12 h-12 object-contain rounded-lg bg-white border border-gray-200 p-1"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: brandColor }}
                  >
                    🏢
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{company?.name || 'Christian Design Studio'}</p>
                  <p className="text-gray-600 text-sm">{company?.email || 'hello@christiandesign.com'}</p>
                  <p className="text-gray-600 text-sm">{company?.address || 'Port Harcourt, Rivers State, Nigeria'}</p>
                  {company?.phone && <p className="text-gray-600 text-sm">{company.phone}</p>}
                  {company?.website && <p className="text-gray-600 text-sm">{company.website}</p>}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">BILL TO</h3>
              <div>
                <p className="font-semibold text-gray-900">{invoice.client_name}</p>
                <p className="text-gray-600 text-sm">{invoice.client_email}</p>
                <p className="text-gray-600 text-sm">{invoice.client_address}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="border-b-2" style={{ borderColor: brandColor }}>
                <tr>
                  <th className="text-left py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="text-center py-3 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="text-right py-3 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-gray-900 text-center">{item.quantity}</td>
                    <td className="py-4 text-gray-900 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-4 text-gray-900 text-right font-semibold">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="font-semibold">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-xl font-bold" style={{ color: brandColor }}>
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              💲 Payment via USDC • 0% fees • 10-second settlement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
