export { SimuladorCredito } from './components/SimuladorCredito';
export type {
  SimuladorConfig,
  ResultadoSimulacion,
  ResultadoCalculo,
  FilaAmortizacion,
  SistemaAmortizacion,
  TNAAdapter,
  IframeMessage,
} from './types';
// Adaptadores públicos
export { bcraDirectAdapter, createBackendProxyAdapter, createManualAdapter } from './utils/adapters';
export type { TNAAdapterResult } from './utils/adapters';
