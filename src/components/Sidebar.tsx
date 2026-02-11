"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 min-h-screen">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">ExpenseTracker</span>
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
          <p className="text-xs font-medium text-indigo-900">Expense Tracker</p>
          <p className="text-xs text-indigo-600 mt-1">Track your spending habits and save more.</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
        <div className="flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
