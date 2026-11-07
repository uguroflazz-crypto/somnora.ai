import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AudioPlayer from '../components/AudioPlayer';
import Toast from '../components/Toast';

const Analyze = () => {
  const { t } = useTranslation();
  const [dreamText, setDreamText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/dreams/', { 
        content: dreamText, 
        language: i18n.language 
      });
      setResult(resp.data.analysis_result);
    } catch (e) {
      setToast({ message: t('error_analysis'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-somnora-deep text-somnora-ghost p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-serif italic text-somnora-gold">{t('analyze_dream')}</h1>
          <p className="text-somnora-slate opacity-80">{t('unveil_hidden')}</p>
        </header>

        <section className="relative group">
          <textarea 
            className="w-full h-64 p-6 bg-somnora-midnight border border-somnora-slate rounded-2xl focus:ring-2 focus:ring-somnora-accent outline-none transition-all placeholder-somnora-slate text-lg"
            placeholder={t('placeholder_dream')}
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading || !dreamText}
            className="absolute bottom-4 right-4 px-6 py-2 bg-somnora-accent hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full font-medium transition-all shadow-lg"
          >
            {loading ? t('decoding') : t('synthesize')}
          </button>
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
              <AudioPlayer text={\`${result.physical}. \${result.mental}. \${result.spiritual}. \${result.synthesis}\`} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'physical', label: t('physical_layer'), color: 'border-blue-400' },
                { key: 'mental', label: t('mental_layer'), color: 'border-purple-400' },
                { key: 'spiritual', label: t('spiritual_layer'), color: 'border-gold' },
              ].map(({ key, label, color }) => (
                <div key={key} className={\`p-6 bg-somnora-midnight border-t-4 \${color} rounded-xl space-y-3 transition-transform hover:scale-[1.02]\`}>
                  <h3 className="text-sm uppercase tracking-widest text-somnora-slate font-bold">{label}</h3>
                  <p className="leading-relaxed opacity-90">{result[key]}</p>
                </div>
              ))}
            </div>

            <div className="p-8 bg-somnora-midnight border border-somnora-slate rounded-2xl transition-transform hover:scale-[1.01]">
              <h3 className="text-2xl font-serif italic text-somnora-gold mb-4">{t('synthesis')}</h3>
              <p className="text-lg leading-loose italic opacity-80">{result.synthesis}</p>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default Analyze;
