import React from 'react';
import AuthGate from './src/navigation/AuthGate';
import QueryProvider from './src/query/QueryProvider';
import { Provider } from 'react-redux';
import { store } from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthGate />
      </QueryProvider>
    </Provider>
  );
}
