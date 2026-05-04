'use client';

import { useEffect, useState, use } from 'react';
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

export default function PublicInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      // Fetch invoice by public token
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('public_token', token)
        .single();

      if (invoiceError || !invoiceData) {
        setError('Invoice not found');
        setLoading(false);
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
      console.error('Error fetching invoice:', err);
      setError('An error occurred while loading the invoice');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invoice Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The invoice you are looking for does not exist or the link may be invalid.'}</p>
        </div>
      </div>
    );
  }

  const brandColor = company?.brand_color || '#2563eb';
  const companyName = company?.name || 'Christian Design Studio';
  const companyEmail = company?.email || 'hello@christiandesign.com';
  const companyAddress = company?.address || 'Port Harcourt, Rivers State, Nigeria';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div 
            className="px-8 py-6"
            style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {company?.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt="Company logo" 
                    className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{invoice.invoice_number}</h1>
                  <p className="text-white opacity-90">Invoice from {companyName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status === 'paid' ? '✓ Paid' : '⏱ Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-slate-500 mb-1">Issue Date</p>
                <p className="text-lg font-semibold text-slate-900">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Due Date</p>
                <p className="text-lg font-semibold text-slate-900">{formatDate(invoice.due_date)}</p>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3">FROM</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{companyName}</p>
                  <p className="text-slate-600">{companyEmail}</p>
                  <p className="text-slate-600">{companyAddress}</p>
                  {company?.phone && <p className="text-slate-600">{company.phone}</p>}
                  {company?.website && <p className="text-slate-600">{company.website}</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3">BILL TO</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{invoice.client_name}</p>
                  <p className="text-slate-600">{invoice.client_email}</p>
                  <p className="text-slate-600">{invoice.client_address}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 text-center">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="font-semibold">{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-xl font-bold" style={{ color: brandColor }}>
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
                <p className="text-slate-600">{invoice.notes}</p>
              </div>
            )}

            {/* Payment Info */}
            <div 
              className="border rounded-lg p-6 mb-6"
              style={{ 
                backgroundColor: `${brandColor}10`,
                borderColor: `${brandColor}30`
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl" style={{ color: brandColor }}>💳</div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: brandColor }}>Fast Payment Options</h3>
                  <p className="text-sm" style={{ color: brandColor }}>Pay with USDC • 0% fees • 10-second settlement</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-opacity duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>{companyName} • {companyAddress}</p>
          <p className="mt-1">{companyEmail}</p>
        </div>
      </div>
    </div>
  );
}
