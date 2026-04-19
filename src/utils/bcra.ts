// Backward compatibility: re-exporta invalidarCacheTNA desde el adaptador bcra-direct
export { invalidarCacheBCRADirect as invalidarCacheTNA } from './adapters/bcra-direct';
import { bcraDirectAdapter } from './adapters/bcra-direct';
import type { TNACache } from '../types';

/**
 * Obtiene la TNA delegando al adaptador bcra-direct.
 * Mantiene la firma anterior para compatibilidad con useSimuladorConfig.
 * @returns TNACache con valor, fuente, timestamp y fechaBCRA
 */
export async function obtenerTNA(): Promise<TNACache> {
  const resultado = await bcraDirectAdapter.obtener();
  return {
    valor: resultado.valor,
    fuente: resultado.fuente === 'bcra' ? 'bcra' : 'manual',
    timestamp: Date.now(),
    fechaBCRA: resultado.fechaReferencia ?? new Date().toISOString().split('T')[0] ?? '',
  };
}

/**
 * Retorna null — el cache ahora vive en bcra-direct.
 * Se mantiene por backward compatibility.
 * @returns null
 */
export function obtenerCacheActual(): null {
  return null;
}
