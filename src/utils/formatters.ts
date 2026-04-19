import type { SistemaAmortizacion } from '../types';

/**
 * Formatea moneda ARS: "$1.234.567,89"
 * @param valor - Valor numérico a formatear
 * @param locale - Locale para formateo (default: 'es-AR')
 * @param moneda - Código de moneda (default: 'ARS')
 * @returns String formateado como moneda
 */
export function formatearMoneda(valor: number, locale = 'es-AR', moneda = 'ARS'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formatea porcentaje: "45,00%"
 * @param valor - Valor como decimal (ej: 0.45 = 45%)
 * @param decimales - Cantidad de decimales (default: 2)
 * @returns String formateado como porcentaje
 */
export function formatearPorcentaje(valor: number, decimales = 2): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

/**
 * Formatea fecha ISO a formato local: "12/04/2026"
 * @param isoString - Fecha en formato ISO 8601
 * @returns String de fecha formateado
 */
export function formatearFecha(isoString: string): string {
  const fecha = new Date(isoString);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

/**
 * Nombre legible del sistema de amortización
 * @param sistema - Sistema de amortización
 * @returns Nombre en español
 */
export function nombreSistema(sistema: SistemaAmortizacion): string {
  const nombres: Record<SistemaAmortizacion, string> = {
    frances: 'Sistema Francés',
    aleman: 'Sistema Alemán',
    simple: 'Interés Simple',
  };
  return nombres[sistema];
}
