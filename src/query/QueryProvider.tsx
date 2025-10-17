import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const storage = new MMKV({ id: 'react-query' });

const mmkvPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => storage.getString(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
  key: 'rq-cache-v1',
  throttleTime: 1000,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings for better offline UX
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 60 * 24, // 24h
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

// Persist the client to MMKV
persistQueryClient({
  queryClient,
  persister: mmkvPersister,
});

// Wire React Query to app focus/online status
function useReactQueryLifecycle() {
  useEffect(() => {
    // Focus manager using AppState
    const subscription = AppState.addEventListener('change', state => {
      focusManager.setFocused(state === 'active');
    });

    // Online manager using NetInfo
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      onlineManager.setOnline(Boolean(state.isConnected));
    });

    return () => {
      subscription.remove();
      unsubscribeNetInfo();
    };
  }, []);
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  useReactQueryLifecycle();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
