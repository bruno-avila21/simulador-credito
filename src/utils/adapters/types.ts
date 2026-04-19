/**
 * Resultado que cualquier adaptador de TNA debe retornar.
 */
export interface TNAAdapterResult {
  valor: number;            // Decimal normalizado (ej: 0.38 = 38%)
  fuente: 'bcra' | 'manual' | 'backend' | string;
  fechaReferencia?: string; // 'YYYY-MM-DD'
}

/**
 * Interfaz de adaptador de TNA.
 * Implementar esta interfaz para conectar cualquier fuente de tasas.
 *
 * Ejemplo:
 *   const miAdaptador: TNAAdapter = {
 *     nombre: 'mi-banco',
 *     obtener: async () => ({ valor: 0.42, fuente: 'mi-banco' })
 *   };
 */
export interface TNAAdapter {
  /** Identificador legible del adaptador */
  nombre: string;
  /** Función que retorna la TNA actual */
  obtener: () => Promise<TNAAdapterResult>;
}
