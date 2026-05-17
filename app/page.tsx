"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Zap,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  Send,
  Wallet,
  Receipt,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-cream-soft text-coffee font-sans overflow-x-hidden">
      {/* ───────────────── NAV ───────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream-soft/80 border-b border-coffee/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-18 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Inv"
              width={32}
              height={38}
              className="object-contain"
              priority
            />
            <span className="font-display text-xl font-semibold tracking-tight">
              Inv
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-coffee/75">
            <a href="#product" className="hover:text-coffee transition-colors">
              Product
            </a>
            <a href="#why" className="hover:text-coffee transition-colors">
              Why Inv
            </a>
            <a href="#pricing" className="hover:text-coffee transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-coffee transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm text-coffee/75 hover:text-coffee transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center bg-coffee text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-coffee-deep transition-all"
            >
              Sign up
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
          <div className="md:hidden border-t border-coffee/5 bg-cream-soft/95 backdrop-blur-md">
            <div className="px-6 py-4 flex flex-col gap-3">
              <a href="#product" className="py-2 text-coffee/80">
                Product
              </a>
              <a href="#why" className="py-2 text-coffee/80">
                Why Inv
              </a>
              <a href="#pricing" className="py-2 text-coffee/80">
                Pricing
              </a>
              <Link href="/login" className="py-2 text-coffee/80">
                Log in
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section className="px-6 lg:px-10 pt-16 lg:pt-24 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase mb-6">
              Invoicing + Accounting
            </p>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-coffee">
              The financial operating system for modern teams.
            </h1>

            <p className="mt-7 text-lg text-coffee/70 max-w-lg leading-relaxed">
              Send invoices. Get paid in USDC. Reconcile books automatically.
              All in one place.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center bg-coffee text-cream px-5 py-3 rounded-md font-medium hover:bg-coffee-deep transition-all text-[15px]"
              >
                Open account
              </Link>
              <a
                href="#product"
                className="inline-flex items-center text-coffee px-5 py-3 rounded-md font-medium border border-coffee/15 hover:border-coffee/30 transition-all text-[15px]"
              >
                Book a demo
              </a>
            </div>
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="bg-white rounded-xl border border-coffee/8 shadow-xl shadow-coffee/5 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-coffee/5 bg-cream-soft">
                <div className="w-2.5 h-2.5 rounded-full bg-coffee/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-coffee/15" />
                <div className="w-2.5 h-2.5 rounded-full bg-coffee/15" />
              </div>

              <div className="p-6 lg:p-8">
                <p className="text-[11px] font-medium tracking-[0.15em] text-coffee/50 uppercase mb-3">
                  Balance
                </p>
                <p className="font-display text-4xl lg:text-5xl font-semibold text-coffee tracking-tight">
                  $48,250.00
                </p>
                <p className="text-sm text-coffee/60 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-deep animate-pulse-dot" />
                  $2,500 received today
                </p>

                <div className="mt-8 pt-6 border-t border-coffee/8">
                  <p className="text-xs font-medium text-coffee mb-4">
                    Recent activity
                  </p>

                  {[
                    {
                      name: "Acme Corp",
                      sub: "Invoice #1245 · Paid",
                      amount: "+$3,200",
                      paid: true,
                    },
                    {
                      name: "TechStart Ltd",
                      sub: "Invoice #1244 · Pending",
                      amount: "$1,850",
                      paid: false,
                    },
                    {
                      name: "Global Inc",
                      sub: "Invoice #1243 · Paid",
                      amount: "+$5,600",
                      paid: true,
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-t border-coffee/5 first:border-t-0"
                    >
                      <div>
                        <p className="text-sm text-coffee font-medium">
                          {row.name}
                        </p>
                        <p className="text-[11px] text-coffee/50 mt-0.5">
                          {row.sub}
                        </p>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          row.paid ? "text-coffee" : "text-coffee/60"
                        }`}
                      >
                        {row.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── TRUST STRIP ───────────────── */}
      <section className="px-6 lg:px-10 py-12 border-y border-coffee/8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.2em] text-coffee/50 uppercase mb-8 text-center">
            Used by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
            {["Northstar", "Pixel & Pine", "Foundry", "Helix Labs", "Quanta", "Mercer & Co"].map(
              (logo) => (
                <span
                  key={logo}
                  className="font-display text-lg font-semibold text-coffee tracking-tight"
                >
                  {logo}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── WHAT'S INCLUDED ───────────────── */}
      <section id="product" className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase mb-5">
              What&apos;s included
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee leading-[1.05]">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Send,
                title: "Send & track invoices",
                points: [
                  "Professional invoices in 30 seconds",
                  "Auto-reminders. Real-time status",
                  "Branded for your business",
                ],
              },
              {
                icon: Zap,
                title: "Instant USDC payments",
                points: [
                  "Settled in 3 seconds",
                  "No bank delays. No FX fees",
                  "Powered by Arc blockchain",
                ],
              },
              {
                icon: Receipt,
                title: "Automatic books",
                points: [
                  "Every transaction categorized",
                  "Tax-ready reports on demand",
                  "No manual entry. Ever",
                ],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-coffee/8 p-7 hover:border-coffee/15 hover:shadow-lg hover:shadow-coffee/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-tan-soft rounded-lg flex items-center justify-center mb-6">
                  <f.icon className="w-5 h-5 text-coffee" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-coffee mb-4">
                  {f.title}
                </h3>
                <ul className="space-y-2">
                  {f.points.map((p) => (
                    <li
                      key={p}
                      className="text-sm text-coffee/65 leading-relaxed"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-accent font-medium mt-6 hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── PRODUCT SHOWCASE ───────────────── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase mb-5">
              The product
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight text-coffee">
              Built for clarity.
            </h2>
          </div>

          <DashboardShowcase />
        </div>
      </section>
      {/* ───────────────── TESTIMONIAL + METRICS ───────────────── */}
      <section id="why" className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase mb-10">
            Customer stories
          </p>

          <TestimonialCarousel />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-coffee/8">
            {[
              { value: "98%", label: "Faster collections" },
              { value: "15hrs", label: "Saved per month" },
              { value: "$0", label: "Transfer fees" },
              { value: "∞", label: "Invoices/mo" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="font-display text-4xl lg:text-5xl font-semibold text-coffee tracking-tight">
                  {m.value}
                </p>
                <p className="text-xs text-coffee/55 mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden relative">
          {/* Image carousel */}
          <CTACarousel />

          {/* Overlay for text contrast */}
          <div className="absolute inset-0 bg-coffee/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-coffee/20 via-coffee/10 to-coffee-deep/70" />

          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-tan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative px-10 py-20 lg:py-24 text-center">
          <h2 className="font-display text-4xl lg:text-6xl font-semibold tracking-tight text-cream leading-[1.05] max-w-3xl mx-auto">
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
      <footer className="px-6 lg:px-10 py-16 border-t border-coffee/8 bg-cream-soft">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <Image
                  src="/logo.png"
                  alt="Inv"
                  width={28}
                  height={34}
                  className="object-contain"
                />
                <span className="font-display text-xl font-semibold">Inv</span>
              </Link>
              <p className="text-coffee/65 text-sm leading-relaxed max-w-xs">
                Crypto-powered invoicing and accounting for modern businesses.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "API"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Docs", "Support", "Status", "Changelog"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-coffee mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-coffee/65 hover:text-coffee transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-coffee/8">
            <p className="text-xs text-coffee/55">
              © 2026 Inv. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-coffee/55">
              <a href="#" className="hover:text-coffee transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-coffee transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-coffee transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-coffee transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────── Testimonial Carousel ───────────────── */
function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const testimonials = [
    {
      quote:
        "We cut our AR cycle from 30 days to 30 seconds. Inv just works.",
      name: "Marcus Webb",
      role: "CFO, Northstar Agency",
      initials: "MW",
    },
    {
      quote:
        "Finally, an invoicing tool that doesn't feel like it was built in 2010. Clients pay before I close my laptop.",
      name: "Sarah Chen",
      role: "Founder, Pixel & Pine",
      initials: "SC",
    },
    {
      quote:
        "Inv replaced three tools we were paying for separately. Cleaner books, faster cashflow, zero headaches.",
      name: "Alex Morrison",
      role: "CEO, Foundry Labs",
      initials: "AM",
    },
    {
      quote:
        "Our international clients used to take weeks to pay. Now it's seconds. Game changer for a remote agency.",
      name: "Priya Sharma",
      role: "Operations, Helix Studios",
      initials: "PS",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="max-w-4xl relative min-h-[280px]">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <blockquote className="font-display text-3xl lg:text-4xl font-medium text-coffee leading-[1.3] tracking-tight">
            <span className="italic">&ldquo;{t.quote}&rdquo;</span>
          </blockquote>

          <div className="mt-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tan flex items-center justify-center">
              <span className="text-sm font-semibold text-coffee">
                {t.initials}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-coffee">{t.name}</p>
              <p className="text-xs text-coffee/55">{t.role}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute -bottom-2 left-0 flex gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-coffee" : "w-1.5 bg-coffee/20"
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
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
/* ───────────────── Dashboard Showcase ───────────────── */
function DashboardShowcase() {
  const [current, setCurrent] = useState(0);

  const pages = [
    {
      label: "Dashboard",
      content: (
        <div>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { label: "Total revenue", value: "$48,250" },
              { label: "Pending", value: "$12,400" },
              { label: "This month", value: "24 sent" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[11px] font-medium tracking-[0.15em] text-coffee/50 uppercase mb-2">
                  {stat.label}
                </p>
                <p className="font-display text-3xl lg:text-4xl font-semibold text-coffee tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-coffee/5">
            <p className="text-sm font-medium text-coffee mb-5">
              Revenue · Last 6 months
            </p>
            <div className="flex items-end gap-3 h-48">
              {[
                { label: "Dec", h: 50, faded: true },
                { label: "Jan", h: 67, faded: true },
                { label: "Feb", h: 38, faded: true },
                { label: "Mar", h: 75 },
                { label: "Apr", h: 88 },
                { label: "May", h: 100 },
              ].map((bar) => (
                <div
                  key={bar.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full flex flex-col-reverse" style={{ height: "100%" }}>
                    <div
                      className={`w-full rounded-t-md ${
                        bar.faded ? "bg-tan-soft" : "bg-coffee"
                      }`}
                      style={{ height: `${bar.h}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-coffee/50">{bar.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Invoices",
      content: (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-medium tracking-[0.15em] text-coffee/50 uppercase mb-1">
                All invoices
              </p>
              <p className="font-display text-2xl font-semibold text-coffee">
                32 invoices
              </p>
            </div>
            <div className="bg-coffee text-cream px-4 py-2 rounded-md text-sm font-medium">
              + New invoice
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: "#1245", client: "Acme Corp", amount: "$3,200.00", status: "Paid" },
              { id: "#1244", client: "TechStart Ltd", amount: "$1,850.00", status: "Pending" },
              { id: "#1243", client: "Global Inc", amount: "$5,600.00", status: "Paid" },
              { id: "#1242", client: "Pixel Studio", amount: "$2,100.00", status: "Paid" },
              { id: "#1241", client: "Foundry Labs", amount: "$4,800.00", status: "Overdue" },
            ].map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 rounded-lg border border-coffee/5 hover:bg-cream-soft transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-coffee/50">{inv.id}</span>
                  <span className="text-sm font-medium text-coffee">{inv.client}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[11px] font-medium px-2 py-1 rounded ${
                      inv.status === "Paid"
                        ? "bg-sage/40 text-sage-deep"
                        : inv.status === "Pending"
                        ? "bg-amber/30 text-amber-deep"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                  <span className="text-sm font-semibold text-coffee w-24 text-right">
                    {inv.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Clients",
      content: (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-medium tracking-[0.15em] text-coffee/50 uppercase mb-1">
                Your clients
              </p>
              <p className="font-display text-2xl font-semibold text-coffee">
                12 active
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Acme Corp", email: "billing@acme.com", initials: "AC", total: "$24,500" },
              { name: "TechStart Ltd", email: "ops@techstart.io", initials: "TL", total: "$8,900" },
              { name: "Global Inc", email: "ap@global.com", initials: "GI", total: "$16,200" },
              { name: "Pixel Studio", email: "hello@pixel.co", initials: "PS", total: "$5,400" },
              { name: "Foundry Labs", email: "team@foundry.io", initials: "FL", total: "$11,800" },
              { name: "Helix Studios", email: "billing@helix.co", initials: "HS", total: "$7,300" },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 p-4 rounded-lg border border-coffee/5 hover:bg-cream-soft transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-tan-soft flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-coffee">{c.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-coffee truncate">{c.name}</p>
                  <p className="text-[11px] text-coffee/50 truncate">{c.email}</p>
                </div>
                <p className="text-sm font-semibold text-coffee">{c.total}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Analytics",
      content: (
        <div>
          <div className="grid grid-cols-4 gap-6 mb-10">
            {[
              { label: "Avg invoice", value: "$2,143" },
              { label: "Paid on time", value: "94%" },
              { label: "Avg pay time", value: "3.2s" },
              { label: "Top client", value: "Acme" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[11px] font-medium tracking-[0.15em] text-coffee/50 uppercase mb-2">
                  {stat.label}
                </p>
                <p className="font-display text-2xl font-semibold text-coffee tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-coffee/5">
            <p className="text-sm font-medium text-coffee mb-5">
              Revenue trend
            </p>
            <svg viewBox="0 0 600 180" className="w-full h-48">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d2817" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3d2817" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,140 L 100,120 L 200,100 L 300,80 L 400,60 L 500,40 L 600,20 L 600,180 L 0,180 Z"
                fill="url(#trendGrad)"
              />
              <path
                d="M 0,140 L 100,120 L 200,100 L 300,80 L 400,60 L 500,40 L 600,20"
                fill="none"
                stroke="#3d2817"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % pages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [pages.length]);

  return (
    <div className="bg-white rounded-2xl border border-coffee/8 shadow-2xl shadow-coffee/10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-coffee/5 bg-cream-soft">
        <div className="w-3 h-3 rounded-full bg-coffee/15" />
        <div className="w-3 h-3 rounded-full bg-coffee/15" />
        <div className="w-3 h-3 rounded-full bg-coffee/15" />
      </div>

      <div className="grid lg:grid-cols-[200px_1fr]">
        <div className="border-r border-coffee/5 bg-coffee/3 p-5 hidden lg:block">
          <ul className="space-y-1 text-sm text-coffee/65">
            {pages.map((page, i) => (
              <li
                key={page.label}
                className={`px-3 py-2 rounded-md transition-all duration-500 ${
                  i === current
                    ? "bg-coffee text-cream font-medium"
                    : ""
                }`}
              >
                {page.label}
              </li>
            ))}
            <li className="px-3 py-2 rounded-md text-coffee/65">Wallet</li>
            <li className="px-3 py-2 rounded-md text-coffee/65">Settings</li>
          </ul>
        </div>

        <div className="min-h-[420px] relative">
          {pages.map((page, i) => (
            <div
              key={page.label}
              className="absolute inset-0 p-6 lg:p-10 transition-opacity duration-700 ease-in-out"
              style={{
                opacity: i === current ? 1 : 0,
                pointerEvents: i === current ? "auto" : "none",
              }}
            >
              {page.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}