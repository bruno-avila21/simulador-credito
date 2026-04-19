import { useState, useMemo, useCallback } from 'react';
import type { SimuladorConfig, ResultadoSimulacion, SistemaAmortizacion } from '../types';
import { generarResultado, generarTextoComparativo, DISCLAIMER_LEGAL } from '../utils/calculos';

interface UseLoanCalculatorResult {
  monto: number;
  setMonto: (monto: number) => void;
  plazo: number;
  setPlazo: (plazo: number) => void;
  sistema: SistemaAmortizacion;
  setSistema: (sistema: SistemaAmortizacion) => void;
  resultado: ResultadoSimulacion;
}

/**
 * Hook principal del simulador. Maneja estado de monto, plazo y sistema,
 * y calcula el ResultadoSimulacion completo con los 3 sistemas de amortización.
 * Usa useMemo para no recalcular si no cambian monto/plazo/tna.
 * @param config - Configuración del simulador
 * @param tna - Tasa nominal anual ya resuelta (de BCRA o manual)
 * @param fuente - Fuente de la TNA ('bcra' | 'manual')
 * @returns Estado y resultado del simulador
 */
export function useLoanCalculator(
  config: SimuladorConfig,
  tna: number,
  fuente: 'bcra' | 'manual'
): UseLoanCalculatorResult {
  const montoInicial = Math.round((config.montoMin + config.montoMax) / 2 / (config.montoStep ?? 100000)) * (config.montoStep ?? 100000);

  const [monto, setMontoState] = useState<number>(montoInicial);
  const [plazo, setPlazoState] = useState<number>(config.plazoOpciones[0] ?? 12);
  const [sistema, setSistemaState] = useState<SistemaAmortizacion>(config.sistemaDefault ?? 'frances');

  const setMonto = useCallback((valor: number) => {
    const step = config.montoStep ?? 100000;
    const clampedValor = Math.min(config.montoMax, Math.max(config.montoMin, valor));
    const roundedValor = Math.round(clampedValor / step) * step;
    setMontoState(roundedValor);
  }, [config.montoMin, config.montoMax, config.montoStep]);

  const setPlazo = useCallback((valor: number) => {
    setPlazoState(valor);
  }, []);

  const setSistema = useCallback((valor: SistemaAmortizacion) => {
    setSistemaState(valor);
  }, []);

  const resultado = useMemo((): ResultadoSimulacion => {
    const frances = generarResultado('frances', monto, plazo, tna);
    const aleman = generarResultado('aleman', monto, plazo, tna);
    const simple = generarResultado('simple', monto, plazo, tna);

    const textoComparativo = generarTextoComparativo(monto, plazo, frances, aleman, simple);

    const resultadoSimulacion: ResultadoSimulacion = {
      monto,
      plazo,
      tna,
      fuente,
      timestamp: new Date().toISOString(),
      resultados: {
        frances,
        aleman,
        simple,
      },
      textoComparativo,
      disclaimer: DISCLAIMER_LEGAL,
    };

    if (config.onSimular) {
      config.onSimular(resultadoSimulacion);
    }

    return resultadoSimulacion;
  }, [monto, plazo, tna, fuente, config]);

  return {
    monto,
    setMonto,
    plazo,
    setPlazo,
    sistema,
    setSistema,
    resultado,
  };
}
