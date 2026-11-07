import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';

const SymbolMap = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchSymbols = async () => {
      const res = await axios.get('/api/v1/symbols/');
      const symbols = res.data;
      
      const nodes = symbols.map(s => ({ 
        id: s.symbol_name, 
        val: s.occurrence_count, 
        color: '#fbbf24' 
      }));
      
      // Dummy links for structural beauty (typically inferred from co-occurrence)
      const links = [];
      for(let i=0; i<nodes.length; i++) {
        if (nodes[i+1]) links.push({ source: nodes[i].id, target: nodes[i+1].id });
      }

      setGraphData({ nodes, links });
    };
    fetchSymbols();
  }, []);

  return (
    <div className="h-screen bg-somnora-deep text-somnora-ghost overflow-hidden relative font-sans">
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <h1 className="text-5xl font-serif italic text-somnora-gold">Symbol Resonance</h1>
        <p className="text-somnora-slate mt-2">Visualizing therecurring geometry of your unconscious.</p>
      </div>

      <ForceGraph2D
        graphData={graphData}
        backgroundColor="#020617"
        nodeLabel="id"
        nodeColor={() => "#818cf8"}
        linkColor={() => "#1e293b"}
        nodeVal={(node) => Math.sqrt(node.val) * 5}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default SymbolMap;
