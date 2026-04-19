import { memo } from 'react';
import type { SimuladorConfig } from '../types';
import { useSimuladorConfig } from '../hooks/useSimuladorConfig';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import { SliderMonto } from './SliderMonto';
import { SelectorPlazo } from './SelectorPlazo';
import { SelectorSistema } from './SelectorSistema';
import { ResumenResultado } from './ResumenResultado';
import { GraficoAmortizacion } from './GraficoAmortizacion';
import { TablaAmortizacion } from './TablaAmortizacion';
import { TextoComparativo } from './TextoComparativo';
import { DisclaimerLegal } from './DisclaimerLegal';
import { formatearPorcentaje } from '../utils/formatters';

interface SimuladorCreditoProps {
  config: SimuladorConfig;
}

const LoadingState = memo(() => (
  <div className="sc-loading" role="status" aria-live="polite">
    <div className="sc-loading-spinner" aria-hidden="true" />
    <p className="sc-loading-texto">Obteniendo tasa del BCRA...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

export const SimuladorCredito = memo(({ config }: SimuladorCreditoProps) => {
  const { tna, fuente, cargando, error, configFinal } = useSimuladorConfig(config);

  const {
    monto,
    setMonto,
    plazo,
    setPlazo,
    sistema,
    setSistema,
    resultado,
  } = useLoanCalculator(configFinal, tna, fuente);

  const moneda = configFinal.moneda ?? 'ARS';
  const locale = configFinal.locale ?? 'es-AR';
  const tema = configFinal.tema ?? 'light';
  const step = configFinal.montoStep ?? 100000;

  const resultadoSistemaActual = resultado.resultados[sistema];

  return (
    <div
      className="sc-simulador-container"
      data-sc-tema={tema}
    >
      <header className="sc-header">
        <h2 className="sc-titulo">Simulador de Crédito Prendario</h2>
        <div className="sc-tna-info">
          <span className="sc-tna-info-label">TNA:</span>
          <span className="sc-tna-info-valor">{formatearPorcentaje(tna)}</span>
          <span className={`sc-fuente-badge sc-fuente-badge--${fuente}`}>
            {fuente === 'bcra' ? 'BCRA' : 'Manual'}
          </span>
        </div>
      </header>

      {error && (
        <div className="sc-alerta sc-alerta--aviso" role="alert">
          {error}
        </div>
      )}

      {cargando ? (
        <LoadingState />
      ) : (
        <div className="sc-contenido">
          <section className="sc-card sc-seccion-controles">
            <SliderMonto
              valor={monto}
              min={configFinal.montoMin}
              max={configFinal.montoMax}
              step={step}
              onChange={setMonto}
            />
            <SelectorPlazo
              plazoSeleccionado={plazo}
              opciones={configFinal.plazoOpciones}
              onChange={setPlazo}
            />
            <SelectorSistema
              sistemaSeleccionado={sistema}
              onChange={setSistema}
            />
          </section>

          <section className="sc-card">
            <ResumenResultado
              resultado={resultadoSistemaActual}
              monto={monto}
              tna={tna}
              fuente={fuente}
            />
          </section>

          <section className="sc-card">
            <GraficoAmortizacion
              tabla={resultadoSistemaActual.tabla}
              moneda={moneda}
            />
          </section>

          <section className="sc-card">
            <TablaAmortizacion
              tabla={resultadoSistemaActual.tabla}
              moneda={moneda}
              locale={locale}
            />
          </section>

          <section className="sc-card sc-card--sutil">
            <TextoComparativo textoComparativo={resultado.textoComparativo} />
          </section>

          <DisclaimerLegal
            disclaimer={resultado.disclaimer}
            timestamp={resultado.timestamp}
          />
        </div>
      )}
    </div>
  );
});

SimuladorCredito.displayName = 'SimuladorCredito';
