'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';
import {
  CheckCircle2,
  Clock,
  Wallet,
  X,
  Zap,
  Building2,
  Shield,
  AlertCircle,
  Loader2,
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
  company_id: string;
}

interface Company {
  name?: string;
  email?: string;
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
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

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

        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', invoiceData.company_id)
          .single();

        if (companyData) setCompany(companyData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;

    setPaying(true);
    setPaymentStatus('Initializing your wallet…');

    try {
      const initResponse = await fetch('/api/init-user', { method: 'POST' });
      const initData = await initResponse.json();
      if (!initResponse.ok) throw new Error(initData.error);

      if (!initData.pinSet) {
        setPaymentStatus(
          'You need to set up your wallet first. Visit /dashboard/wallet to create one.'
        );
        setPaying(false);
        return;
      }

      setPaymentStatus('Creating payment…');

      const payResponse = await fetch('/api/pay-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          payerUserId: initData.userId,
        }),
      });

      const payData = await payResponse.json();
      if (!payResponse.ok) throw new Error(payData.error);

      setPaymentStatus('Authorize the payment with your PIN…');

      const { W3SSdk } = await import('@circle-fin/w3s-pw-web-sdk');
      const sdk = new W3SSdk({
        appSettings: {
          appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
        },
      });

      sdk.setAuthentication({
        userToken: payData.userToken,
        encryptionKey: payData.encryptionKey,
      });

      sdk.execute(payData.challengeId, async (error: any, result: any) => {
        if (error) {
          setPaymentStatus(
            `Payment failed: ${error.message || 'Unknown error'}`
          );
          setPaying(false);
          return;
        }

        if (result?.status === 'COMPLETE') {
          setPaymentStatus('Payment sent · Confirming on Arc blockchain…');

          await fetch('/api/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId: invoice.id,
              transactionId: result.data?.transactionId || result.type,
            }),
          });

          setPaymentStatus('Payment confirmed');
          setTimeout(() => {
            loadInvoice();
            setPaying(false);
          }, 2000);
        }
      });
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

  const isPaid = invoice?.status === 'paid';
  const isError =
    paymentStatus.includes('Error') ||
    paymentStatus.includes('failed') ||
    paymentStatus.toLowerCase().includes('need to set');
  const isSuccess =
    paymentStatus.includes('confirmed') || paymentStatus.includes('sent');

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading invoice…</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-red-600" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-coffee mb-3">
            Invoice Not Found
          </h1>
          <p className="text-coffee/60">
            This invoice link is invalid or has expired. Please contact the
            sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-coffee/5 bg-cream/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Inv"
              width={28}
              height={32}
              className="object-contain"
            />
            <span className="font-display text-xl font-semibold tracking-tight text-coffee">
              Inv
            </span>
          </Link>
          <span className="text-xs text-coffee/50 hidden sm:block">
            Secure invoice · Arc Blockchain
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
        {isPaid && (
          <div className="bg-sage/30 border border-sage-deep/20 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 bg-sage-deep rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-cream" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-semibold text-coffee">
                Payment Received
              </p>
              <p className="text-sm text-coffee/70">
                This invoice has been paid in full
              </p>
            </div>
          </div>
        )}

        <div className="bg-cream-soft border border-coffee/5 rounded-3xl overflow-hidden shadow-xl shadow-coffee/5">
          <div className="bg-coffee text-cream px-8 lg:px-12 py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-start justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                {company.logo_url ? (
                  <div className="w-14 h-14 bg-cream rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={company.logo_url}
                      alt={company.name || 'Company'}
                      width={56}
                      height={56}
                      className="object-contain max-h-full max-w-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-cream/10 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-cream" strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    {company.name || 'Invoice'}
                  </h1>
                  {company.email && (
                    <p className="text-cream/70 text-sm mt-0.5">
                      {company.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-cream/50 text-xs uppercase tracking-wider mb-1">
                  Invoice
                </p>
                <p className="font-display text-2xl font-semibold">
                  {invoice.invoice_number}
                </p>
                <p className="text-cream/60 text-sm mt-0.5">
                  Issued {formatDate(invoice.issue_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-3">
                  Bill To
                </p>
                <p className="font-display font-semibold text-coffee text-lg">
                  {invoice.client_name}
                </p>
                <p className="text-coffee/60 text-sm">{invoice.client_email}</p>
                {invoice.client_address && (
                  <p className="text-coffee/60 text-sm whitespace-pre-line">
                    {invoice.client_address}
                  </p>
                )}
              </div>
              <div className="md:text-right">
                <p className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-3">
                  Due Date
                </p>
                <p className="font-display font-semibold text-coffee text-lg">
                  {formatDate(invoice.due_date)}
                </p>
                <div className="mt-3">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 bg-sage/40 text-sage-deep border border-sage-deep/20 px-3 py-1 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber/30 text-amber-deep border border-amber-deep/20 px-3 py-1 rounded-full text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-coffee/10">
                      <th className="text-left py-3 px-4 lg:px-0 text-xs font-medium text-coffee/50 uppercase tracking-wider">Description</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-coffee/50 uppercase tracking-wider">Qty</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-coffee/50 uppercase tracking-wider">Price</th>
                      <th className="text-right py-3 px-4 lg:px-0 text-xs font-medium text-coffee/50 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-coffee/5 last:border-b-0">
                        <td className="py-4 px-4 lg:px-0 text-coffee">{item.description}</td>
                        <td className="py-4 px-4 text-coffee/70 text-center">{item.quantity}</td>
                        <td className="py-4 px-4 text-coffee/70 text-right">{formatCurrency(item.price, invoice.currency || 'USD')}</td>
                        <td className="py-4 px-4 lg:px-0 text-right">
                          <span className="font-display font-semibold text-coffee">{formatCurrency(item.amount, invoice.currency || 'USD')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee/60">Subtotal</span>
                  <span className="font-medium text-coffee">{formatCurrency(invoice.subtotal, invoice.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee/60">Tax</span>
                  <span className="font-medium text-coffee">{formatCurrency(invoice.tax, invoice.currency || 'USD')}</span>
                </div>
                <div className="border-t border-coffee/10 pt-3 flex justify-between items-baseline">
                  <span className="text-coffee/70 font-medium">Total</span>
                  <span className="font-display text-3xl font-semibold text-coffee">{formatCurrency(invoice.total, invoice.currency || 'USD')}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="bg-cream rounded-2xl border border-coffee/5 p-5 mb-8">
                <p className="text-xs font-medium text-coffee/50 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-coffee/80 leading-relaxed whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {!isPaid && company.circle_wallet_address && (
              <div className="bg-coffee text-cream rounded-3xl p-7 lg:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-tan rounded-2xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-coffee fill-coffee" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold">Pay Instantly with USDC</h3>
                      <p className="text-cream/70 text-sm mt-1">Sub-second settlement · 0% fees · Arc Testnet</p>
                    </div>
                  </div>

                  <button onClick={() => setShowPayModal(true)} className="group w-full bg-cream text-coffee font-medium py-4 rounded-2xl hover:bg-tan-soft transition-all hover:shadow-xl flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Pay {formatCurrency(invoice.total, invoice.currency || 'USD')} with USDC
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-cream/60">
                    <Shield className="w-3 h-3" />
                    Currently on Arc Testnet
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-coffee/50">
          <p>Powered by Inv · Arc Blockchain</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-coffee transition-colors">About Inv</Link>
            <span className="w-1 h-1 bg-coffee/30 rounded-full" />
            <a href="#" className="hover:text-coffee transition-colors">Terms</a>
            <span className="w-1 h-1 bg-coffee/30 rounded-full" />
            <a href="#" className="hover:text-coffee transition-colors">Privacy</a>
          </div>
        </div>
      </main>

      {showPayModal && (
        <div className="fixed inset-0 bg-coffee/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-up" onClick={() => !paying && setShowPayModal(false)}>
          <div className="bg-cream rounded-3xl max-w-md w-full p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {!paymentStatus ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-coffee">Pay with USDC</h2>
                    <p className="text-sm text-coffee/60 mt-1">Arc Testnet · Secure settlement</p>
                  </div>
                  <button onClick={() => setShowPayModal(false)} disabled={paying} className="p-2 text-coffee/60 hover:text-coffee rounded-xl hover:bg-coffee/5 transition-colors disabled:opacity-50" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-cream-soft border border-coffee/5 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Recipient</span>
                    <span className="font-medium text-coffee">{company.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Invoice</span>
                    <span className="font-medium text-coffee">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-coffee/10">
                    <span className="text-coffee/60 text-sm">Total</span>
                    <span className="font-display text-2xl font-semibold text-coffee">{formatCurrency(invoice.total, invoice.currency || 'USD')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-tan-soft/50 border border-tan/40 rounded-2xl p-4 mb-6">
                  <Shield className="w-4 h-4 text-coffee flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="text-xs text-coffee/80 leading-relaxed">You&apos;ll be asked to enter your 6-digit wallet PIN to authorize this payment. Funds settle in seconds on Arc blockchain.</p>
                </div>

                <button onClick={handlePayment} disabled={paying} className="w-full bg-coffee text-cream font-medium py-4 rounded-2xl hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {paying ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Send Payment
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mb-6">
                  {isSuccess ? (
                    <div className="w-20 h-20 bg-sage/30 rounded-3xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-sage-deep" strokeWidth={1.5} />
                    </div>
                  ) : isError ? (
                    <div className="w-20 h-20 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-center mx-auto">
                      <X className="w-9 h-9 text-red-600" strokeWidth={1.5} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-coffee rounded-3xl flex items-center justify-center mx-auto">
                      <Loader2 className="w-8 h-8 text-cream animate-spin" />
                    </div>
                  )}
                </div>

                <h3 className="font-display text-2xl font-semibold text-coffee mb-2">
                  {isSuccess ? 'Payment Complete' : isError ? 'Payment Failed' : 'Processing'}
                </h3>
                <p className="text-coffee/70 mb-6 max-w-xs mx-auto">{paymentStatus}</p>

                {isSuccess && paymentStatus.includes('confirmed') && (
                  <button onClick={() => { setShowPayModal(false); setPaymentStatus(''); }} className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-2xl font-medium hover:bg-coffee-deep transition-all">
                    Done
                  </button>
                )}

                {isError && (
                  <button onClick={() => setPaymentStatus('')} className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-2xl font-medium hover:bg-coffee-deep transition-all">
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