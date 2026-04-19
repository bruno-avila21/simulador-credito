import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseIframeParams, buildConfigFromParams } from '../iframe-params';
import type { SimuladorConfig } from '../../../src/types';

const DEFAULT_CONFIG: SimuladorConfig = {
  montoMin: 500000,
  montoMax: 50000000,
  montoStep: 100000,
  plazoOpciones: [6, 12, 18, 24, 36, 48],
  sistemaDefault: 'frances',
  tema: 'light',
  moneda: 'ARS',
  locale: 'es-AR',
};

// Helper: setea window.location.search para simular una URL de iframe
function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, search },
  });
}

describe('parseIframeParams', () => {
  afterEach(() => {
    setSearch('');
  });

  it('retorna objeto vacío cuando no hay params', () => {
    setSearch('');
    const result = parseIframeParams();
    expect(result).toEqual({});
  });

  it('parsea montoMin y montoMax', () => {
    setSearch('?montoMin=100000&montoMax=10000000');
    const result = parseIframeParams();
    expect(result.montoMin).toBe(100000);
    expect(result.montoMax).toBe(10000000);
  });

  it('parsea montoStep', () => {
    setSearch('?montoStep=50000');
    const result = parseIframeParams();
    expect(result.montoStep).toBe(50000);
  });

  it('parsea plazoOpciones como array de numbers', () => {
    setSearch('?plazoOpciones=12,24,36');
    const result = parseIframeParams();
    expect(result.plazoOpciones).toEqual([12, 24, 36]);
  });

  it('filtra valores inválidos en plazoOpciones', () => {
    setSearch('?plazoOpciones=12,abc,36,0,-5');
    const result = parseIframeParams();
    // 'abc' → NaN (filtrado), 0 y -5 → filtrados por n > 0
    expect(result.plazoOpciones).toEqual([12, 36]);
  });

  it('parsea tna como número', () => {
    setSearch('?tna=45');
    const result = parseIframeParams();
    expect(result.tna).toBe(45);
  });

  it('parsea sistema frances', () => {
    setSearch('?sistema=frances');
    const result = parseIframeParams();
    expect(result.sistema).toBe('frances');
  });

  it('parsea sistema aleman', () => {
    setSearch('?sistema=aleman');
    const result = parseIframeParams();
    expect(result.sistema).toBe('aleman');
  });

  it('parsea sistema simple', () => {
    setSearch('?sistema=simple');
    const result = parseIframeParams();
    expect(result.sistema).toBe('simple');
  });

  it('ignora sistema inválido', () => {
    setSearch('?sistema=invalido');
    const result = parseIframeParams();
    expect(result.sistema).toBeUndefined();
  });

  it('parsea tema light', () => {
    setSearch('?tema=light');
    const result = parseIframeParams();
    expect(result.tema).toBe('light');
  });

  it('parsea tema dark', () => {
    setSearch('?tema=dark');
    const result = parseIframeParams();
    expect(result.tema).toBe('dark');
  });

  it('ignora tema inválido', () => {
    setSearch('?tema=blue');
    const result = parseIframeParams();
    expect(result.tema).toBeUndefined();
  });

  it('parsea moneda y locale', () => {
    setSearch('?moneda=USD&locale=en-US');
    const result = parseIframeParams();
    expect(result.moneda).toBe('USD');
    expect(result.locale).toBe('en-US');
  });

  it('parsea backendUrl', () => {
    setSearch('?backendUrl=https://mi-app.vercel.app');
    const result = parseIframeParams();
    expect(result.backendUrl).toBe('https://mi-app.vercel.app');
  });

  it('parsea múltiples params combinados', () => {
    setSearch('?montoMax=30000000&plazoOpciones=12,24,36&tna=45&tema=dark');
    const result = parseIframeParams();
    expect(result.montoMax).toBe(30000000);
    expect(result.plazoOpciones).toEqual([12, 24, 36]);
    expect(result.tna).toBe(45);
    expect(result.tema).toBe('dark');
  });
});

describe('buildConfigFromParams', () => {
  it('retorna los defaults cuando params está vacío', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, {});
    expect(result).toEqual(DEFAULT_CONFIG);
  });

  it('aplica override de montoMax', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { montoMax: 30000000 });
    expect(result.montoMax).toBe(30000000);
    expect(result.montoMin).toBe(DEFAULT_CONFIG.montoMin); // no tocado
  });

  it('aplica override de plazoOpciones', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { plazoOpciones: [12, 24, 36] });
    expect(result.plazoOpciones).toEqual([12, 24, 36]);
  });

  it('ignora plazoOpciones vacío (array vacío no reemplaza)', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { plazoOpciones: [] });
    expect(result.plazoOpciones).toEqual(DEFAULT_CONFIG.plazoOpciones);
  });

  it('aplica override de tna', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { tna: 45 });
    expect(result.tna).toBe(45);
  });

  it('aplica override de sistema como sistemaDefault', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { sistema: 'aleman' });
    expect(result.sistemaDefault).toBe('aleman');
  });

  it('aplica override de tema', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { tema: 'dark' });
    expect(result.tema).toBe('dark');
  });

  it('aplica override de moneda y locale', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, { moneda: 'USD', locale: 'en-US' });
    expect(result.moneda).toBe('USD');
    expect(result.locale).toBe('en-US');
  });

  it('aplica múltiples overrides combinados', () => {
    const result = buildConfigFromParams(DEFAULT_CONFIG, {
      montoMax: 30000000,
      plazoOpciones: [12, 24],
      tema: 'dark',
    });
    expect(result.montoMax).toBe(30000000);
    expect(result.plazoOpciones).toEqual([12, 24]);
    expect(result.tema).toBe('dark');
    expect(result.montoMin).toBe(DEFAULT_CONFIG.montoMin);
  });

  it('no muta el objeto defaults', () => {
    const defaults = { ...DEFAULT_CONFIG };
    buildConfigFromParams(defaults, { montoMax: 1000000 });
    expect(defaults.montoMax).toBe(50000000);
  });
});
