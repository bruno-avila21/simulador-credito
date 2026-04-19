import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SimuladorCredito } from './components/SimuladorCredito';
import type { SimuladorConfig } from './types';
import './styles/widget.css';

declare global {
  interface Window {
    SimuladorCredito: {
      init: (options: { container: string | HTMLElement; config?: Partial<SimuladorConfig> }) => void;
    };
  }
}

if (typeof window !== 'undefined') {
  window.SimuladorCredito = {
    init({ container, config = {} }) {
      const el =
        typeof container === 'string'
          ? document.querySelector(container)
          : container;

      if (!el) throw new Error(`SimuladorCredito: container "${String(container)}" no encontrado`);

      const defaultConfig: SimuladorConfig = {
        montoMin: 500000,
        montoMax: 50000000,
        montoStep: 100000,
        plazoOpciones: [6, 12, 18, 24, 36, 48],
        // tna no seteado → fetchea del BCRA
        sistemaDefault: 'frances',
        tema: 'light',
        moneda: 'ARS',
        locale: 'es-AR',
        ...config,
      };

      createRoot(el).render(
        createElement(SimuladorCredito, { config: defaultConfig })
      );
    },
  };
}
