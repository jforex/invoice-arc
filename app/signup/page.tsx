'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-client';
import {
  Mail,
  Lock,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError('Signup failed');
      setLoading(false);
      return;
    }

    // Create company for this user
    const { error: companyError } = await supabase.from('companies').insert({
      user_id: authData.user.id,
      name: companyName,
      email: email,
    });

    if (companyError) {
      setError(`Company setup failed: ${companyError.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* ───────────────── LEFT: Brand panel ───────────────── */}
      <div className="hidden lg:flex flex-1 bg-coffee text-cream relative overflow-hidden p-16 items-center">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-tan/10 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 bg-cream/10 border border-cream/15 text-cream px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-tan animate-pulse-dot" />
            Free to start
          </div>

          <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight mb-6">
            Start invoicing in <span className="italic font-medium text-tan">seconds.</span>
          </h2>

          <p className="text-cream/70 text-lg leading-relaxed mb-10">
            Join modern businesses using Inv for instant USDC payments and seamless accounting.
          </p>

          {/* Benefits list */}
          <ul className="space-y-4">
            {[
              'Get paid in seconds, not days',
              'No international transfer fees',
              'Automated bookkeeping built-in',
              'Bank-grade security on Arc blockchain',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tan flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-coffee" strokeWidth={3} />
                </div>
                <span className="text-cream/90">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 pt-8 border-t border-cream/10">
            <p className="text-cream/50 text-sm mb-3">Trusted by businesses worldwide</p>
            <div className="flex items-center gap-8">
              <div>
                <p className="font-display text-2xl font-semibold">3s</p>
                <p className="text-cream/50 text-xs mt-1">Avg payment</p>
              </div>
              <div className="w-px h-8 bg-cream/10" />
              <div>
                <p className="font-display text-2xl font-semibold">0%</p>
                <p className="text-cream/50 text-xs mt-1">Hidden fees</p>
              </div>
              <div className="w-px h-8 bg-cream/10" />
              <div>
                <p className="font-display text-2xl font-semibold">24/7</p>
                <p className="text-cream/50 text-xs mt-1">Always on</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────── RIGHT: Form ───────────────── */}
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
              Create your account
            </h1>
            <p className="text-coffee/60 text-lg">
              Start sending invoices and getting paid today
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-coffee mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee/40" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company"
                  className="w-full pl-11 pr-4 py-3.5 bg-cream-soft border border-coffee/10 rounded-2xl text-coffee placeholder:text-coffee/30 focus:outline-none focus:border-coffee focus:bg-cream transition-all"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-coffee mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              <p className="text-xs text-coffee/50 mt-2 ml-1">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-coffee text-cream font-medium py-4 rounded-2xl hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 bg-cream rounded-full animate-pulse-dot" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-coffee/50 text-center pt-2">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-coffee hover:underline underline-offset-2">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-coffee hover:underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <p className="text-center text-sm text-coffee/60 mt-8">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-coffee font-medium hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-coffee/40 text-center lg:text-left mt-auto">
          © 2026 Inv. Powered by Arc Blockchain.
        </p>
      </div>
    </div>
  );
}