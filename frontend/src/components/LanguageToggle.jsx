import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/config';

const LanguageToggle = () => {
  const { t, i18n } = useTranslation();

  return (
    <div role="group" aria-label={t('language')} className="flex rounded-full border border-somnora-slate p-0.5 text-xs">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={i18n.language === lng}
          className={`px-3 py-1 rounded-full uppercase tracking-widest transition-colors ${
            i18n.language === lng ? 'bg-somnora-accent text-white' : 'text-somnora-mist hover:text-somnora-ghost'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
