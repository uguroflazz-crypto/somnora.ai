import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LanguageToggle from '../LanguageToggle';

const NAV_ITEMS = [
  { to: '/analyze', label: 'nav_analyze' },
  { to: '/incubation', label: 'nav_incubation' },
  { to: '/symbols', label: 'nav_symbols' },
];

const AppShell = () => {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-somnora-deep">
      <header className="sticky top-0 z-30 border-b border-somnora-slate/60 bg-somnora-deep/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/analyze" className="flex items-center gap-2 text-somnora-gold">
            <Moon size={20} />
            <span className="font-serif italic text-xl">Somnora</span>
          </NavLink>

          <nav className="flex items-center gap-1 text-sm">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full transition-colors ${
                    isActive ? 'bg-somnora-midnight text-somnora-ghost' : 'text-somnora-mist hover:text-somnora-ghost'
                  }`
                }
              >
                {t(label)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={signOut}
              title={t('logout')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-somnora-mist hover:text-somnora-gold transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
