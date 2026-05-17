'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatCurrency } from '@/lib/currency';
import {
  Inbox,
  CheckCircle2,
  Clock,
  Zap,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  Shield,
} from 'lucide-react';

export default function InboxPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Payment state
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email);

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('invoices')
      .select('*, companies!inner(name, email, circle_wallet_address)')
      .ilike('client_email', user.email)
      .order('created_at', { ascending: false });

    if (company) {
      query = query.neq('company_id', company.id);
    }

    const { data } = await query;
    if (data) setInvoices(data);
    setLoading(false);
  };

  const handleQuickPay = async (invoice: any) => {
    setPayingInvoice(invoice);
    setPaying(true);
    setPaymentStatus('Initializing wallet...');

    try {
      const initResponse = await fetch('/api/init-user', { method: 'POST' });
      const initData = await initResponse.json();
      if (!initResponse.ok) throw new Error(initData.error);

      if (!initData.pinSet) {
        setPaymentStatus('You need to set up your wallet first. Go to Wallet page.');
        setPaying(false);
        return;
      }

      setPaymentStatus('Creating payment...');

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

      setPaymentStatus('Enter your PIN to authorize...');

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
          setPaymentStatus(`Payment failed: ${error.message || 'Unknown error'}`);
          setPaying(false);
          return;
        }

        if (result?.status === 'COMPLETE') {
          setPaymentStatus('Payment sent. Confirming on Arc...');

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
            loadInbox();
            setPaying(false);
            setPayingInvoice(null);
            setPaymentStatus('');
          }, 2000);
        }
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus(`Error: ${error.message}`);
      setPaying(false);
    }
  };

  const closePayModal = () => {
    if (!paying) {
      setPayingInvoice(null);
      setPaymentStatus('');
    }
  };

  const isPaid = (inv: any) => inv.status === 'paid';
  const isEligible = (inv: any) => inv.auto_paid && !isPaid(inv);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const isError = paymentStatus.includes('Error') || paymentStatus.includes('failed') || paymentStatus.includes('set up');
  const isSuccess = paymentStatus.includes('confirmed');

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Loading inbox...</span>
        </div>
      </div>
    );
  }

  const eligible = invoices.filter(isEligible);
  const regular = invoices.filter((inv) => !isEligible(inv));

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">Received</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Inbox
        </h1>
        <p className="text-coffee/60 mt-2">
          Invoices sent to {userEmail} from other InvFlow users
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-tan-soft rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Inbox className="w-6 h-6 text-coffee" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl font-semibold text-coffee mb-2">
            No invoices received
          </h3>
          <p className="text-coffee/60 max-w-sm mx-auto">
            When another InvFlow user sends you an invoice, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {eligible.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-deep" />
                <h2 className="font-display text-lg font-semibold text-coffee">
                  Auto-Pay Ready
                </h2>
                <span className="text-xs bg-amber/20 text-amber-deep px-2 py-0.5 rounded-full font-medium">
                  {eligible.length}
                </span>
              </div>
              <p className="text-sm text-coffee/60 mb-4">
                These invoices match your auto-pay rules. One-click to confirm payment with PIN.
              </p>

              <div className="space-y-3">
                {eligible.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-coffee text-cream rounded-3xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber" />
                          <span className="text-xs uppercase tracking-wider text-cream/60">
                            Auto-pay eligible
                          </span>
                        </div>
                        <h3 className="font-display text-2xl font-semibold mb-1">
                          {invoice.invoice_number}
                        </h3>
                        <p className="text-sm text-cream/70">
                          From {invoice.companies?.name} · Due{' '}
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-display text-3xl font-semibold">
                            {formatCurrency(invoice.total, invoice.currency || 'USD')}
                          </p>
                          <p className="text-xs text-cream/60">USDC · Arc</p>
                        </div>
                        <button
                          onClick={() => handleQuickPay(invoice)}
                          disabled={paying}
                          className="inline-flex items-center gap-2 bg-cream text-coffee px-5 py-3 rounded-xl text-sm font-medium hover:bg-tan-soft transition-colors disabled:opacity-50"
                        >
                          Confirm & Pay
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {regular.length > 0 && (
            <div>
              {eligible.length > 0 && (
                <h2 className="font-display text-lg font-semibold text-coffee mb-4">
                  All Invoices
                </h2>
              )}
              <div className="space-y-3">
                {regular.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-cream-soft border border-coffee/5 rounded-2xl p-5 hover:border-coffee/15 hover:shadow-lg hover:shadow-coffee/5 transition-all flex items-center justify-between flex-wrap gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                          isPaid(invoice) ? 'bg-sage/30' : 'bg-tan-soft'
                        }`}
                      >
                        {isPaid(invoice) ? (
                          <CheckCircle2 className="w-5 h-5 text-sage-deep" />
                        ) : (
                          <Clock className="w-5 h-5 text-coffee" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-coffee">
                          {invoice.invoice_number}
                        </h3>
                        <p className="text-sm text-coffee/70">
                          From {invoice.companies?.name || 'Unknown sender'}
                        </p>
                        <p className="text-xs text-coffee/50 mt-1">
                          Due {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-display text-xl font-semibold text-coffee">
                          {formatCurrency(invoice.total, invoice.currency || 'USD')}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${
                            isPaid(invoice)
                              ? 'bg-sage/40 text-sage-deep'
                              : 'bg-amber/30 text-amber-deep'
                          }`}
                        >
                          {isPaid(invoice) ? 'Paid' : 'Pending'}
                        </span>
                      </div>

                      {!isPaid(invoice) && (
                        <Link
                          href={`/invoice/${invoice.public_token}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 bg-coffee text-cream px-4 py-2 rounded-xl text-sm font-medium hover:bg-coffee-deep transition-colors"
                        >
                          Pay
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inline payment modal */}
      {payingInvoice && (
        <div
          className="fixed inset-0 bg-coffee/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-up"
          onClick={closePayModal}
        >
          <div
            className="bg-cream rounded-3xl max-w-md w-full p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!paymentStatus ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-coffee">
                      Confirm Payment
                    </h2>
                    <p className="text-sm text-coffee/60 mt-1">
                      Arc Testnet · Auto-pay match
                    </p>
                  </div>
                  <button
                    onClick={closePayModal}
                    className="p-2 text-coffee/60 hover:text-coffee rounded-xl hover:bg-coffee/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-cream-soft border border-coffee/5 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">From</span>
                    <span className="font-medium text-coffee">
                      {payingInvoice.companies?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Invoice</span>
                    <span className="font-medium text-coffee">
                      {payingInvoice.invoice_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-coffee/10">
                    <span className="text-coffee/60 text-sm">Total</span>
                    <span className="font-display text-2xl font-semibold text-coffee">
                      {formatCurrency(payingInvoice.total, payingInvoice.currency || 'USD')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-tan-soft/50 border border-tan/40 rounded-2xl p-4 mb-6">
                  <Shield className="w-4 h-4 text-coffee flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <p className="text-xs text-coffee/80 leading-relaxed">
                    You will be asked for your 6-digit PIN to authorize this payment.
                  </p>
                </div>

                <button
                  onClick={() => handleQuickPay(payingInvoice)}
                  className="w-full bg-coffee text-cream font-medium py-4 rounded-2xl hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Authorize Payment
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

                {isError && (
                  <button
                    onClick={closePayModal}
                    className="inline-flex items-center gap-2 bg-coffee text-cream px-6 py-3 rounded-2xl font-medium hover:bg-coffee-deep transition-all"
                  >
                    Close
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
