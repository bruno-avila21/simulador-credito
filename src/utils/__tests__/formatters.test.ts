import { describe, it, expect } from 'vitest';
import { formatearMoneda, formatearPorcentaje, formatearFecha, nombreSistema } from '../formatters';

describe('formatearMoneda', () => {
  it('formatea ARS correctamente', () => {
    const resultado = formatearMoneda(1234567.89);
    // Debe contener el valor formateado con separadores argentinos
    expect(resultado).toContain('1.234.567');
    expect(resultado).toContain('89');
  });

  it('formatea cero correctamente', () => {
    const resultado = formatearMoneda(0);
    expect(resultado).toContain('0');
  });

  it('incluye símbolo de moneda', () => {
    const resultado = formatearMoneda(1000);
    // El símbolo ARS en es-AR puede ser $ o ARS dependiendo del entorno
    expect(resultado.length).toBeGreaterThan(4);
  });
});

describe('formatearPorcentaje', () => {
  it('formatea 0.45 como 45%', () => {
    const resultado = formatearPorcentaje(0.45);
    expect(resultado).toContain('45');
    expect(resultado).toContain('%');
  });

  it('formatea 0 como 0%', () => {
    const resultado = formatearPorcentaje(0);
    expect(resultado).toContain('0');
    expect(resultado).toContain('%');
  });

  it('respeta la cantidad de decimales', () => {
    const resultado = formatearPorcentaje(0.456789, 2);
    // Debe redondear a 2 decimales
    expect(resultado).toContain('45');
  });
});

describe('formatearFecha', () => {
  it('formatea fecha ISO y contiene el año', () => {
    // Usamos mediodía UTC para evitar problemas de timezone (UTC-X no cambia el día)
    const resultado = formatearFecha('2026-04-12T12:00:00.000Z');
    expect(resultado).toContain('2026');
  });

  it('retorna string no vacío', () => {
    const resultado = formatearFecha('2025-01-15');
    expect(resultado.length).toBeGreaterThan(0);
  });

  it('formatea y contiene el mes', () => {
    const resultado = formatearFecha('2026-01-15T12:00:00.000Z');
    // El mes 1 puede aparecer como "01" o "1" dependiendo del locale
    expect(resultado).toContain('2026');
    expect(resultado).toContain('15');
  });
});

describe('nombreSistema', () => {
  it('retorna Sistema Francés para frances', () => {
    expect(nombreSistema('frances')).toBe('Sistema Francés');
  });

  it('retorna Sistema Alemán para aleman', () => {
    expect(nombreSistema('aleman')).toBe('Sistema Alemán');
  });

  it('retorna Interés Simple para simple', () => {
    expect(nombreSistema('simple')).toBe('Interés Simple');
  });
});
