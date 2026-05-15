"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  FileText,
  Send,
  DollarSign,
  BarChart3,
  Globe2,
  Shield,
  Clock,
  TrendingUp,
  Check,
  User,
  Users,
  Building2,
  Boxes,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream text-coffee font-sans overflow-x-hidden">
      {/* ───────────────── NAV ───────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-coffee/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Inv"
              width={36}
              height={42}
              className="object-contain"
              priority
            />
            <span className="font-display text-2xl font-semibold tracking-tight">
              Inv
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-[15px] text-coffee/80">
            <a href="#features" className="hover:text-coffee transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-coffee transition-colors">
              How it Works
            </a>
            <a href="#roadmap" className="hover:text-coffee transition-colors">
              Roadmap
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-[15px] text-coffee/80 hover:text-coffee transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-coffee text-cream px-5 py-2.5 rounded-full text-[15px] font-medium hover:bg-coffee-deep transition-all hover:shadow-lg hover:shadow-coffee/20"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-coffee"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-coffee/5 bg-cream/95 backdrop-blur-md">
            <div className="px-6 py-4 flex flex-col gap-3">
              <a href="#features" className="py-2 text-coffee/80">
                Features
              </a>
              <a href="#how" className="py-2 text-coffee/80">
                How it Works
              </a>
              <a href="#roadmap" className="py-2 text-coffee/80">
                Roadmap
              </a>
              <Link href="/login" className="py-2 text-coffee/80">
                Log in
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative px-6 lg:px-10 pt-16 lg:pt-24 pb-24 lg:pb-32 overflow-hidden">
        {/* Falling logos background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[
            { left: "5%", duration: 18, delay: -3, drift: "30px", rotate: "15deg", size: 22, opacity: 0.06 },
            { left: "12%", duration: 24, delay: -11, drift: "-25px", rotate: "-18deg", size: 18, opacity: 0.05 },
            { left: "19%", duration: 20, delay: -7, drift: "40px", rotate: "20deg", size: 26, opacity: 0.07 },
            { left: "27%", duration: 26, delay: -19, drift: "-35px", rotate: "-22deg", size: 20, opacity: 0.05 },
            { left: "34%", duration: 22, delay: -15, drift: "30px", rotate: "18deg", size: 24, opacity: 0.06 },
            { left: "42%", duration: 28, delay: -2, drift: "-40px", rotate: "-15deg", size: 22, opacity: 0.05 },
            { left: "50%", duration: 19, delay: -13, drift: "45px", rotate: "25deg", size: 28, opacity: 0.07 },
            { left: "58%", duration: 25, delay: -8, drift: "-30px", rotate: "-20deg", size: 20, opacity: 0.05 },
            { left: "66%", duration: 21, delay: -17, drift: "35px", rotate: "22deg", size: 24, opacity: 0.06 },
            { left: "74%", duration: 27, delay: -4, drift: "-45px", rotate: "-18deg", size: 22, opacity: 0.05 },
            { left: "82%", duration: 23, delay: -21, drift: "40px", rotate: "20deg", size: 26, opacity: 0.07 },
            { left: "90%", duration: 29, delay: -12, drift: "-35px", rotate: "-25deg", size: 20, opacity: 0.05 },
            { left: "8%", duration: 30, delay: -24, drift: "50px", rotate: "30deg", size: 18, opacity: 0.05 },
            { left: "46%", duration: 17, delay: -6, drift: "-30px", rotate: "-15deg", size: 24, opacity: 0.06 },
            { left: "78%", duration: 26, delay: -16, drift: "30px", rotate: "18deg", size: 22, opacity: 0.06 },
          ].map((drop, i) => (
            <div
              key={i}
              className="fall-drop"
              style={{
                left: drop.left,
                animationDuration: `${drop.duration}s`,
                animationDelay: `${drop.delay}s`,
                ["--fall-drift" as string]: drop.drift,
                ["--fall-rotate" as string]: drop.rotate,
                ["--fall-opacity" as string]: drop.opacity,
              } as React.CSSProperties}
            >
              <Image
                src="/logo.png"
                alt=""
                width={drop.size}
                height={drop.size + 6}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-tan-soft border border-tan/50 text-coffee px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5 fill-coffee" />
              Powered by Arc Blockchain
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-coffee">
              Send invoices.
              <br />
              Get paid instantly in{" "}
              <span className="italic font-medium">USDC.</span>
            </h1>

            <p className="mt-8 text-lg lg:text-xl text-coffee/70 max-w-lg leading-relaxed">
              Borderless payments powered by Arc blockchain — with built-in
              accounting.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-coffee text-cream px-7 py-4 rounded-full font-medium hover:bg-coffee-deep transition-all hover:shadow-xl hover:shadow-coffee/25"
              >
                Create Invoice
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

             <a
                href="#how"
                className="inline-flex items-center gap-2 text-coffee px-7 py-4 rounded-full font-medium border border-coffee/15 hover:border-coffee/40 hover:bg-coffee/5 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="absolute -inset-4 bg-tan/30 rounded-[2.5rem] blur-2xl opacity-60" />
            <div className="relative bg-tan-soft rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-coffee/5 hover:shadow-2xl hover:shadow-coffee/10 transition-shadow duration-500">
              <div className="bg-cream rounded-2xl p-7 mb-5">
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <p className="text-sm text-coffee/60 mb-1">Invoice</p>
                    <p className="font-display text-2xl font-semibold">
                      #1234
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-sage/40 text-sage-deep text-xs font-medium px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-deep animate-pulse-dot" />
                    Paid
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-t border-coffee/10">
                  <span className="text-coffee/60 text-sm">Amount</span>
                  <span className="font-display text-2xl font-semibold">
                    $2,500.00
                  </span>
                </div>
                <div className="flex items-center justify-between py-4 border-t border-coffee/10">
                  <span className="text-coffee/60 text-sm">Payment Time</span>
                  <span className="font-medium text-coffee">3 seconds</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cream rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
                  <p className="font-display text-3xl font-semibold">$12.5K</p>
                  <p className="text-sm text-coffee/60 mt-1">This Month</p>
                </div>
                <div className="bg-cream rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
                  <p className="font-display text-3xl font-semibold">24</p>
                  <p className="text-sm text-coffee/60 mt-1">Invoices Sent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how" className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-coffee/70">
              Get paid in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Create Invoice",
                desc: "Design professional invoices in minutes. Add your branding, line items, and payment terms.",
              },
              {
                icon: Send,
                step: "2",
                title: "Send to Client",
                desc: "Share via email or link. Your client can pay instantly with USDC from anywhere in the world.",
              },
              {
                icon: DollarSign,
                step: "3",
                title: "Receive USDC Instantly",
                desc: "Payments settle in seconds on Arc blockchain. No delays, no intermediaries, no hassle.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="group relative bg-cream-soft rounded-3xl p-8 border border-coffee/5 hover:border-coffee/15 hover:shadow-xl hover:shadow-coffee/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-tan-soft rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 group-hover:bg-tan transition-all duration-300">
                    <s.icon
                      className="w-6 h-6 text-coffee group-hover:bounce-subtle"
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className="font-display text-5xl font-semibold text-coffee/10 group-hover:text-coffee/20 leading-none transition-colors duration-300">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-coffee mb-3">
                  {s.title}
                </h3>
                <p className="text-coffee/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── EVERYTHING YOU NEED ───────────────── */}
      <section id="features" className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-coffee/70">
              A complete invoicing and accounting solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
            {[
              {
                icon: Zap,
                title: "Instant USDC Payments",
                desc: "Receive payments in seconds via Arc blockchain. No waiting for bank transfers.",
              },
              {
                icon: BarChart3,
                title: "Built-in Accounting",
                desc: "Track income, expenses, and cash flow in real-time with automated bookkeeping.",
              },
              {
                icon: Globe2,
                title: "Cross-Border Payments",
                desc: "Accept payments from clients worldwide without international fees or delays.",
              },
              {
                icon: Shield,
                title: "Secure & Transparent",
                desc: "Blockchain-powered security with complete transaction transparency and audit trails.",
              },
              {
                icon: Clock,
                title: "Automated Bookkeeping",
                desc: "No manual entry needed. Every transaction is automatically recorded and categorized.",
              },
              {
                icon: TrendingUp,
                title: "Financial Insights",
                desc: "Real-time dashboards and reports to understand your business performance.",
              },
            ].map((f) => (
              <div key={f.title} className="group cursor-default">
                <div className="w-12 h-12 bg-tan-soft rounded-xl flex items-center justify-center mb-5 group-hover:bg-tan group-hover:scale-110 transition-all duration-300">
                  <f.icon
                    className="w-5 h-5 text-coffee group-hover:wiggle"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-display text-xl font-semibold text-coffee mb-2.5 group-hover:translate-x-0.5 transition-transform duration-300">
                  {f.title}
                </h3>
                <p className="text-coffee/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── WHY CHOOSE INV ───────────────── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto bg-coffee rounded-[2.5rem] p-10 lg:p-16 text-cream relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-tan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative grid lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight">
                Why Choose Inv?
              </h2>
              <p className="mt-6 text-cream/70 text-lg leading-relaxed max-w-md">
                Traditional invoicing is slow, expensive, and complicated. Inv
                brings speed, simplicity, and transparency to business
                payments.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  {
                    title: "No International Payment Delays",
                    desc: "Get paid instantly, regardless of where your clients are located.",
                  },
                  {
                    title: "No Manual Accounting Stress",
                    desc: "Every transaction is automatically recorded and categorized for you.",
                  },
                  {
                    title: "One Platform for Everything",
                    desc: "Invoicing, payments, and accounting — all in one place.",
                  },
                  {
                    title: "Built for Modern Businesses",
                    desc: "Perfect for freelancers, remote teams, and Web3-native companies.",
                  },
                ].map((b) => (
                  <div key={b.title} className="group flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-tan flex items-center justify-center mt-0.5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                      <Check
                        className="w-3.5 h-3.5 text-coffee"
                        strokeWidth={3}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-cream mb-1 group-hover:text-tan transition-colors duration-300">
                        {b.title}
                      </h4>
                      <p className="text-cream/70 text-sm leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-coffee-deep rounded-3xl p-8 lg:p-10 self-center w-full border border-cream/5">
              <p className="text-cream/50 text-sm uppercase tracking-wider mb-6">
                Payment Speed Comparison
              </p>

              {[
                { label: "Traditional Banking", time: "3-5 days", width: 95 },
                {
                  label: "Online Payment Platforms",
                  time: "1-2 days",
                  width: 60,
                },
                {
                  label: "Inv (Arc Blockchain)",
                  time: "3 seconds",
                  width: 8,
                  highlight: true,
                },
              ].map((row, i) => (
                <div key={row.label} className="mb-7 last:mb-0">
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`font-medium ${
                        row.highlight ? "text-tan" : "text-cream"
                      }`}
                    >
                      {row.label}
                    </span>
                    <span
                      className={`text-sm ${
                        row.highlight
                          ? "text-tan font-semibold"
                          : "text-cream/60"
                      }`}
                    >
                      {row.time}
                    </span>
                  </div>
                  <div className="h-2 bg-cream/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full fill-bar ${
                        row.highlight ? "bg-tan" : "bg-cream/40"
                      }`}
                      style={{
                        width: `${row.width}%`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SIMPLE POWERFUL DASHBOARD ───────────────── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              Simple, Powerful Dashboard
            </h2>
            <p className="mt-4 text-lg text-coffee/70">
              Everything you need to manage your business finances
            </p>
          </div>

          <div className="bg-cream-soft rounded-3xl shadow-2xl shadow-coffee/10 border border-coffee/5 overflow-hidden hover:shadow-coffee/20 transition-shadow duration-500">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-coffee/5 bg-cream">
              <div className="w-3 h-3 rounded-full bg-coffee/15" />
              <div className="w-3 h-3 rounded-full bg-coffee/15" />
              <div className="w-3 h-3 rounded-full bg-coffee/15" />
            </div>

            <div className="p-6 lg:p-10">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-coffee text-cream rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:shadow-coffee/20 transition-all duration-300">
                  <p className="text-cream/60 text-sm mb-2">Total Revenue</p>
                  <p className="font-display text-4xl font-semibold mb-1">
                    $48,250
                  </p>
                  <p className="text-tan text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    12.5% this month
                  </p>
                </div>
                <div className="bg-tan-soft rounded-2xl p-6 hover:-translate-y-1 hover:bg-tan transition-all duration-300">
                  <p className="text-coffee/60 text-sm mb-2">
                    Pending Invoices
                  </p>
                  <p className="font-display text-4xl font-semibold mb-1 text-coffee">
                    8
                  </p>
                  <p className="text-coffee/60 text-sm">$12,400 outstanding</p>
                </div>
                <div className="bg-tan-soft rounded-2xl p-6 hover:-translate-y-1 hover:bg-tan transition-all duration-300">
                  <p className="text-coffee/60 text-sm mb-2">
                    Avg Payment Time
                  </p>
                  <p className="font-display text-4xl font-semibold mb-1 text-coffee">
                    3.2s
                  </p>
                  <p className="text-coffee/60 text-sm">Via Arc blockchain</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "1245",
                    client: "Acme Corp",
                    date: "May 10, 2026",
                    amount: "$3,200.00",
                    status: "Paid",
                  },
                  {
                    id: "1244",
                    client: "TechStart Ltd",
                    date: "May 8, 2026",
                    amount: "$1,850.00",
                    status: "Pending",
                  },
                  {
                    id: "1243",
                    client: "Global Inc",
                    date: "May 5, 2026",
                    amount: "$5,600.00",
                    status: "Paid",
                  },
                ].map((inv) => (
                  <div
                    key={inv.id}
                    className="group flex items-center justify-between p-5 rounded-2xl border border-coffee/5 hover:bg-cream hover:border-coffee/15 hover:translate-x-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-coffee rounded-xl flex items-center justify-center group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300">
                        <FileText
                          className="w-4 h-4 text-cream"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-coffee">
                          Invoice #{inv.id}
                        </p>
                        <p className="text-coffee/60 text-sm">
                          {inv.client} · {inv.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-semibold text-coffee">
                        {inv.amount}
                      </p>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          inv.status === "Paid"
                            ? "bg-sage/40 text-sage-deep"
                            : "bg-amber/30 text-amber-deep"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── WHO CAN USE ───────────────── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              Who Can Use Inv
            </h2>
            <p className="mt-4 text-lg text-coffee/70">
              Built for modern businesses of every shape
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: User,
                title: "Freelancers",
                desc: "Get paid faster from clients anywhere in the world.",
              },
              {
                icon: Building2,
                title: "Agencies",
                desc: "Manage multiple clients with branded, professional invoices.",
              },
              {
                icon: Users,
                title: "Remote Teams",
                desc: "Pay contractors and vendors across borders in seconds.",
              },
              {
                icon: Boxes,
                title: "Web3 Companies",
                desc: "Native crypto-first invoicing built for on-chain operations.",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="group bg-cream-soft rounded-3xl p-7 border border-coffee/5 hover:border-coffee hover:bg-coffee hover:text-cream hover:-translate-y-2 hover:shadow-xl hover:shadow-coffee/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-tan-soft group-hover:bg-cream rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <a.icon
                    className="w-5 h-5 text-coffee group-hover:bounce-subtle"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {a.title}
                </h3>
                <p className="text-coffee/70 group-hover:text-cream/70 text-sm leading-relaxed transition-colors">
                  {a.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── ROADMAP ───────────────── */}
      <section id="roadmap" className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              What&apos;s Coming Next
            </h2>
            <p className="mt-4 text-lg text-coffee/70">
              Building the future of business finance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quarter: "Q3 2026",
                title: "Arc Mainnet Launch",
                desc: "Migration to Arc mainnet for enhanced security and lower transaction costs.",
                tags: ["Blockchain", "Security"],
              },
              {
                quarter: "Q4 2026",
                title: "On-Ramp / Off-Ramp",
                desc: "Convert between USDC and local currencies seamlessly within the platform.",
                tags: ["Payments", "Fiat"],
              },
              {
                quarter: "2027",
                title: "Mobile Apps",
                desc: "Native iOS and Android apps to invoice, get paid, and manage your business on the go.",
                tags: ["iOS", "Android"],
              },
            ].map((r) => (
              <div
                key={r.title}
                className="group relative bg-cream-soft rounded-3xl p-8 border border-coffee/5 hover:shadow-xl hover:shadow-coffee/5 hover:-translate-y-1 hover:border-coffee/15 transition-all duration-300"
              >
                <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-accent to-tan rounded-b-full group-hover:left-4 group-hover:right-4 transition-all duration-500" />
                <p className="text-accent text-sm font-medium uppercase tracking-wider mb-4 mt-2">
                  {r.quarter}
                </p>
                <h3 className="font-display text-2xl font-semibold text-coffee mb-3">
                  {r.title}
                </h3>
                <p className="text-coffee/70 leading-relaxed mb-6">{r.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1 bg-tan-soft rounded-full text-coffee/80 hover:bg-tan hover:text-coffee transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden relative">
          {/* Image carousel */}
          <CTACarousel />

          {/* Lighter overlay so images show through */}
          <div className="absolute inset-0 bg-coffee/15" />
          <div className="absolute inset-0 bg-gradient-to-br from-coffee/20 via-coffee/10 to-coffee-deep/70" />

          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-tan/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative px-10 py-20 lg:py-28 text-center text-cream">
            <h2 className="font-display text-4xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.05]">
              Ready to transform your invoicing?
            </h2>
            <p className="mt-6 text-cream/80 text-lg max-w-xl mx-auto">
              Join modern businesses using Inv for instant payments and
              seamless accounting.
            </p>
            <Link
              href="/signup"
              className="group mt-10 inline-flex items-center gap-2 bg-cream text-coffee px-8 py-4 rounded-full font-medium hover:bg-tan-soft hover:scale-105 transition-all hover:shadow-2xl"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="px-6 lg:px-10 py-16 border-t border-coffee/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-10 mb-12">
            <div>
              <Link href="/" className="group flex items-center gap-2.5 mb-5">
                <Image
                  src="/logo.png"
                  alt="Inv"
                  width={36}
                  height={42}
                  className="object-contain group-hover:rotate-6 transition-transform duration-300"
                />
                <span className="font-display text-2xl font-semibold">
                  Inv
                </span>
              </Link>
              <p className="text-coffee/70 text-sm leading-relaxed max-w-xs">
                Crypto-powered invoicing and accounting for modern businesses.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Roadmap"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Documentation", "API Reference", "Support", "Status"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-coffee mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      
                      <a
                        href="#"
                        className="text-sm text-coffee/70 hover:text-coffee hover:translate-x-1 inline-block transition-all duration-200"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-coffee/10">
            <p className="text-sm text-coffee/60">
              © 2026 Inv. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-coffee/60">
              
              <a
                href="#"
                className="hover:text-coffee hover:-translate-y-0.5 inline-block transition-all duration-200"
              >
                Privacy
              </a>
              
              <a
                href="#"
                className="hover:text-coffee hover:-translate-y-0.5 inline-block transition-all duration-200"
              >
                Terms
              </a>
              
              <a
                href="#"
                className="hover:text-coffee hover:-translate-y-0.5 inline-block transition-all duration-200"
              >
                Twitter
              </a>
              
              <a
                href="#"
                className="hover:text-coffee hover:-translate-y-0.5 inline-block transition-all duration-200"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────── CTA Image Carousel ───────────────── */
function CTACarousel() {
  const [current, setCurrent] = useState(0);
  const images = [
    "/cta/business-meeting.jpg",
    "/cta/fashion-designer.jpg",
    "/cta/analytics.jpg",
    "/cta/small-business.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}