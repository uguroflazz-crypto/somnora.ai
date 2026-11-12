import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Auth from './pages/Auth';

const Analyze = lazy(() => import('./pages/Analyze'));
const Incubation = lazy(() => import('./pages/Incubation'));
// The force-graph bundle is heavy; load it only when the map is opened.
const SymbolMap = lazy(() => import('./pages/SymbolMap'));

const PageFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="h-[calc(100vh-73px)] flex items-center justify-center text-somnora-mist font-serif italic animate-pulse">
      {t('awakening')}
    </div>
  );
};

const App = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route
      element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }
    >
      <Route path="/analyze" element={<Suspense fallback={<PageFallback />}><Analyze /></Suspense>} />
      <Route path="/incubation" element={<Suspense fallback={<PageFallback />}><Incubation /></Suspense>} />
      <Route path="/symbols" element={<Suspense fallback={<PageFallback />}><SymbolMap /></Suspense>} />
    </Route>
    <Route path="*" element={<Navigate to="/analyze" replace />} />
  </Routes>
);

export default App;
