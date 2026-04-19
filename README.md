---
title: Simulador de Crédito
description: Widget React embebible para simulación de créditos — IIFE + ESM + demo standalone + Vercel Functions
---

# Simulador de Crédito

Widget React embebible para simulación de créditos en pesos argentinos. Se distribuye como IIFE
(`<script>` tag) o ESM (import), y también como app standalone. Incluye una Vercel Function
para obtener TNA desde el BCRA.

## Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI del widget |
| TypeScript | 5.x | Lenguaje |
| Vite | 6.x | Build tool (library mode) |
| Recharts | 2.x | Gráficos de amortización |
| Vitest + Testing Library | 2.x | Tests |
| @vercel/node | 4.x | Vercel Functions (api/) |
| pnpm | — | Package manager |
| Vercel | — | Deploy |

## Correr localmente

```bash
pnpm install
pnpm dev         # Demo standalone en http://localhost:5173
```

## Scripts

```bash
pnpm dev           # Vite dev server (demo)
pnpm build:widget  # dist/simulador.iife.js + dist/simulador.es.js
pnpm build:demo    # demo/dist/ — app standalone
pnpm build         # widget + demo
pnpm test          # Vitest
pnpm typecheck     # tsc --noEmit
pnpm lint          # ESLint (zero warnings)
```

## Builds de salida

| Archivo | Uso |
|---------|-----|
| `dist/simulador.iife.js` | Embebible vía `<script>` tag — define `window.SimuladorCredito` |
| `dist/simulador.es.js` | ESM para import como paquete |
| `demo/dist/` | App standalone hosteada en Vercel |

## Uso embebido

```html
<script src="simulador.iife.js"></script>
<script>
  window.SimuladorCredito.init({
    container: '#mi-simulador',
    config: {
      montoMin: 10000,
      montoMax: 5000000,
      plazoOpciones: [6, 12, 18, 24, 36, 48],
      tna: 0.45,
      tema: 'light',
    }
  });
</script>
```

## Estructura

```
src/
  components/     # Componentes React del widget (sin business logic)
  hooks/          # Lógica de estado y cálculos (useLoanCalculator, etc.)
  utils/          # Funciones puras: cuotas, amortización, TNA→TEA
  types/          # TypeScript interfaces (SimuladorConfig, ResultadoCalculo)
  styles/         # CSS scoped con prefijo .sc- (no colisiona con el host)
  embed.ts        # Entry point IIFE — define window.SimuladorCredito
  index.ts        # Entry point ESM
demo/
  vite.config.ts  # Config separada para la app standalone
api/
  tna.ts          # Vercel Function — obtiene TNA desde BCRA
  _lib/bcra.ts    # Lógica de fetch a la API del BCRA
```

## Deploy

Vercel — automático con push a `main`.
La demo standalone y las Vercel Functions se despliegan juntas.
