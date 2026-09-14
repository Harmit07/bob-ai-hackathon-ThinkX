'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RegionProvider } from '@/context/RegionContext';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
        <QueryClientProvider client={queryClient}>
          <RegionProvider>
            {/* Main Sidebar */}
            <Sidebar />

            {/* Main App Workspace */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
              <Header />
              <main className="flex-1 pb-12 overflow-y-auto">
                {children}
              </main>
            </div>
          </RegionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

