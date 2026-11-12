import React, { useCallback, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LanguageToggle from '../components/LanguageToggle';
import Toast from '../components/Toast';

const Auth = () => {
  const { t } = useTranslation();
  const { user, loading, signIn, signUp, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const redirectTo = location.state?.from?.pathname ?? '/analyze';

  if (!loading && user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
      if (error) {
        setToast({ message: error.message || t('auth_error'), type: 'error' });
        return;
      }
      if (mode === 'signup' && !data?.session) {
        setToast({ message: t('auth_check_email'), type: 'success' });
        setMode('login');
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Authentication error:', error);
      setToast({ message: t('auth_error'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-5 py-3 bg-somnora-deep/60 border border-somnora-slate rounded-xl outline-none focus:ring-2 focus:ring-somnora-accent transition-all placeholder-somnora-mist/60';

  return (
    <div className="min-h-screen bg-somnora-deep text-somnora-ghost font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-somnora-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-somnora-gold/10 blur-3xl" />

      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="relative w-full max-w-md space-y-10 animate-fade-in">
        <header className="text-center space-y-4">
          <Moon className="mx-auto text-somnora-gold" size={36} />
          <h1 className="text-5xl font-serif italic text-somnora-gold">Somnora</h1>
          <p className="text-somnora-mist">{t('auth_tagline')}</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-5 bg-somnora-midnight/80 border border-somnora-slate rounded-2xl backdrop-blur-sm shadow-2xl"
        >
          {!isConfigured && (
            <p className="text-sm text-somnora-gold/90 bg-somnora-gold/10 border border-somnora-gold/30 rounded-xl p-3">
              {t('auth_not_configured')}
            </p>
          )}
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-somnora-mist">{t('auth_email')}</span>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-somnora-mist">{t('auth_password')}</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full py-3 bg-somnora-accent hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-[0_0_20px_rgba(129,140,248,0.5)]"
          >
            {submitting ? t('decoding') : t(mode === 'login' ? 'auth_login' : 'auth_signup')}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full text-sm text-somnora-mist hover:text-somnora-gold transition-colors"
          >
            {t(mode === 'login' ? 'auth_switch_to_signup' : 'auth_switch_to_login')}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default Auth;
