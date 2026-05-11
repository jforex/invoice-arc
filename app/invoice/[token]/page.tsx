'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, getCurrency } from '@/lib/currency';
import {
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MapPin,
  Wallet,
  X,
  ExternalLink,
  Zap,
  Copy,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Invoice {
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
  notes?: string;
  currency: string;
  payment_method?: string;
  transaction_hash?: string;
}

interface Company {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  brand_color?: string;
  circle_wallet_address?: string;
}

export default function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [company, setCompany] = useState<Company>({});
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payerWalletId, setPayerWalletId] = useState('');
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [token]);

  const loadInvoice = async () => {
    try {
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('public_token', token)
        .single();

      if (invoiceData) {
        setInvoice(invoiceData);

        const { data: itemsData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoiceData.id);

        if (itemsData) setItems(itemsData);
      }

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .not('circle_wallet_address', 'is', null)
        .limit(1)
        .single();

      if (companyData) setCompany(companyData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!payerWalletId.trim()) {
      alert('Please enter your wallet ID');
      return;
    }

    if (!invoice) return;

    setPaying(true);
    setPaymentStatus('Initiating payment...');

    try {
      const response = await fetch('/api/pay-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          payerWalletId: payerWalletId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setPaymentStatus('Payment sent! Confirming on Arc blockchain...');
      setTxHash(data.transactionId);

      // Poll for confirmation
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkStatus = async () => {
        if (attempts >= maxAttempts) {
          setPaymentStatus('Payment submitted! Check explorer for status.');
          setPaying(false);
          loadInvoice();
          return;
        }

        try {
          const statusResponse = await fetch(
            `/api/pay-invoice?transactionId=${data.transactionId}`
          );
          const statusData = await statusResponse.json();

          if (statusData.state === 'COMPLETE' || statusData.state === 'CONFIRMED') {
            setPaymentStatus('✓ Payment confirmed on Arc blockchain!');
            setPaying(false);
            setTimeout(() => loadInvoice(), 1500);
            return;
          } else if (statusData.state === 'FAILED' || statusData.state === 'CANCELED') {
            setPaymentStatus('✗ Payment failed. Please try again.');
            setPaying(false);
            return;
          }

          attempts++;
          setTimeout(checkStatus, 2000);
        } catch (err) {
          console.error('Status check error:', err);
          attempts++;
          setTimeout(checkStatus, 2000);
        }
      };

      setTimeout(checkStatus, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus(`Error: ${error.message}`);
      setPaying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const brandColor = company.brand_color || '#3b82f6';
  const isPaid = invoice?.status === 'paid';

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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">This invoice link is invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Banner */}
        {isPaid && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">Payment Received</h3>
              <p className="text-sm text-green-700">
                This invoice has been paid in full
                {invoice.transaction_hash && (
                  <>
                    {' • '}
                    <a
                      href={`https://testnet.arcscan.app/tx/${invoice.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline hover:text-green-800"
                    >
                      View transaction
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className="p-8 text-white relative"
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {company.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-16 w-16 object-contain bg-white rounded-lg p-2"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold">{company.name || 'Invoice'}</h1>
                  {company.email && (
                    <p className="text-white/80 text-sm mt-1">{company.email}</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-white/80 text-sm">Invoice</p>
                <p className="text-2xl font-bold">{invoice.invoice_number}</p>
                <p className="text-white/80 text-sm mt-1">
                  Issued {formatDate(invoice.issue_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Client & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-gray-500 mb-2 font-semibold tracking-wider">BILL TO</p>
                <p className="font-bold text-gray-900">{invoice.client_name}</p>
                <p className="text-gray-600 text-sm">{invoice.client_email}</p>
                <p className="text-gray-600 text-sm">{invoice.client_address}</p>
              </div>

              <div className="md:text-right">
                <p className="text-xs text-gray-500 mb-2 font-semibold tracking-wider">
                  DUE DATE
                </p>
                <p className="font-bold text-gray-900">{formatDate(invoice.due_date)}</p>
                <div className="mt-3">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-xs font-semibold text-gray-600 tracking-wider">
                      DESCRIPTION
                    </th>
                    <th className="text-center py-3 text-xs font-semibold text-gray-600 tracking-wider">
                      QTY
                    </th>
                    <th className="text-right py-3 text-xs font-semibold text-gray-600 tracking-wider">
                      PRICE
                    </th>
                    <th className="text-right py-3 text-xs font-semibold text-gray-600 tracking-wider">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-4 text-gray-900">{item.description}</td>
                      <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-700">
                        {formatCurrency(item.price, invoice.currency || 'USD')}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.amount, invoice.currency || 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.subtotal, invoice.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.tax, invoice.currency || 'USD')}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold" style={{ color: brandColor }}>
                    {formatCurrency(invoice.total, invoice.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8 bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold tracking-wider">NOTES</p>
                <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Payment Section */}
            {!isPaid && company.circle_wallet_address && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Pay Instantly with USDC
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Sub-second settlement on Arc Testnet • 0% fees
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPayModal(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Pay {formatCurrency(invoice.total, invoice.currency || 'USD')} with USDC
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  🧪 Currently on Arc Testnet • Mainnet launching 2026
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by InvFlow • Arc Blockchain
        </p>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pay with USDC</h2>
                <p className="text-sm text-gray-600 mt-1">
                  on Arc Testnet
                </p>
              </div>
              <button
                onClick={() => !paying && setShowPayModal(false)}
                disabled={paying}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!paymentStatus ? (
              <>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Amount:</strong>{' '}
                    {formatCurrency(invoice.total, invoice.currency || 'USD')}
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    <strong>To:</strong> {company.name}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Circle Wallet ID
                  </label>
                  <input
                    type="text"
                    value={payerWalletId}
                    onChange={(e) => setPayerWalletId(e.target.value)}
                    placeholder="e.g., 8ae97407-c6f5-5b27-80df-..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 For testing: Get a wallet ID from{' '}
                    <a
                      href="https://console.circle.com/wallets/dev/wallets"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Circle Console
                    </a>
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paying || !payerWalletId.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? 'Processing...' : 'Send Payment'}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                {paymentStatus.includes('✓') ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : paymentStatus.includes('Error') || paymentStatus.includes('✗') ? (
                  <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                ) : (
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                )}

                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {paymentStatus}
                </p>

                {txHash && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID:</p>
                    <p className="text-xs font-mono text-gray-700 break-all">{txHash}</p>
                  </div>
                )}

                {paymentStatus.includes('✓') && (
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Done
                  </button>
                )}

                {(paymentStatus.includes('Error') || paymentStatus.includes('✗')) && (
                  <button
                    onClick={() => {
                      setPaymentStatus('');
                      setTxHash('');
                    }}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
