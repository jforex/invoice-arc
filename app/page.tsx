'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  CreditCard,
  Globe,
  BarChart3,
  Bell,
  Repeat,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
  X,
  Wallet,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: FileText,
      title: 'Beautiful Invoices',
      description: 'Create professional invoices in seconds with custom branding, your logo, and brand colors.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Bill clients in 15+ currencies including USD, EUR, NGN, GBP, and more. Automatic conversion.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Wallet,
      title: 'Crypto Payments via Arc',
      description: 'Accept payments instantly with Arc blockchain. 0% fees, 10-second settlement, no chargebacks.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Repeat,
      title: 'Recurring Invoices',
      description: 'Set up monthly retainers and subscriptions. Auto-generate invoices on your schedule.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Automatic email reminders for overdue invoices. Get paid faster without the awkward follow-ups.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Track revenue, top clients, and payment trends. Visual charts and actionable insights.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Save client details, track total spend per client, and create invoices in two clicks.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted end-to-end. Built on Supabase and Vercel for enterprise-grade reliability.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const useCases = [
    {
      title: 'Freelancers',
      description: 'Send professional invoices, get paid in crypto or fiat, and never chase payments again.',
      icon: '👨‍💻',
      benefits: ['Professional templates', 'Multi-currency billing', '0% crypto fees'],
    },
    {
      title: 'Agencies',
      description: 'Manage multiple clients, set up recurring billing, and track team revenue with ease.',
      icon: '🏢',
      benefits: ['Recurring invoices', 'Client management', 'Team analytics'],
    },
    {
      title: 'Consultants',
      description: 'Bill by the hour, project, or retainer. Track time, send invoices, get paid faster.',
      icon: '💼',
      benefits: ['Project-based billing', 'PDF generation', 'Email automation'],
    },
    {
      title: 'Web3 Builders',
      description: 'Native crypto payments via Arc blockchain. Perfect for DAOs, protocols, and Web3 teams.',
      icon: '⚡',
      benefits: ['Arc integration', 'USDC/stablecoin support', 'On-chain receipts'],
    },
  ];

  const stats = [
    { number: '0%', label: 'Crypto Fees', icon: Wallet },
    { number: '15+', label: 'Currencies', icon: Globe },
    { number: '10s', label: 'Settlement Time', icon: Zap },
    { number: '∞', label: 'Free Invoices', icon: FileText },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Designer',
      content: 'InvFlow saved me hours every month. The 0% crypto fees alone pay for any premium plan elsewhere. Game-changer!',
      avatar: 'S',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Agency Owner',
      content: 'Finally, an invoicing tool that gets the modern economy. We bill clients in USDC and get paid in seconds.',
      avatar: 'M',
    },
    {
      name: 'Aisha Bello',
      role: 'Consultant',
      content: 'The recurring invoices and reminders are pure magic. My cash flow has never been more predictable.',
      avatar: 'A',
    },
  ];

  const faqs = [
    {
      question: 'Is InvFlow really free?',
      answer: 'Yes! All invoicing features are 100% free forever. You only pay transaction fees when accepting card payments (3%) or crypto payments (0%). No monthly fees, no hidden costs.',
    },
    {
      question: 'How does the Arc blockchain integration work?',
      answer: 'When clients pay with crypto, the transaction goes directly through Arc blockchain. Settlement happens in ~10 seconds with no intermediaries. You receive the funds in your connected wallet instantly.',
    },
    {
      question: 'Do I need a crypto wallet to use InvFlow?',
      answer: 'No! You can use InvFlow with traditional email signup and accept card payments. Crypto wallet connection is optional and only needed if you want to accept blockchain payments.',
    },
    {
      question: 'Can I customize my invoices?',
      answer: 'Absolutely. Add your logo, choose brand colors, customize email templates, and set default payment terms. Make every invoice uniquely yours.',
    },
    {
      question: 'What currencies are supported?',
      answer: 'We support 15+ currencies including USD, EUR, GBP, NGN, KES, GHS, ZAR, CAD, AUD, JPY, INR, CNY, BRL, MXN, and AED. Plus stablecoins like USDC via Arc.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use bank-level encryption, secure cloud infrastructure (Supabase + Vercel), and never store payment information. Your data is yours alone.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">InvFlow</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#use-cases" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Use Cases</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">FAQ</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2">
                Sign In
              </Link>
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors">
                Try It Free
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-700 font-medium">Features</a>
                <a href="#pricing" className="text-gray-700 font-medium">Pricing</a>
                <a href="#use-cases" className="text-gray-700 font-medium">Use Cases</a>
                <a href="#faq" className="text-gray-700 font-medium">FAQ</a>
                <Link href="/dashboard" className="text-gray-700 font-medium">Sign In</Link>
                <Link href="/dashboard" className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg text-center">Try It Free</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Powered by Arc Blockchain</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Invoicing
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  reinvented.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Send beautiful invoices, get paid in crypto or fiat, and grow your business — all in one platform. <strong className="text-gray-900">Free forever.</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group">
                  Start Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="bg-white border-2 border-gray-200 hover:border-blue-600 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  See Features
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>0% crypto fees</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/50 to-indigo-200/50 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500">invflow.com/dashboard</div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                      <p className="text-sm text-gray-500">Welcome back!</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Invoice</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">$24,567</p>
                      <p className="text-xs text-gray-600">Total Revenue</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">142</p>
                      <p className="text-xs text-gray-600">Invoices Sent</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { num: 'INV-042', client: 'Acme Corp', amount: '$2,500', status: 'Paid', color: 'bg-green-100 text-green-800' },
                      { num: 'INV-041', client: 'TechStart Inc', amount: '$1,200', status: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                      { num: 'INV-040', client: 'Global Traders', amount: '$3,800', status: 'Paid', color: 'bg-green-100 text-green-800' },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{inv.num}</p>
                            <p className="text-xs text-gray-500">{inv.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{inv.amount}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inv.color}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{stat.number}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              ✨ Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to <span className="text-blue-600">get paid faster</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From invoice creation to payment collection, InvFlow has every tool you need to streamline your billing process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all group border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get paid in <span className="text-blue-600">3 steps</span>
            </h2>
            <p className="text-xl text-gray-600">Simple, fast, and powerful.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 hidden md:block"></div>
            
            {[
              {
                step: '01',
                title: 'Create',
                description: 'Build a professional invoice in seconds with custom branding, currency, and recurring options.',
                icon: FileText,
                color: 'from-blue-500 to-blue-600',
              },
              {
                step: '02',
                title: 'Send',
                description: 'Email or share via link. Clients view a beautiful, mobile-friendly invoice with payment options.',
                icon: ArrowRight,
                color: 'from-indigo-500 to-indigo-600',
              },
              {
                step: '03',
                title: 'Get Paid',
                description: 'Accept payments via card (3%) or crypto via Arc blockchain (0% fees, 10s settlement).',
                icon: CheckCircle,
                color: 'from-emerald-500 to-emerald-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 mx-auto relative z-10`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-blue-600 mb-2">STEP {item.step}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for <span className="text-blue-600">modern businesses</span>
            </h2>
            <p className="text-xl text-gray-600">Whatever you do, InvFlow makes billing simple.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all group">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              💎 Transparent Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple pricing.
              <span className="block text-blue-600">No surprises.</span>
            </h2>
            <p className="text-xl text-gray-600">Free forever for invoicing. Pay only when you accept payments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-300 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Forever</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Everything you need to invoice</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited invoices',
                  'Unlimited clients',
                  'Multi-currency support',
                  'PDF generation',
                  'Email automation',
                  'Recurring invoices',
                  'Analytics dashboard',
                  'Smart reminders',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg text-center transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Payment Fees - Featured */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative shadow-2xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pay Per Transaction</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">0%</span>
                  <span className="text-blue-200">crypto fees</span>
                </div>
                <p className="text-sm text-blue-100 mt-2">+ 3% on card payments</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free, plus:',
                  '0% crypto fees via Arc',
                  '3% card processing',
                  'USDC & stablecoins',
                  '10-second settlement',
                  'No chargebacks (crypto)',
                  'Pay-as-you-go',
                  'No monthly fees',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block w-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 rounded-lg text-center transition-colors">
                Start Accepting Payments
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-purple-300 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro <span className="text-sm font-normal text-purple-600">(Coming Soon)</span></h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">$9</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">For growing businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free, plus:',
                  'Custom domain',
                  'Remove "Powered by InvFlow"',
                  'Priority support',
                  'Advanced analytics',
                  'API access',
                  'Team members (5)',
                  'White-label invoices',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button disabled className="block w-full bg-gray-100 text-gray-500 font-semibold py-3 rounded-lg text-center cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              <strong>No credit card required.</strong> Start invoicing in 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by <span className="text-blue-600">freelancers worldwide</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently asked <span className="text-blue-600">questions</span>
            </h2>
            <p className="text-xl text-gray-600">Everything you need to know about InvFlow.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to get paid faster?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers, agencies, and businesses using InvFlow to streamline their invoicing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group">
              Start Free Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-lg border-2 border-blue-500 transition-colors">
              Learn More
            </a>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            ✓ No credit card required ✓ Free forever ✓ 60-second setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">InvFlow</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Modern invoicing platform powered by Arc blockchain. Get paid faster, anywhere in the world.
              </p>
              <p className="text-sm text-gray-500">
                Built by <a href="https://christiandesign.studio" className="text-blue-400 hover:text-blue-300">Christian Design Studio</a>
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#use-cases" className="hover:text-white">Use Cases</a></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 InvFlow. All rights reserved.</p>
            <p className="text-sm">Powered by Arc Blockchain ⚡</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
