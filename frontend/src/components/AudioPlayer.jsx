import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

const AudioPlayer = ({ text, onError }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const urlRef = useRef(null);
  const loadedTextRef = useRef(null);

  const releaseAudio = () => {
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    loadedTextRef.current = null;
  };

  // New analysis text invalidates the cached clip; unmount frees the blob URL.
  useEffect(() => {
    setIsPlaying(false);
    return releaseAudio;
  }, [text]);

  const playAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    try {
      if (loadedTextRef.current !== text) {
        setIsLoading(true);
        const response = await api.post(
          '/narration/synthesize',
          { text, voice: 'nova', speed: 1.0 },
          { responseType: 'blob' },
        );
        releaseAudio();
        urlRef.current = URL.createObjectURL(response.data);
        loadedTextRef.current = text;
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => setIsPlaying(false);
        }
        audioRef.current.src = urlRef.current;
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Narration error:", error);
      onError?.(getErrorMessage(error, t('error_narration')));
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-somnora-midnight/50 border border-somnora-slate/30 rounded-full backdrop-blur-sm w-fit">
      <button
        onClick={playAudio}
        disabled={isLoading || !text}
        aria-label={t('voice_narration')}
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
        aria-label={t('stop')}
        className="p-2 text-somnora-mist hover:text-somnora-gold transition-colors"
      >
        <RotateCcw size={18} />
      </button>
      <span className="text-xs uppercase tracking-tighter text-somnora-mist mr-3">
        {t('voice_narration')}
      </span>
    </div>
  );
};

export default AudioPlayer;
