import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Incubation = () => {
  const { t } = useTranslation();
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await axios.post('/api/v1/incubations/', { intention });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-somnora-deep text-somnora-ghost flex items-center justify-center p-8 font-sans">
      <div className="max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-serif italic text-somnora-gold">{t('incubation_title')}</h1>
          <p className="text-somnora-slate max-w-md mx-auto">Plant the seed of inquiry before the veil drops. Tonight, your mind shall seek answers.</p>
        </div>

        <div className="relative space-y-6">
          <label className="block text-sm uppercase tracking-[0.2em] text-somnora-slate pl-2">{t('intention_label')}</label>
          <input 
            type="text"
            className="w-full bg-transparent border-b border-somnora-slate p-4 text-2xl text-center focus:border-somnora-accent outline-none transition-all font-serif italic"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="..."
          />
          <button 
            onClick={handleSave}
            className={`mx-auto block px-10 py-3 rounded-full transition-all duration-700 ${saved ? 'bg-green-500 scale-110' : 'bg-somnora-accent hover:shadow-[0_0_20px_rgba(129,140,248,0.6)]'} text-white`}
          >
            {saved ? "Sealed Into Spirit" : t('save_intention')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Incubation;
