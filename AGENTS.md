# AGENTS.md — Simulador de Crédito

## Rol
Sos un senior frontend engineer especializado en React + TypeScript y distribución de widgets embebibles.
Tu objetivo es implementar un simulador de crédito que funcione tanto embebido en sitios de terceros como app standalone.

## Stack
- React 19 + TypeScript 5 (strict mode)
- Vite 6 (library mode + app mode)
- Tailwind CSS v4
- React Hook Form + Zod (validación)
- Recharts (gráfico de amortización)
- Vitest + Testing Library (tests)
- pnpm (package manager)

## Arquitectura del Proyecto

### Estructura de carpetas
```
src/
  components/
    SimuladorCredito.tsx      -- Componente raíz exportable
    SliderMonto.tsx           -- Control de monto con slider
    SelectorPlazo.tsx         -- Selector de cuotas/plazo
    ResumenResultado.tsx      -- Muestra cuota, intereses, total
    TablaAmortizacion.tsx     -- Tabla de pagos
    GraficoAmortizacion.tsx   -- Gráfico visual (Recharts)
  hooks/
    useLoanCalculator.ts      -- Estado del simulador + cálculos
    useSimuladorConfig.ts     -- Maneja la config del widget
  utils/
    calculos.ts               -- Funciones puras de cálculo financiero
    formatters.ts             -- Formateo de moneda, %, fechas
  types/
    index.ts                  -- Todos los tipos del proyecto
  styles/
    widget.css                -- Estilos base scoped
  index.ts                    -- Entry point de la library
```

### Patrón de componente
```tsx
// src/components/SliderMonto.tsx
import { memo } from 'react';
import type { SliderMontoProps } from '../types';

export const SliderMonto = memo(({ valor, min, max, onChange }: SliderMontoProps) => {
  return (
    <div className="sc-slider-monto">
      <label className="sc-label">Monto del préstamo</label>
      <input
        type="range"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sc-range-input"
      />
      <span className="sc-valor">{formatearMoneda(valor)}</span>
    </div>
  );
});
```

### Patrón de hook
```typescript
// src/hooks/useLoanCalculator.ts
import { useState, useMemo } from 'react';
import { calcularCuotaMensual, generarTablaAmortizacion } from '../utils/calculos';
import type { SimuladorConfig, ResultadoCalculo } from '../types';

export function useLoanCalculator(config: SimuladorConfig) {
  const [monto, setMonto] = useState(config.montoMin);
  const [plazo, setPlazo] = useState(config.plazoOpciones[0]);

  const resultado = useMemo((): ResultadoCalculo => {
    const cuotaMensual = calcularCuotaMensual(monto, plazo, config.tna);
    const totalPagado = cuotaMensual * plazo;
    const totalIntereses = totalPagado - monto;
    const tabla = generarTablaAmortizacion(monto, plazo, config.tna);

    return { cuotaMensual, totalPagado, totalIntereses, tabla };
  }, [monto, plazo, config.tna]);

  return { monto, setMonto, plazo, setPlazo, resultado };
}
```

### Patrón de función utilitaria
```typescript
// src/utils/calculos.ts
/**
 * Calcula cuota mensual por sistema francés (PMT)
 * @param capital - Monto del préstamo en pesos
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual (ej: 0.45 = 45%)
 */
export function calcularCuotaMensual(capital: number, meses: number, tna: number): number {
  const tem = tna / 12; // Tasa efectiva mensual
  if (tem === 0) return capital / meses;
  return (capital * tem * Math.pow(1 + tem, meses)) / (Math.pow(1 + tem, meses) - 1);
}
```

## Tipos principales

```typescript
// src/types/index.ts
export interface SimuladorConfig {
  montoMin: number;
  montoMax: number;
  montoStep?: number;
  plazoOpciones: number[];
  tna: number;
  tema?: 'light' | 'dark';
  moneda?: string;
  locale?: string;
  onSimular?: (resultado: ResultadoCalculo) => void;
}

export interface ResultadoCalculo {
  cuotaMensual: number;
  totalPagado: number;
  totalIntereses: number;
  tea: number;
  tabla: FilaAmortizacion[];
}

export interface FilaAmortizacion {
  periodo: number;
  cuota: number;
  amortizacion: number;
  intereses: number;
  saldoRestante: number;
}
```

