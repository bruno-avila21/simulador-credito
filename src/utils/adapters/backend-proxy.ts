import type { TNAAdapter, TNAAdapterResult } from './types';
import { TNA_FALLBACK } from '../calculos';

/**
 * Adaptador que obtiene la TNA desde el backend proxy (/api/tna).
 * Usar cuando el widget está embebido en un sitio que tiene el backend deployado.
 *
 * @param backendUrl - URL base del backend (ej: 'https://mi-app.vercel.app')
 *                     Default: '' (relativo, para mismo dominio)
 */
export function createBackendProxyAdapter(backendUrl = ''): TNAAdapter {
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora client-side
  let _cache: { resultado: TNAAdapterResult; timestamp: number } | null = null;

  return {
    nombre: 'backend-proxy',
    obtener: async (): Promise<TNAAdapterResult> => {
      if (_cache !== null && Date.now() - _cache.timestamp < CACHE_TTL_MS) {
        return _cache.resultado;
      }

      try {
        const url = `${backendUrl}/api/tna`;
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);

        const data = await response.json() as {
          valor: number;
          fuente: string;
          fechaBCRA: string;
        };

        const resultado: TNAAdapterResult = {
          valor: data.valor,
          fuente: data.fuente,
          fechaReferencia: data.fechaBCRA,
        };

        _cache = { resultado, timestamp: Date.now() };
        return resultado;

      } catch {
        return {
          valor: TNA_FALLBACK,
          fuente: 'manual',
          fechaReferencia: new Date().toISOString().split('T')[0] ?? '',
        };
      }
    },
  };
}
