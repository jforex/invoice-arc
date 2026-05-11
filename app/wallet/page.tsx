'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Shield,
} from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [userToken, setUserToken] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [pinSet, setPinSet] = useState(false);
  const [wallet, setWallet] = useState<{ id: string; address: string } | null>(null);
  const [balance, setBalance] = useState('0');
  const [copied, setCopied] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const [sdk, setSdk] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load the Circle Web SDK
      const { W3SSdk } = await import('@circle-fin/w3s-pw-web-sdk');
      
      const response = await fetch('/api/init-user', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUserToken(data.userToken);
      setEncryptionKey(data.encryptionKey);
      setPinSet(data.pinSet);

      // Initialize the SDK
      const sdkInstance = new W3SSdk({
        appSettings: {
          appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
        },
      });

      sdkInstance.setAuthentication({
        userToken: data.userToken,
        encryptionKey: data.encryptionKey,
      });

      setSdk(sdkInstance);
      setSdkReady(true);

      if (data.pinSet) {
        await loadWallets(data.userToken);
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
    }
  };

  const setupPin = async () => {
    if (!sdk) {
      alert('SDK not ready');
      return;
    }

    setSetupInProgress(true);

    try {
      // Get challenge ID from backend
      const response = await fetch('/api/setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Execute challenge with SDK (shows PIN setup UI)
      sdk.execute(data.challengeId, async (error: any, result: any) => {
        if (error) {
          console.error('Challenge error:', error);
          alert(`PIN setup failed: ${error.message || 'Unknown error'}`);
          setSetupInProgress(false);
          return;
        }

        if (result?.status === 'COMPLETE') {
          // PIN set successfully, wallet created
          setPinSet(true);
          await loadWallets(userToken);
          alert('✓ Wallet created successfully!');
        }
        setSetupInProgress(false);
      });
    } catch (error: any) {
      console.error('Setup error:', error);
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

  const refreshBalance = async () => {
    if (userToken) {
      await loadWallets(userToken);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">💰 My Wallet</h1>
          <p className="text-gray-600 mt-1">
            Receive USDC payments on Arc blockchain
          </p>
        </div>

        {!pinSet ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Set Up Your Wallet
            </h2>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              You'll set a 6-digit PIN to secure your wallet. This PIN is required for all transactions.
            </p>
            <p className="text-sm text-amber-600 mb-8 max-w-md mx-auto">
              ⚠️ Remember this PIN - it cannot be reset!
            </p>
            <button
              onClick={setupPin}
              disabled={setupInProgress || !sdkReady}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 inline-flex items-center gap-2"
            >
              {setupInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Set PIN & Create Wallet
                </>
              )}
            </button>
          </div>
        ) : wallet ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Total Balance</p>
                  <p className="text-5xl font-bold">${parseFloat(balance).toFixed(2)}</p>
                  <p className="text-blue-200 text-sm mt-1">USDC on Arc Testnet</p>
                </div>
                <button
                  onClick={refreshBalance}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-200 text-xs font-medium mb-1">WALLET ADDRESS</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm break-all">{wallet.address}</p>
                  <button
                    onClick={copyAddress}
                    className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-300" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚰</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Get Free Testnet USDC
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get free testnet USDC from Circle's faucet (1 USDC per day).
                  </p>
                  <a
                    href={`https://faucet.circle.com/?address=${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium"
                  >
                    Open Circle Faucet
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    View on Arc Explorer
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    See all transactions on Arc Testnet blockchain explorer.
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium"
                  >
                    Open Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Loading wallet...</p>
            <button
              onClick={() => loadWallets(userToken)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
