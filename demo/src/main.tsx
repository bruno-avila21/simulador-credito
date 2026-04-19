import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SimuladorCredito } from '../../src/index';
import { createBackendProxyAdapter } from '../../src/utils/adapters';
import type { SimuladorConfig, ResultadoSimulacion } from '../../src/types';
import { parseIframeParams, buildConfigFromParams } from './iframe-params';
import { notificarSimulacion, notificarListo } from './postmessage';
import '../../src/styles/widget.css';

const DEFAULT_CONFIG: SimuladorConfig = {
  montoMin: 500000,
  montoMax: 50000000,
  montoStep: 100000,
  plazoOpciones: [6, 12, 18, 24, 36, 48],
  sistemaDefault: 'frances',
  tema: 'light',
  moneda: 'ARS',
  locale: 'es-AR',
};

// Parsear params de URL (para uso como iframe)
const urlParams = parseIframeParams();
const baseConfig = buildConfigFromParams(DEFAULT_CONFIG, urlParams);

// Si se pasó backendUrl y no hay tna manual, usar backend-proxy adapter
const config: SimuladorConfig =
  urlParams.backendUrl !== undefined && baseConfig.tna === undefined
    ? { ...baseConfig, tnaAdapter: createBackendProxyAdapter(urlParams.backendUrl) }
    : baseConfig;

// Callback que notifica al parent via PostMessage
const handleSimular = (resultado: ResultadoSimulacion) => {
  notificarSimulacion(resultado);
};

function App() {
  useEffect(() => {
    notificarListo();
  }, []);

  return <SimuladorCredito config={{ ...config, onSimular: handleSimular }} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('No se encontró #root');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
