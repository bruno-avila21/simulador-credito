import type { SimuladorConfig, SistemaAmortizacion, IframeURLParams } from '../../src/types';

/**
 * Parsea los search params de la URL para configurar el widget como iframe.
 *
 * Ejemplo de URL:
 * ?montoMax=30000000&plazoOpciones=12,24,36&tna=45&tema=dark&backendUrl=https://mi-app.vercel.app
 */
export function parseIframeParams(): IframeURLParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result: IframeURLParams = {};

  const montoMin = params.get('montoMin');
  if (montoMin !== null) result.montoMin = Number(montoMin);

  const montoMax = params.get('montoMax');
  if (montoMax !== null) result.montoMax = Number(montoMax);

  const montoStep = params.get('montoStep');
  if (montoStep !== null) result.montoStep = Number(montoStep);

  const plazoOpciones = params.get('plazoOpciones');
  if (plazoOpciones !== null) {
    result.plazoOpciones = plazoOpciones.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
  }

  const tna = params.get('tna');
  if (tna !== null) result.tna = Number(tna);

  const sistema = params.get('sistema');
  if (sistema === 'frances' || sistema === 'aleman' || sistema === 'simple') {
    result.sistema = sistema satisfies SistemaAmortizacion;
  }

  const tema = params.get('tema');
  if (tema === 'light' || tema === 'dark') result.tema = tema;

  const moneda = params.get('moneda');
  if (moneda !== null) result.moneda = moneda;

  const locale = params.get('locale');
  if (locale !== null) result.locale = locale;

  const backendUrl = params.get('backendUrl');
  if (backendUrl !== null) result.backendUrl = backendUrl;

  return result;
}

/**
 * Convierte IframeURLParams a SimuladorConfig completo,
 * mezclando con los defaults provistos.
 *
 * @param defaults - Config base del simulador
 * @param params - Params parseados desde la URL
 * @returns SimuladorConfig final con los overrides aplicados
 */
export function buildConfigFromParams(
  defaults: SimuladorConfig,
  params: IframeURLParams
): SimuladorConfig {
  return {
    ...defaults,
    ...(params.montoMin !== undefined && { montoMin: params.montoMin }),
    ...(params.montoMax !== undefined && { montoMax: params.montoMax }),
    ...(params.montoStep !== undefined && { montoStep: params.montoStep }),
    ...(params.plazoOpciones !== undefined && params.plazoOpciones.length > 0 && { plazoOpciones: params.plazoOpciones }),
    ...(params.tna !== undefined && { tna: params.tna }),
    ...(params.sistema !== undefined && { sistemaDefault: params.sistema }),
    ...(params.tema !== undefined && { tema: params.tema }),
    ...(params.moneda !== undefined && { moneda: params.moneda }),
    ...(params.locale !== undefined && { locale: params.locale }),
  };
}
