import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw } from 'lucide-react';

const AudioPlayer = ({ text }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const playAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/v1/narration/synthesize', 
        { text, voice: 'nova', speed: 1.0 }, 
        { responseType: 'blob' }
      );
      
      const url = URL.createObjectURL(response.data);
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = url;
      }
      
      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Narration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current?.currentTime = 0;
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-somnora-midnight/50 border border-somnora-slate/30 rounded-full backdrop-blur-sm w-fit">
      <button 
        onClick={playAudio}
        disabled={isLoading}
        className="p-2 bg-somnora-accent hover:bg-indigo-500 text-white rounded-full transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} />
        ) : (
          <Play size={18} fill="currentColor" />
        )}
      </button>
      <button 
        onClick={stopAudio}
        className="p-2 text-somnora-slate hover:text-somnora-gold transition-colors"
      >
        <RotateCcw size={18} />
      </button>
      <span className="text-xs uppercase tracking-tighter text-somnora-slate mr-3">
        {t('voice_narration')}
      </span>
    </div>
  );
};

export default AudioPlayer;
