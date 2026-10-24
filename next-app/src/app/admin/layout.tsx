'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  ShieldCheck,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Users,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = React.useState<string>('Administrator');

  React.useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.admin?.email) {
          setAdminEmail(d.admin.email);
        }
      })
      .catch(() => {});
  }, []);

  // If on admin login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      document.cookie = 'admin_session=; path=/; max-age=0';
      document.cookie = 'customer_session=; path=/; max-age=0';
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/boxes', label: 'Box Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/quotes', label: 'Quotes', icon: ClipboardList },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Admin Top Navigation */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 ring-1 ring-amber-500/30 bg-amber-50 dark:bg-stone-800 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Blossom & Box Gh"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-stone-900 dark:text-white">
                  Blossom<span className="text-amber-500">&amp;</span>Box
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded-md border border-amber-500/30">
                  Admin Panel
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 shadow-2xs'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="Open storefront in new tab"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-800">
              <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </span>
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                {adminEmail}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-200/80 dark:border-red-900/50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal scroll nav */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-stone-100 dark:border-stone-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-600 dark:text-stone-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
