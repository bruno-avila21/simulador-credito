import { describe, it, expect } from 'vitest';
import {
  normalizarTNA,
  tnaATEA,
  calcularCuotaMensualFrances,
  generarTablaFrances,
  generarTablaAleman,
  generarTablaSimple,
  IVA_TASA,
} from '../calculos';

describe('normalizarTNA', () => {
  it('convierte porcentaje a decimal cuando valor > 1', () => {
    expect(normalizarTNA(38.5)).toBeCloseTo(0.385, 5);
  });

  it('mantiene decimal cuando valor <= 1', () => {
    expect(normalizarTNA(0.45)).toBeCloseTo(0.45, 5);
  });

  it('convierte 100 a 1.0', () => {
    expect(normalizarTNA(100)).toBeCloseTo(1.0, 5);
  });

  it('convierte 60 a 0.60', () => {
    expect(normalizarTNA(60)).toBeCloseTo(0.60, 5);
  });
});

describe('tnaATEA', () => {
  it('calcula TEA correctamente para 45% TNA', () => {
    // TEM = 0.45/12 = 0.0375, TEA = (1.0375)^12 - 1 ≈ 0.5604
    const tea = tnaATEA(0.45);
    expect(tea).toBeCloseTo(0.5604, 2);
  });

  it('calcula TEA correctamente para 0% TNA', () => {
    expect(tnaATEA(0)).toBeCloseTo(0, 5);
  });

  it('TEA es mayor que TNA para tasa positiva', () => {
    const tna = 0.38;
    const tea = tnaATEA(tna);
    expect(tea).toBeGreaterThan(tna);
  });
});

describe('calcularCuotaMensualFrances', () => {
  it('calcula correctamente $100.000 a 12 meses al 45% TNA (fórmula bancaria argentina TEM=TNA/12)', () => {
    // TEM = 0.45/12 = 0.0375
    // PMT = 100000 * 0.0375 * (1.0375^12) / (1.0375^12 - 1) ≈ 10501.23
    const cuota = calcularCuotaMensualFrances(100000, 12, 0.45);
    expect(cuota).toBeCloseTo(10501, 0);
  });

  it('calcula correctamente con tasa 0%', () => {
    const cuota = calcularCuotaMensualFrances(120000, 12, 0);
    expect(cuota).toBeCloseTo(10000, 0);
  });

  it('cuota mayor que solo el capital dividido (hay interés)', () => {
    const cuota = calcularCuotaMensualFrances(100000, 12, 0.45);
    expect(cuota).toBeGreaterThan(100000 / 12);
  });
});

describe('generarTablaFrances', () => {
  const capital = 100000;
  const meses = 12;
  const tna = 0.45;

  it('genera exactamente n filas', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    expect(tabla.length).toBe(meses);
  });

  it('el saldo deudor final es aproximadamente 0', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    const ultimaFila = tabla[tabla.length - 1];
    expect(ultimaFila?.saldoDeudor).toBeCloseTo(0, 0);
  });

  it('los intereses son decrecientes (o iguales)', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    for (let i = 1; i < tabla.length - 1; i++) {
      expect(tabla[i]?.interesPuro ?? 0).toBeLessThanOrEqual(tabla[i - 1]?.interesPuro ?? 0);
    }
  });

  it('el capital amortizado es creciente', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    for (let i = 1; i < tabla.length - 1; i++) {
      expect(tabla[i]?.capitalAmortizado ?? 0).toBeGreaterThanOrEqual(tabla[i - 1]?.capitalAmortizado ?? 0);
    }
  });

  it('IVA es 21% del interés puro en cada fila', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    for (const fila of tabla) {
      expect(fila.ivaIntereses).toBeCloseTo(fila.interesPuro * IVA_TASA, 1);
    }
  });

  it('suma de capital amortizado es igual al capital original', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    const sumaCapital = tabla.reduce((acc, f) => acc + f.capitalAmortizado, 0);
    expect(sumaCapital).toBeCloseTo(capital, 0);
  });
});

describe('generarTablaAleman', () => {
  const capital = 100000;
  const meses = 12;
  const tna = 0.45;

  it('genera exactamente n filas', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    expect(tabla.length).toBe(meses);
  });

  it('el saldo deudor final es aproximadamente 0', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    const ultimaFila = tabla[tabla.length - 1];
    expect(ultimaFila?.saldoDeudor).toBeCloseTo(0, 0);
  });

  it('el capital amortizado es constante en todas las cuotas', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    const capitalEsperado = capital / meses;
    for (const fila of tabla) {
      expect(fila.capitalAmortizado).toBeCloseTo(capitalEsperado, 1);
    }
  });

  it('las cuotas son decrecientes', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    for (let i = 1; i < tabla.length; i++) {
      expect(tabla[i]?.cuota ?? 0).toBeLessThanOrEqual(tabla[i - 1]?.cuota ?? 0);
    }
  });

  it('IVA es 21% del interés puro en cada fila', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    for (const fila of tabla) {
      expect(fila.ivaIntereses).toBeCloseTo(fila.interesPuro * IVA_TASA, 1);
    }
  });

  it('suma de capital amortizado es igual al capital original', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    const sumaCapital = tabla.reduce((acc, f) => acc + f.capitalAmortizado, 0);
    expect(sumaCapital).toBeCloseTo(capital, 0);
  });
});

describe('generarTablaSimple', () => {
  const capital = 100000;
  const meses = 12;
  const tna = 0.45;

  it('genera exactamente n filas', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    expect(tabla.length).toBe(meses);
  });

  it('el saldo deudor final es aproximadamente 0', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    const ultimaFila = tabla[tabla.length - 1];
    expect(ultimaFila?.saldoDeudor).toBeCloseTo(0, 0);
  });

  it('todas las cuotas son iguales', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    const primeraCuota = tabla[0]?.cuota ?? 0;
    for (const fila of tabla) {
      expect(fila.cuota).toBeCloseTo(primeraCuota, 1);
    }
  });

  it('interés total = Capital * TNA * (n/12)', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    const interesEsperado = capital * tna * (meses / 12);
    const interesReal = tabla.reduce((acc, f) => acc + f.interesPuro, 0);
    expect(interesReal).toBeCloseTo(interesEsperado, 0);
  });

  it('IVA es 21% del interés puro en cada fila', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    for (const fila of tabla) {
      expect(fila.ivaIntereses).toBeCloseTo(fila.interesPuro * IVA_TASA, 1);
    }
  });

  it('suma de capital amortizado es igual al capital original', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    const sumaCapital = tabla.reduce((acc, f) => acc + f.capitalAmortizado, 0);
    expect(sumaCapital).toBeCloseTo(capital, 0);
  });
});

describe('Saldo final ≈ 0 en los 3 sistemas', () => {
  const capital = 500000;
  const meses = 24;
  const tna = 0.38;

  it('francés: saldo final ≈ 0', () => {
    const tabla = generarTablaFrances(capital, meses, tna);
    expect(tabla[tabla.length - 1]?.saldoDeudor).toBeCloseTo(0, 0);
  });

  it('alemán: saldo final ≈ 0', () => {
    const tabla = generarTablaAleman(capital, meses, tna);
    expect(tabla[tabla.length - 1]?.saldoDeudor).toBeCloseTo(0, 0);
  });

  it('simple: saldo final ≈ 0', () => {
    const tabla = generarTablaSimple(capital, meses, tna);
    expect(tabla[tabla.length - 1]?.saldoDeudor).toBeCloseTo(0, 0);
  });
});
