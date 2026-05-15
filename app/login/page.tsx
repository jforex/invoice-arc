'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* ───────────────── LEFT: Form ───────────────── */}
      <div className="flex-1 flex flex-col px-6 lg:px-16 py-8 lg:py-12">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-auto">
          <Image
            src="/logo.png"
            alt="Inv"
            width={36}
            height={42}
            className="object-contain"
            priority
          />
          <span className="font-display text-2xl font-semibold tracking-tight text-coffee">
            Inv
          </span>
        </Link>

        {/* Form block */}
        <div className="w-full max-w-md mx-auto my-12 lg:my-auto animate-fade-up">
          <div className="mb-10">
            <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee mb-3">
              Welcome back
            </h1>
            <p className="text-coffee/60 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-coffee mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-coffee">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-coffee/60 hover:text-coffee transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee/40 hover:text-coffee transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-coffee text-cream font-medium py-4 rounded-2xl hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-coffee/60 mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-coffee font-medium hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-coffee/40 text-center lg:text-left mt-auto">
          © 2026 Inv. Powered by Arc Blockchain.
        </p>
      </div>

      {/* ───────────────── RIGHT: Brand panel ───────────────── */}
      <div className="hidden lg:flex flex-1 bg-coffee text-cream relative overflow-hidden p-16 items-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tan/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 bg-cream/10 border border-cream/15 text-cream px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-tan animate-pulse-dot" />
            Powered by Arc Blockchain
          </div>

          <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight mb-6">
            Get paid instantly in <span className="italic font-medium text-tan">USDC.</span>
          </h2>

          <p className="text-cream/70 text-lg leading-relaxed mb-10">
            Borderless payments powered by Arc blockchain — with built-in accounting for modern businesses.
          </p>

          {/* Mini stats card */}
          <div className="bg-coffee-deep border border-cream/5 rounded-3xl p-7">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-cream/50 text-sm mb-1">Last invoice</p>
                <p className="font-display text-2xl font-semibold">#1234</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-sage/30 text-sage border border-sage/30 text-xs font-medium px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-dot" />
                Paid
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-cream/5">
              <span className="text-cream/60 text-sm">Amount</span>
              <span className="font-display text-xl font-semibold">
                $2,500.00
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-cream/5">
              <span className="text-cream/60 text-sm">Settled in</span>
              <span className="font-medium text-tan">3 seconds</span>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-8">
            <div>
              <p className="font-display text-3xl font-semibold">$12.5K</p>
              <p className="text-cream/50 text-sm mt-1">This month</p>
            </div>
            <div className="w-px h-10 bg-cream/10" />
            <div>
              <p className="font-display text-3xl font-semibold">24</p>
              <p className="text-cream/50 text-sm mt-1">Invoices sent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}