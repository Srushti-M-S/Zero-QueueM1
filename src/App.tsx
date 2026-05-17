/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './services/authService';
import { initFirebase } from './lib/firebase';

function AppContent({ isFirebaseReady }: { isFirebaseReady: boolean }) {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      <Dashboard />
      {!isFirebaseReady && (
        <div className="fixed bottom-4 right-4 z-50 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-lg border border-gray-100 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Offline Mode (Local Only)
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    initFirebase().then(() => {
      setIsFirebaseReady(true);
    });
  }, []);

  return (
    <AuthProvider>
      <AppContent isFirebaseReady={isFirebaseReady} />
    </AuthProvider>
  );
}
