"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
