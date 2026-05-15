'use client';

import { useEffect, useState } from 'react';
import {
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Shield,
  Wallet as WalletIcon,
  Droplet,
  ScanLine,
  AlertTriangle,
} from 'lucide-react';

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [userToken, setUserToken] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [pinSet, setPinSet] = useState(false);
  const [wallet, setWallet] = useState<{ id: string; address: string } | null>(
    null
  );
  const [balance, setBalance] = useState('0');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const { W3SSdk } = await import('@circle-fin/w3s-pw-web-sdk');

      const response = await fetch('/api/init-user', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUserToken(data.userToken);
      setEncryptionKey(data.encryptionKey);
      setPinSet(data.pinSet);

      const sdkInstance = new W3SSdk({
        appSettings: { appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '' },
      });

      sdkInstance.setAuthentication({
        userToken: data.userToken,
        encryptionKey: data.encryptionKey,
      });

      setSdk(sdkInstance);
      setSdkReady(true);

      if (data.pinSet) {
        console.log('PIN is set, loading wallets...');
        await loadWallets(data.userToken);
        
      } else {
        console.log('PIN NOT set according to API:', data);  
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Init error:', error);
      alert(error.message || 'Failed to initialize');
      setLoading(false);
    }
  };

  const loadWallets = async (token: string) => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/get-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken: token }),
      });
      const data = await response.json();
      if (data.primaryWallet) {
        setWallet(data.primaryWallet);
        setBalance(data.balance || '0');
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setupPin = async () => {
    if (!sdk) return;
    setSetupInProgress(true);

    try {
      const response = await fetch('/api/setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      sdk.execute(data.challengeId, async (error: any, result: any) => {
        if (error) {
          alert(`PIN setup failed: ${error.message}`);
          setSetupInProgress(false);
          return;
        }

        if (result?.status === 'COMPLETE') {
          setPinSet(true);
          await loadWallets(userToken);
          alert('Wallet created successfully');
        }
        setSetupInProgress(false);
      });
    } catch (error: any) {
      alert(error.message || 'Setup failed');
      setSetupInProgress(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 10)}…${addr.slice(-8)}`;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-coffee/60">
          <div className="w-2 h-2 bg-coffee rounded-full animate-pulse-dot" />
          <span className="text-sm">Connecting your wallet…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Header */}
      <div className="mb-10">
        <p className="text-coffee/60 text-sm mb-1.5">Payments</p>
        <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
          Wallet
        </h1>
      </div>

      {!pinSet ? (
        /* ──────────────── PIN Setup ──────────────── */
        <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-10 lg:p-16 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-coffee rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Shield className="w-8 h-8 text-cream" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-3xl font-semibold text-coffee mb-3">
            Set Up Your Wallet
          </h2>
          <p className="text-coffee/70 mb-8 max-w-md mx-auto leading-relaxed">
            Create a 6-digit PIN to secure your wallet. Your USDC payments will
            settle directly to this address.
          </p>

          <div className="inline-flex items-start gap-3 bg-amber/15 border border-amber-deep/20 text-amber-deep px-5 py-4 rounded-2xl mb-8 max-w-md text-left">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <span className="font-semibold">Important:</span> Your PIN cannot
              be reset. Memorize it or store it somewhere safe.
            </p>
          </div>

          <div>
            <button
              onClick={setupPin}
              disabled={setupInProgress || !sdkReady}
              className="inline-flex items-center gap-2 bg-coffee text-cream px-7 py-4 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupInProgress ? (
                <>
                  <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                  Setting up…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Set PIN & Create Wallet
                </>
              )}
            </button>
          </div>
        </div>
      ) : wallet ? (
        /* ──────────────── Wallet Active ──────────────── */
        <div className="space-y-5">
          {/* Balance card */}
          <div className="relative bg-coffee text-cream rounded-3xl p-8 lg:p-10 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-tan/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cream/10 rounded-xl flex items-center justify-center">
                    <WalletIcon
                      className="w-4 h-4 text-cream"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-cream/60 text-xs uppercase tracking-wider">
                      Available Balance
                    </p>
                    <p className="text-cream text-sm font-medium mt-0.5">
                      USDC · Arc Testnet
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => loadWallets(userToken)}
                  disabled={refreshing}
                  className="p-2.5 bg-cream/10 hover:bg-cream/20 rounded-xl transition-colors disabled:opacity-50"
                  aria-label="Refresh balance"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              <div className="mb-8">
                <p className="font-display text-6xl lg:text-7xl font-semibold tracking-tight">
                  ${parseFloat(balance).toFixed(2)}
                </p>
              </div>

              {/* Address row */}
              <div className="bg-coffee-deep/60 border border-cream/5 rounded-2xl p-5">
                <p className="text-cream/50 text-xs uppercase tracking-wider mb-2">
                  Wallet Address
                </p>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm text-cream truncate">
                    <span className="hidden sm:inline">{wallet.address}</span>
                    <span className="sm:hidden">
                      {truncateAddress(wallet.address)}
                    </span>
                  </p>
                  <button
                    onClick={copyAddress}
                    className="flex-shrink-0 inline-flex items-center gap-2 bg-cream/10 hover:bg-cream/20 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-sage" />
                        <span className="text-sage">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Faucet */}
            <a
              href={`https://faucet.circle.com/?address=${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-cream-soft border border-coffee/5 hover:border-coffee/15 rounded-3xl p-7 transition-all hover:shadow-lg hover:shadow-coffee/5"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 bg-tan-soft rounded-xl flex items-center justify-center">
                  <Droplet
                    className="w-4 h-4 text-coffee"
                    strokeWidth={1.75}
                  />
                </div>
                <ExternalLink className="w-4 h-4 text-coffee/40 group-hover:text-coffee group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="font-display text-xl font-semibold text-coffee mb-2">
                Testnet Faucet
              </h3>
              <p className="text-coffee/60 text-sm leading-relaxed">
                Get free testnet USDC from Circle&apos;s faucet to test payments.
              </p>
            </a>

            {/* Explorer */}
            
            <a
              href={`https://testnet.arcscan.app/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-cream-soft border border-coffee/5 hover:border-coffee/15 rounded-3xl p-7 transition-all hover:shadow-lg hover:shadow-coffee/5"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 bg-tan-soft rounded-xl flex items-center justify-center">
                  <ScanLine
                    className="w-4 h-4 text-coffee"
                    strokeWidth={1.75}
                  />
                </div>
                <ExternalLink className="w-4 h-4 text-coffee/40 group-hover:text-coffee group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="font-display text-xl font-semibold text-coffee mb-2">
                Arc Explorer
              </h3>
              <p className="text-coffee/60 text-sm leading-relaxed">
                View your transactions and on-chain activity on Arc Testnet.
              </p>
            </a>
          </div>

          {/* Security note */}
          <div className="bg-cream-soft border border-coffee/5 rounded-3xl p-6 flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-sage/30 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-sage-deep" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-medium text-coffee text-sm mb-1">
                Your wallet is secured by your PIN
              </p>
              <p className="text-coffee/60 text-sm leading-relaxed">
                Every payment requires your 6-digit PIN. Your keys are encrypted
                and never leave your device unencrypted.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}