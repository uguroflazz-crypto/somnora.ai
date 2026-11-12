// OpenAI TTS input limit enforced by the backend.
export const MAX_NARRATION_LENGTH = 4096;

/**
 * Joins the analysis layers into one narration script, trimmed to the TTS limit.
 * @param {{physical?: string, mental?: string, spiritual?: string, synthesis?: string} | null} result
 * @returns {string}
 */
export const buildNarrationText = (result) => {
  if (!result) return '';
  const text = [result.physical, result.mental, result.spiritual, result.synthesis]
    .filter((part) => typeof part === 'string' && part.trim())
    .map((part) => part.trim().replace(/[.\s]+$/, ''))
    .join('. ');
  if (!text) return '';
  const sentence = `${text}.`;
  return sentence.length > MAX_NARRATION_LENGTH
    ? `${sentence.slice(0, MAX_NARRATION_LENGTH - 1)}…`
    : sentence;
};

/**
 * Builds force-graph data from personal symbols, largest first.
 * Links chain neighbouring symbols by frequency until co-occurrence data is exposed.
 * @param {Array<{symbol_name: string, occurrence_count: number}>} symbols
 * @returns {{nodes: Array<{id: string, val: number, rank: number}>, links: Array<{source: string, target: string}>}}
 */
export const buildSymbolGraph = (symbols) => {
  const nodes = [...(symbols ?? [])]
    .filter((s) => s && typeof s.symbol_name === 'string' && s.symbol_name.trim())
    .sort((a, b) => (b.occurrence_count ?? 0) - (a.occurrence_count ?? 0))
    .map((s, rank) => ({ id: s.symbol_name, val: Math.max(1, s.occurrence_count ?? 1), rank }));

  const links = nodes.slice(1).map((node, i) => ({ source: nodes[i].id, target: node.id }));
  return { nodes, links };
};
