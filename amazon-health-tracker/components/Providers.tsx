'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 1000, retry: 1 },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2236',
              color: '#e2e8f0',
              border: '1px solid #1f2d45',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a2236' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a2236' } },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
