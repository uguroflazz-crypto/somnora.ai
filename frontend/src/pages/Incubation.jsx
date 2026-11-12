import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '../lib/api';
import Toast from '../components/Toast';

const Incubation = () => {
  const { t } = useTranslation();
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const resetTimer = useRef(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/incubations/', { intention: intention.trim() });
      setSaved(true);
      setIntention('');
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save intention:', error);
      setToast({ message: getErrorMessage(error, t('error_intention')), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-somnora-deep text-somnora-ghost flex items-center justify-center p-8 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-6xl font-serif italic text-somnora-gold">{t('incubation_title')}</h1>
          <p className="text-somnora-mist max-w-md mx-auto">{t('incubation_subtitle')}</p>
        </div>

        <form onSubmit={handleSave} className="relative space-y-6">
          <label htmlFor="intention" className="block text-sm uppercase tracking-[0.2em] text-somnora-mist pl-2">{t('intention_label')}</label>
          <input
            id="intention"
            type="text"
            maxLength={1000}
            className="w-full bg-transparent border-b border-somnora-slate p-4 text-2xl text-center focus:border-somnora-accent outline-none transition-all font-serif italic"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="..."
          />
          <button
            type="submit"
            disabled={saving || (!saved && !intention.trim())}
            className={`mx-auto block px-10 py-3 rounded-full transition-all duration-700 disabled:opacity-50 ${saved ? 'bg-green-500 scale-110' : 'bg-somnora-accent hover:shadow-[0_0_20px_rgba(129,140,248,0.6)]'} text-white`}
          >
            {saved ? t('intention_sealed') : saving ? t('decoding') : t('save_intention')}
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default Incubation;
