---
name: desarrollo
description: >
  Desarrollo de funcionalidades del simulador de crédito.
  Trigger: Al agregar features, modificar cálculos, crear componentes nuevos,
  cambiar la API del widget o modificar la demo standalone.
metadata:
  version: "1.0"
---

# Skill: Desarrollo

## Flujo

```
PASO 0: Analizar el requerimiento
PASO 1: Planificar artefactos (mostrar al usuario, esperar OK)
PASO 2: Lógica y tipos (utils + types + tests)
PASO 3: UI (componentes + hooks + estilos)
PASO 4: Compilar y validar (TypeScript + lint + tests + build)
PASO 5: Resumen de lo creado
```

## PASO 0: Analizar

Leer el input. Si es ruta a `.md`, leerlo con Read.

Determinar:
- ¿Afecta cálculos financieros? (utils/)
- ¿Afecta presentación? (components/)
- ¿Afecta la API pública del widget? (index.ts, tipos)
- ¿Afecta la demo standalone? (demo/)
- ¿Requiere dependencias nuevas? (pedir aprobación)

## PASO 1: Planificar

Entrar en modo Plan. Listar:
- Archivos a crear/modificar (con su responsabilidad)
- Orden de ejecución
- Impacto en distribución dual (widget + demo)

**Esperar aprobación antes de escribir código.**

## PASO 2: Lógica y tipos

Delegar a `agente-simulator`. Pasar:
- Types/interfaces nuevos
- Funciones de utils/ a implementar
- Tests unitarios requeridos

## PASO 3: UI

Delegar a `agente-simulator`. Pasar:
- Componentes a crear/modificar
- Hooks necesarios
- Estilos (siempre prefijo `sc-`)
- Exports a agregar a `src/index.ts`

## PASO 4: Compilar

Delegar a `agente-compilacion`. Verificar:
- `pnpm typecheck` ✅
- `pnpm lint` ✅ (zero warnings)
- `pnpm test` ✅
- `pnpm build:widget` ✅ (genera IIFE + ESM)
- `pnpm build:demo` ✅

## PASO 5: Resumen

```markdown
## Resumen

### Archivos creados
- `src/utils/calculos.ts` — cálculo de cuota francesa (PMT)
- `src/components/SliderMonto.tsx` — control de monto con slider
- `src/hooks/useLoanCalculator.ts` — estado y cálculos del simulador

### API pública actualizada
- Export nuevo: `SimuladorCredito` (componente principal)
- Config: `montoMin`, `montoMax`, `plazoOpciones`, `tna`

### Builds verificados
- Widget IIFE: `dist/simulador.iife.js` ✅
- Widget ESM: `dist/simulador.es.js` ✅
- Demo: `demo/dist/` ✅
```
