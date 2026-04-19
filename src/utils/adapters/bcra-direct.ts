import type { TNAAdapter, TNAAdapterResult } from './types';
import { normalizarTNA, TNA_FALLBACK } from '../calculos';
import type { BCRAResponse, BCRAVariableDetalle } from '../../types';

const BCRA_BASE_URL = 'https://api.bcra.gob.ar/estadisticas/v4.0';
const ID_VARIABLE_TNA = 7;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

let _cache: { resultado: TNAAdapterResult; timestamp: number } | null = null;

async function obtenerDesdeBCRA(): Promise<TNAAdapterResult> {
  if (_cache !== null && Date.now() - _cache.timestamp < CACHE_TTL_MS) {
    return _cache.resultado;
  }

  try {
    const url = `${BCRA_BASE_URL}/monetarias/${ID_VARIABLE_TNA}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'Accept-Language': 'es-AR' },
    });

    if (!response.ok) throw new Error(`BCRA HTTP ${response.status}`);

    const data = await response.json() as BCRAResponse<BCRAVariableDetalle>;
    const detalle = data.results[0]?.detalle?.[0];

    if (!detalle) throw new Error('BCRA: sin datos en detalle');

    const resultado: TNAAdapterResult = {
      valor: normalizarTNA(detalle.valor),
      fuente: 'bcra',
      fechaReferencia: detalle.fecha,
    };

    _cache = { resultado, timestamp: Date.now() };
    return resultado;

  } catch {
    const fallback: TNAAdapterResult = {
      valor: TNA_FALLBACK,
      fuente: 'manual',
      fechaReferencia: new Date().toISOString().split('T')[0] ?? '',
    };
    _cache = { resultado: fallback, timestamp: Date.now() };
    return fallback;
  }
}

export const bcraDirectAdapter: TNAAdapter = {
  nombre: 'bcra-direct',
  obtener: obtenerDesdeBCRA,
};

/**
 * Invalida el cache del adaptador bcra-direct para forzar un nuevo fetch
 */
export function invalidarCacheBCRADirect(): void {
  _cache = null;
}
