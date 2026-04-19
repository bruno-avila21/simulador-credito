import type { TNAAdapter } from './types';
import { normalizarTNA } from '../calculos';

/**
 * Adaptador de tasa manual (valor fijo).
 * Útil para testing o cuando el cliente provee su propia tasa.
 *
 * @param tna - TNA como decimal (0.45) o porcentaje (45)
 */
export function createManualAdapter(tna: number): TNAAdapter {
  const valorNormalizado = normalizarTNA(tna);

  return {
    nombre: 'manual',
    obtener: async () => ({
      valor: valorNormalizado,
      fuente: 'manual' as const,
      fechaReferencia: new Date().toISOString().split('T')[0] ?? '',
    }),
  };
}
