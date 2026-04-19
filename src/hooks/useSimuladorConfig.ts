import { useState, useEffect, useRef } from 'react';
import type { SimuladorConfig } from '../types';
import { obtenerTNA } from '../utils/bcra';
import { normalizarTNA, TNA_FALLBACK } from '../utils/calculos';

interface UseSimuladorConfigResult {
  tna: number;
  fuente: 'bcra' | 'manual';
  cargando: boolean;
  error: string | null;
  configFinal: SimuladorConfig;
}

/**
 * Hook que resuelve la TNA para el simulador.
 * Si config.tna está definido, lo usa directamente (fuente: 'manual').
 * Si config.tnaAdapter está definido, delega la obtención al adaptador.
 * Si ninguno, llama a obtenerTNA() del servicio BCRA (fuente: 'bcra' o 'manual' si falla).
 * 'cargando' es true solo el primer render mientras fetchea.
 * @param config - Configuración del simulador
 * @returns TNA resuelta, fuente, estado de carga, error y config final
 */
export function useSimuladorConfig(config: SimuladorConfig): UseSimuladorConfigResult {
  const tnaManual = config.tna !== undefined ? normalizarTNA(config.tna) : null;
  const adapterRef = useRef(config.tnaAdapter);

  const [tna, setTna] = useState<number>(tnaManual ?? TNA_FALLBACK);
  const [fuente, setFuente] = useState<'bcra' | 'manual'>(tnaManual !== null ? 'manual' : 'bcra');
  const [cargando, setCargando] = useState<boolean>(tnaManual === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tnaManual !== null) {
      setTna(tnaManual);
      setFuente('manual');
      setCargando(false);
      return;
    }

    let cancelado = false;

    const fetchTNA = async () => {
      try {
        let valor: number;
        let fuenteResultado: 'bcra' | 'manual';

        if (adapterRef.current) {
          // Usar adaptador custom
          const resultado = await adapterRef.current.obtener();
          valor = resultado.valor;
          fuenteResultado = resultado.fuente === 'bcra' ? 'bcra' : 'manual';
        } else {
          // Usar BCRA directo (comportamiento anterior)
          const cache = await obtenerTNA();
          valor = cache.valor;
          fuenteResultado = cache.fuente;
        }

        if (!cancelado) {
          setTna(valor);
          setFuente(fuenteResultado);
          setError(null);
        }
      } catch {
        if (!cancelado) {
          setTna(TNA_FALLBACK);
          setFuente('manual');
          setError('No se pudo obtener la tasa. Se usa tasa de referencia.');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    void fetchTNA();
    return () => {
      cancelado = true;
    };
  }, [tnaManual]);

  const configFinal: SimuladorConfig = {
    ...config,
    tna,
  };

  return {
    tna,
    fuente,
    cargando,
    error,
    configFinal,
  };
}
