// Sistemas de amortización disponibles
export type SistemaAmortizacion = 'frances' | 'aleman' | 'simple';

// Configuración del widget
export interface SimuladorConfig {
  montoMin: number;
  montoMax: number;
  montoStep?: number;
  plazoOpciones: number[];        // [6, 12, 18, 24, 36, 48]
  tna?: number;                   // Si no se provee, se fetchea del BCRA
  tnaAdapter?: TNAAdapter;        // Adaptador custom de TNA (opcional)
  sistemaDefault?: SistemaAmortizacion;
  tema?: 'light' | 'dark';
  moneda?: string;                // 'ARS'
  locale?: string;                // 'es-AR'
  onSimular?: (resultado: ResultadoSimulacion) => void;
}

// Una fila de la tabla de amortización
export interface FilaAmortizacion {
  periodo: number;
  cuota: number;
  capitalAmortizado: number;
  interesPuro: number;
  ivaIntereses: number;           // 21% del interesPuro
  saldoDeudor: number;
}

// Resultado de UN sistema de amortización
export interface ResultadoCalculo {
  sistema: SistemaAmortizacion;
  cuotaInicial: number;           // Primera cuota (para simple e italiano puede variar)
  cuotaFinal: number;
  totalIntereses: number;
  totalIva: number;
  totalPagado: number;            // Capital + intereses + IVA
  tea: number;                    // TEA del CFT
  tabla: FilaAmortizacion[];
}

// Output final del simulador (los 3 sistemas)
export interface ResultadoSimulacion {
  monto: number;
  plazo: number;
  tna: number;                    // TNA usada para el cálculo
  fuente: 'bcra' | 'manual';     // De dónde vino la TNA
  timestamp: string;              // ISO 8601
  resultados: Record<SistemaAmortizacion, ResultadoCalculo>;
  textoComparativo: string;       // Para que el vendedor explique al cliente
  disclaimer: string;
}

// Respuesta de la API BCRA v4.0 - endpoint de lista
export interface BCRAVariable {
  idVariable: number;
  descripcion: string;
  categoria: string;
  tipoSerie: string;
  periodicidad: string;
  unidadExpresion: string;
  moneda: string;
  primerFechaInformada: string;
  ultFechaInformada: string;
  ultValorInformado: number;
}

// Respuesta de la API BCRA v4.0 - detalle de variable
export interface BCRADetalle {
  fecha: string;     // 'YYYY-MM-DD'
  valor: number;
}

export interface BCRAVariableDetalle {
  idVariable: number;
  detalle: BCRADetalle[];
}

export interface BCRAResponse<T> {
  status: number;
  metadata: {
    resultset: {
      count: number;
      offset: number;
      limit: number;
    };
  };
  results: T[];
}

export interface BCRAErrorResponse {
  status: number;
  errorMessages: string[];
}

// Cache interno
export interface TNACache {
  valor: number;
  fuente: 'bcra' | 'manual';
  timestamp: number;  // Date.now()
  fechaBCRA: string;
}

// Props de componentes
export interface SliderMontoProps {
  valor: number;
  min: number;
  max: number;
  step: number;
  onChange: (valor: number) => void;
}

export interface SelectorPlazoProps {
  plazoSeleccionado: number;
  opciones: number[];
  onChange: (plazo: number) => void;
}

export interface SelectorSistemaProps {
  sistemaSeleccionado: SistemaAmortizacion;
  onChange: (sistema: SistemaAmortizacion) => void;
}

export interface ResumenResultadoProps {
  resultado: ResultadoCalculo;
  monto: number;
  tna: number;
  fuente: 'bcra' | 'manual';
}

export interface TablaAmortizacionProps {
  tabla: FilaAmortizacion[];
  moneda: string;
  locale: string;
}

export interface GraficoAmortizacionProps {
  tabla: FilaAmortizacion[];
  moneda: string;
}

export interface TextoComparativoProps {
  textoComparativo: string;
}

export interface DisclaimerLegalProps {
  disclaimer: string;
  timestamp: string;
}

// Adaptador de TNA — API pública del widget
export interface TNAAdapter {
  /** Identificador legible del adaptador */
  nombre: string;
  /** Función que retorna la TNA actual */
  obtener: () => Promise<{ valor: number; fuente: string; fechaReferencia?: string }>;
}

// Mensajes PostMessage para uso como iframe
export type IframeMessageType = 'SIMULACION_LISTA' | 'SIMULACION_ACTUALIZADA' | 'CONFIG_REQUERIDA';

export interface IframeMessage {
  type: IframeMessageType;
  origen: 'simulador-credito';
  payload: ResultadoSimulacion | null;
  timestamp: string;
}

// Params de URL para configuración iframe
export interface IframeURLParams {
  montoMin?: number;
  montoMax?: number;
  montoStep?: number;
  plazoOpciones?: number[];    // '12,24,36' → [12, 24, 36]
  tna?: number;
  sistema?: SistemaAmortizacion;
  tema?: 'light' | 'dark';
  moneda?: string;
  locale?: string;
  backendUrl?: string;         // Para usar backend-proxy adapter
}
