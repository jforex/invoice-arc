'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Users,
  BarChart3,
  Repeat,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices/create', label: 'New Invoice', icon: FileText },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/recurring', label: 'Recurring', icon: Repeat },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('user_id', user.id)
        .single();
      if (company) setCompanyName(company.name);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ────────────── Mobile top bar ────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-coffee/5">
        <div className="px-5 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Inv" width={28} height={32} className="object-contain" />
            <span className="font-display text-xl font-semibold text-coffee">Inv</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-coffee"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="border-t border-coffee/5 bg-cream">
            <nav className="px-5 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-coffee text-cream'
                        : 'text-coffee/70 hover:bg-coffee/5 hover:text-coffee'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coffee/70 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* ────────────── Desktop sidebar ────────────── */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 border-r border-coffee/5 bg-cream-soft">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Inv" width={32} height={36} className="object-contain" />
              <span className="font-display text-2xl font-semibold text-coffee">Inv</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-coffee text-cream'
                      : 'text-coffee/70 hover:bg-coffee/5 hover:text-coffee'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-coffee/5">
            <div className="px-4 py-3 mb-2">
              <p className="text-xs text-coffee/50 uppercase tracking-wider mb-1">Account</p>
              <p className="text-sm font-medium text-coffee truncate">{companyName || 'Loading...'}</p>
              <p className="text-xs text-coffee/60 truncate mt-0.5">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-coffee/70 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ────────────── Main content ────────────── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