## Naming Conventions

| Qué | Patrón | Ejemplo |
|-----|--------|---------|
| Componentes | PascalCase | `SliderMonto.tsx` |
| Hooks | camelCase + `use` | `useLoanCalculator.ts` |
| Utils | camelCase | `calcularCuotaMensual` |
| Types | PascalCase | `SimuladorConfig` |
| Props interfaces | `{Componente}Props` | `SliderMontoProps` |
| CSS classes del widget | Prefijo `sc-` | `.sc-slider-monto` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PLAZO_MESES` |

## Reglas Críticas

1. **NUNCA** usar `any` — el simulador es un producto vendible, el código debe ser impecable
2. **SIEMPRE** `memo()` en componentes hoja — el widget puede estar en páginas lentas
3. **NUNCA** acceder a `window`, `document`, `localStorage` dentro de componentes — usar el entry point
4. **SIEMPRE** prefijo `sc-` en clases CSS — para no romper los estilos del sitio host
5. **NUNCA** deps externas pesadas (charts es opcional y lazy-loadeable)
6. **SIEMPRE** funciones puras en utils/ — fáciles de testear sin render
7. **NUNCA** lógica de negocio en JSX — solo presentación y event handlers

## Forbidden Patterns

```tsx
// MAL — lógica inline en JSX
const cuota = (monto * tna / 12 * Math.pow(1 + tna/12, plazo)) / (Math.pow(1 + tna/12, plazo) - 1);
return <span>{cuota}</span>;

// BIEN — hook con utils
const { resultado } = useLoanCalculator(config);
return <span>{formatearMoneda(resultado.cuotaMensual)}</span>;
```

```tsx
// MAL — window directo en componente
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// BIEN — solo en entry point o con SSR guard
if (typeof window !== 'undefined') { ... }
```

```css
/* MAL — clase genérica que rompe el host */
.container { width: 100%; }
.button { background: blue; }

/* BIEN — prefijo scoped */
.sc-simulador-container { width: 100%; }
.sc-btn-simular { background: var(--sc-color-primary, #3b82f6); }
```

## Entry Points

### Widget (embebible)
```typescript
// src/index.ts — ESM export
export { SimuladorCredito } from './components/SimuladorCredito';
export type { SimuladorConfig, ResultadoCalculo } from './types';
```

```typescript
// src/embed.ts — IIFE entry point
import { createRoot } from 'react-dom/client';
import { SimuladorCredito } from './components/SimuladorCredito';

window.SimuladorCredito = {
  init({ container, config }) {
    const el = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    if (!el) throw new Error(`SimuladorCredito: container "${container}" no encontrado`);
    createRoot(el).render(<SimuladorCredito config={config} />);
  }
};
```

## Testing

Framework: Vitest + @testing-library/react

```typescript
// src/utils/__tests__/calculos.test.ts
import { describe, it, expect } from 'vitest';
import { calcularCuotaMensual } from '../calculos';

describe('calcularCuotaMensual', () => {
  it('calcula correctamente con TNA 45%', () => {
    // $100.000 a 12 meses al 45% TNA
    const cuota = calcularCuotaMensual(100000, 12, 0.45);
    expect(cuota).toBeCloseTo(10066.19, 0);
  });
});
```

Reglas de testing:
1. SIEMPRE testear las funciones de `utils/` — son el core del producto
2. Tests de componentes solo para comportamiento crítico (no snapshots)
3. `pnpm test` debe pasar en CI

## Al Finalizar (checklist)

- [ ] `pnpm typecheck` sin errores
- [ ] `pnpm lint` con CERO warnings
- [ ] `pnpm test` todos pasan
- [ ] `pnpm build:widget` genera `dist/simulador.iife.js` y `dist/simulador.es.js`
- [ ] `pnpm build:demo` genera `demo/dist/` funcional
- [ ] Clases CSS con prefijo `sc-`
- [ ] Sin `any` en TypeScript
- [ ] Sin acceso directo a `window`/`document` en componentes
