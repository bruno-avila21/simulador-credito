import type { ResultadoSimulacion, IframeMessage } from '../../src/types';

/**
 * Envía un mensaje PostMessage al parent window cuando hay una simulación.
 * Seguro: solo envía si hay parent diferente al propio window.
 *
 * Uso en la página host:
 * ```javascript
 * window.addEventListener('message', (event) => {
 *   if (event.data?.origen === 'simulador-credito') {
 *     console.log(event.data.payload); // ResultadoSimulacion
 *   }
 * });
 * ```
 *
 * @param resultado - Resultado de la simulación a enviar al parent
 */
export function notificarSimulacion(resultado: ResultadoSimulacion): void {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return; // No es iframe

  const mensaje: IframeMessage = {
    type: 'SIMULACION_ACTUALIZADA',
    origen: 'simulador-credito',
    payload: resultado,
    timestamp: new Date().toISOString(),
  };

  window.parent.postMessage(mensaje, '*');
}

/**
 * Notifica al parent que el simulador está listo y montado.
 */
export function notificarListo(): void {
  if (typeof window === 'undefined') return;
  if (window.parent === window) return;

  const mensaje: IframeMessage = {
    type: 'SIMULACION_LISTA',
    origen: 'simulador-credito',
    payload: null,
    timestamp: new Date().toISOString(),
  };

  window.parent.postMessage(mensaje, '*');
}
