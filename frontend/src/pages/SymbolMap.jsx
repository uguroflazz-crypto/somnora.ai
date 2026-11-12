import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '../lib/api';
import { buildSymbolGraph } from '../lib/dream';

const TOP_SYMBOL_COUNT = 3;

const useElementSize = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

const SymbolMap = () => {
  const { t } = useTranslation();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const { width, height } = useElementSize(containerRef);

  useEffect(() => {
    let active = true;
    const fetchSymbols = async () => {
      try {
        const res = await api.get('/symbols/');
        if (!active) return;
        setGraphData(buildSymbolGraph(res.data));
        setStatus('ready');
      } catch (e) {
        console.error('Failed to load symbols:', e);
        if (!active) return;
        setError(getErrorMessage(e, t('error_symbols')));
        setStatus('error');
      }
    };
    fetchSymbols();
    return () => {
      active = false;
    };
  }, [t]);

  const drawNode = useCallback((node, ctx, globalScale) => {
    const radius = Math.sqrt(node.val) * 4 + 3;
    const isTop = node.rank < TOP_SYMBOL_COUNT;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isTop ? '#fbbf24' : '#818cf8';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
    ctx.fillText(node.id, node.x, node.y + radius + 2);
  }, []);

  return (
    <div ref={containerRef} className="h-[calc(100vh-73px)] bg-somnora-deep text-somnora-ghost overflow-hidden relative font-sans">
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <h1 className="text-5xl font-serif italic text-somnora-gold">{t('symbol_resonance')}</h1>
        <p className="text-somnora-mist mt-2">{t('symbol_subtitle')}</p>
      </div>

      {status === 'ready' && graphData.nodes.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-somnora-mist italic">
          {t('symbols_empty')}
        </p>
      )}
      {status === 'error' && (
        <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-red-400">{error}</p>
      )}
      {status === 'loading' && (
        <p className="absolute inset-0 flex items-center justify-center text-somnora-mist font-serif italic animate-pulse">
          {t('awakening')}
        </p>
      )}

      {width > 0 && graphData.nodes.length > 0 && (
        <ForceGraph2D
          graphData={graphData}
          backgroundColor="#020617"
          nodeLabel={(node) => `${node.id} · ${node.val}`}
          nodeCanvasObject={drawNode}
          linkColor={() => "#1e293b"}
          nodeVal={(node) => Math.sqrt(node.val) * 5}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default SymbolMap;
