import { describe, expect, it } from 'vitest';
import { buildNarrationText, buildSymbolGraph, MAX_NARRATION_LENGTH } from './dream';
import { getErrorMessage } from './errors';

describe('buildNarrationText', () => {
  it('joins layers without doubled punctuation', () => {
    expect(
      buildNarrationText({ physical: 'Rest.', mental: 'Fear', spiritual: ' Growth ', synthesis: 'Change.' }),
    ).toBe('Rest. Fear. Growth. Change.');
  });

  it('skips empty layers and handles null', () => {
    expect(buildNarrationText({ physical: '', synthesis: 'Only' })).toBe('Only.');
    expect(buildNarrationText(null)).toBe('');
  });

  it('trims to the TTS limit', () => {
    const text = buildNarrationText({ synthesis: 'a'.repeat(5000) });
    expect(text.length).toBe(MAX_NARRATION_LENGTH);
  });
});

describe('buildSymbolGraph', () => {
  it('sorts by occurrence and chains links', () => {
    const graph = buildSymbolGraph([
      { symbol_name: 'door', occurrence_count: 1 },
      { symbol_name: 'water', occurrence_count: 5 },
      { symbol_name: '', occurrence_count: 9 },
    ]);
    expect(graph.nodes.map((n) => n.id)).toEqual(['water', 'door']);
    expect(graph.links).toEqual([{ source: 'water', target: 'door' }]);
  });

  it('returns empty graph for no data', () => {
    expect(buildSymbolGraph(undefined)).toEqual({ nodes: [], links: [] });
  });
});

describe('getErrorMessage', () => {
  it('prefers API detail strings', () => {
    expect(getErrorMessage({ response: { data: { detail: 'Nope' } } }, 'x')).toBe('Nope');
  });

  it('reads validation error arrays', () => {
    expect(getErrorMessage({ response: { data: { detail: [{ msg: 'Too long' }] } } }, 'x')).toBe('Too long');
  });

  it('falls back for HTTP errors without detail', () => {
    expect(getErrorMessage({ message: 'Request failed', response: { data: {} } }, 'fallback')).toBe('fallback');
  });
});
