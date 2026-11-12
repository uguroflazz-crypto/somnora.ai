import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '../lib/api';
import { buildNarrationText } from '../lib/dream';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';

const LAYERS = [
  { key: 'physical', label: 'physical_layer', color: 'border-blue-400' },
  { key: 'mental', label: 'mental_layer', color: 'border-purple-400' },
  { key: 'spiritual', label: 'spiritual_layer', color: 'border-somnora-gold' },
];

const Analyze = () => {
  const { t, i18n } = useTranslation();
  const [dreamText, setDreamText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [intentions, setIntentions] = useState([]);
  const [incubationId, setIncubationId] = useState('');
  const closeToast = useCallback(() => setToast(null), []);
  const showError = useCallback((message) => setToast({ message, type: 'error' }), []);

  useEffect(() => {
    let active = true;
    api
      .get('/incubations/active')
      .then((resp) => {
        if (active) setIntentions(resp.data);
      })
      .catch((error) => console.error('Failed to load intentions:', error));
    return () => {
      active = false;
    };
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const resp = await api.post('/dreams/', {
        content: dreamText,
        language: i18n.language === 'tr' ? 'tr' : 'en',
        incubation_id: incubationId || null,
      });
      setResult(resp.data.analysis_result);
    } catch (e) {
      console.error('Dream analysis failed:', e);
      showError(getErrorMessage(e, t('error_analysis')));
    } finally {
      setLoading(false);
    }
  };

  const symbols = result?.symbols ?? [];

  return (
    <div className="min-h-screen bg-somnora-deep text-somnora-ghost p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-serif italic text-somnora-gold">{t('analyze_dream')}</h1>
          <p className="text-somnora-mist opacity-80">{t('unveil_hidden')}</p>
        </header>

        <section className="space-y-4">
          {intentions.length > 0 && (
            <label className="flex flex-wrap items-center justify-end gap-3 text-sm text-somnora-mist">
              <span>{t('link_intention')}</span>
              <select
                value={incubationId}
                onChange={(e) => setIncubationId(e.target.value)}
                className="max-w-xs bg-somnora-midnight border border-somnora-slate rounded-full px-4 py-2 text-somnora-ghost outline-none focus:ring-2 focus:ring-somnora-accent"
              >
                <option value="">{t('no_intention')}</option>
                {intentions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.intention}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="relative group">
            <textarea
              className="w-full h-64 p-6 pb-16 bg-somnora-midnight border border-somnora-slate rounded-2xl focus:ring-2 focus:ring-somnora-accent outline-none transition-all placeholder-somnora-mist/60 text-lg resize-none"
              placeholder={t('placeholder_dream')}
              maxLength={10000}
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !dreamText.trim()}
              className="absolute bottom-4 right-4 px-6 py-2 bg-somnora-accent hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full font-medium transition-all shadow-lg"
            >
              {loading ? t('decoding') : t('synthesize')}
            </button>
          </div>
        </section>

        {loading && (
          <div className="space-y-6 animate-pulse">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-48 bg-somnora-midnight border border-somnora-slate/20 rounded-xl" />
               ))}
             </div>
             <div className="h-32 bg-somnora-midnight border border-somnora-slate/20 rounded-2xl" />
          </div>
        )}

        {result && !loading && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex justify-end">
              <AudioPlayer text={buildNarrationText(result)} onError={showError} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LAYERS.map(({ key, label, color }) => (
                <div key={key} className={`p-6 bg-somnora-midnight border-t-4 ${color} rounded-xl space-y-3 transition-transform hover:scale-[1.02]`}>
                  <h3 className="text-sm uppercase tracking-widest text-somnora-mist font-bold">{t(label)}</h3>
                  <p className="leading-relaxed opacity-90">{result[key]}</p>
                </div>
              ))}
            </div>

            <div className="p-8 bg-somnora-midnight border border-somnora-slate rounded-2xl transition-transform hover:scale-[1.01]">
              <h3 className="text-2xl font-serif italic text-somnora-gold mb-4">{t('synthesis')}</h3>
              <p className="text-lg leading-loose italic opacity-80">{result.synthesis}</p>
            </div>

            {symbols.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {symbols.map((symbol) => (
                  <span
                    key={symbol}
                    className="px-4 py-1.5 text-sm rounded-full border border-somnora-gold/30 bg-somnora-gold/5 text-somnora-gold"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </div>
    </div>
  );
};

export default Analyze;
