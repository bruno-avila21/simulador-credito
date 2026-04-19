# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Repository Overview

Simulador de crédito distribuible como widget embebible (`<script>` tag) y como app standalone.
Puede integrarse en sitios de terceros o usarse como página independiente.

- **src/** — Componente React + lógica de cálculo (library mode)
- **demo/** — App Vite standalone para demostración y uso independiente

Builds de salida:
- `dist/simulador.iife.js` — Embebible vía `<script>` tag en cualquier página
- `dist/simulador.es.js` — ESM para importar como NPM package
- `demo/dist/` — App standalone hosteada de forma independiente

## Build & Development Commands

```bash
# Instalar dependencias
pnpm install

# Dev (demo standalone)
pnpm dev                    # Vite dev server en puerto 5173

# Build widget (embebible + ESM)
pnpm build:widget           # Genera dist/simulador.iife.js y dist/simulador.es.js

# Build demo standalone
pnpm build:demo             # Genera demo/dist/ listo para hostear

# Build todo
pnpm build                  # widget + demo

# Tests
pnpm test                   # vitest

# Lint
pnpm lint                   # eslint (zero warnings)

# Type check
pnpm typecheck              # tsc --noEmit
```

## Architecture

### src/ — Widget Library (Vite library mode)
- **components/** — Componentes React del simulador. No business logic en JSX.
- **hooks/** — Lógica de estado y cálculos. Toda la lógica del simulador vive acá.
- **utils/** — Funciones puras de cálculo financiero (cuotas, amortización, TNA→TEA).
- **types/** — TypeScript types e interfaces. No lógica, solo tipos.
- **styles/** — CSS base del widget. Scoped para no colisionar con el host.

### demo/ — Standalone App
- Entry point que monta el widget como app completa.
- Puede hostearse en Netlify/Vercel como producto independiente.

### Patrón de distribución dual
El mismo componente React se empaqueta de dos formas:
1. **IIFE** (`simulador.iife.js`): Auto-ejecutable, define `window.SimuladorCredito`.
2. **ESM** (`simulador.es.js`): Import moderno para integraciones.

## Naming Conventions
- Archivos: kebab-case (`loan-calculator.tsx`)
- Componentes: PascalCase (`LoanCalculator`)
- Hooks: prefijo `use` (`useLoanCalculator`)
- Utils: camelCase (`calcularCuotaMensual`)
- Types: PascalCase (`SimuladorConfig`, `ResultadoCalculo`)
- CSS classes: BEM o Tailwind utility classes

## Critical Rules
- **TypeScript strict** — no `any`, no `@ts-ignore`
- **No dependencias externas pesadas** — el widget debe ser liviano (<100KB gzipped)
- **No acceso directo a `window`/`document`** fuera del entry point — el widget debe ser SSR-safe
- **Lógica de cálculo en utils/** — nunca inline en componentes
- **Estilos scoped** — usar prefijo `.sc-` en clases CSS para no romper el host
- **Sin cookies ni localStorage** en el widget — es responsabilidad del host
- **Zero warnings en lint** antes de cualquier build

## Per-App Standards
- `AGENTS.md` — Patrones para el widget y la demo

## Configuración del widget (API pública)

```typescript
// Uso embebido
window.SimuladorCredito.init({
  container: '#mi-simulador',
  config: {
    montoMin: 10000,
    montoMax: 5000000,
    plazoOpciones: [6, 12, 18, 24, 36, 48],
    tna: 0.45,
    tema: 'light' | 'dark',
  }
});

// Uso como componente React
import { SimuladorCredito } from 'simulador-credito';
<SimuladorCredito config={...} onSimular={(resultado) => {}} />
```
