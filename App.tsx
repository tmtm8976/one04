import React from 'react';
import AuthGate from './src/navigation/AuthGate';
import QueryProvider from './src/query/QueryProvider';

export default function App() {
  return (
    <QueryProvider>
      <AuthGate />
    </QueryProvider>
  );
}
