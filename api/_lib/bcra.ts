// Tipos de respuesta BCRA v4.0 (solo los necesarios server-side)
interface BCRADetalle {
  fecha: string;
  valor: number;
}

interface BCRAVariableDetalle {
  idVariable: number;
  detalle: BCRADetalle[];
}

interface BCRAResponse {
  status: number;
  results: BCRAVariableDetalle[];
}

export interface TNAResult {
  valor: number;           // Decimal normalizado (ej: 0.38)
  valorPorcentaje: number; // Como porcentaje (ej: 38.0)
  fechaBCRA: string;       // 'YYYY-MM-DD'
  fuente: 'bcra' | 'fallback';
  timestamp: string;       // ISO 8601
}

const BCRA_BASE_URL = 'https://api.bcra.gob.ar/estadisticas/v4.0';
const ID_VARIABLE_TNA = 7;
const TNA_FALLBACK_PORCENTAJE = 60;

// Cache en módulo (vive mientras la Function esté caliente)
let _cache: { data: TNAResult; timestamp: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas (más agresivo server-side)

function normalizarValor(valor: number): number {
  return valor > 1 ? valor / 100 : valor;
}

export async function fetchTNAFromBCRA(): Promise<TNAResult> {
  // Cache válido
  if (_cache !== null && Date.now() - _cache.timestamp < CACHE_TTL_MS) {
    return _cache.data;
  }

  try {
    const url = `${BCRA_BASE_URL}/monetarias/${ID_VARIABLE_TNA}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'Accept-Language': 'es-AR' },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) throw new Error(`BCRA HTTP ${response.status}`);

    const data = await response.json() as BCRAResponse;
    const detalle = data.results[0]?.detalle?.[0];

    if (!detalle) throw new Error('BCRA: sin datos en detalle');

    const result: TNAResult = {
      valor: normalizarValor(detalle.valor),
      valorPorcentaje: detalle.valor > 1 ? detalle.valor : detalle.valor * 100,
      fechaBCRA: detalle.fecha,
      fuente: 'bcra',
      timestamp: new Date().toISOString(),
    };

    _cache = { data: result, timestamp: Date.now() };
    return result;

  } catch {
    const fallback: TNAResult = {
      valor: normalizarValor(TNA_FALLBACK_PORCENTAJE),
      valorPorcentaje: TNA_FALLBACK_PORCENTAJE,
      fechaBCRA: new Date().toISOString().split('T')[0] ?? '',
      fuente: 'fallback',
      timestamp: new Date().toISOString(),
    };
    _cache = { data: fallback, timestamp: Date.now() };
    return fallback;
  }
}
