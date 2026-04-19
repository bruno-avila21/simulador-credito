import type { FilaAmortizacion, ResultadoCalculo, SistemaAmortizacion } from '../types';

// Constantes
export const IVA_TASA = 0.21;
export const TNA_FALLBACK = 0.60; // 60% TNA, fallback si BCRA falla
export const BCRA_ID_TNA_PRESTAMOS = 7; // Variable de política monetaria BCRA

/**
 * Normaliza TNA: detecta si viene como porcentaje (38.50) o decimal (0.385)
 * Si valor > 1, asume que está en porcentaje y divide por 100
 * @param valor - Valor de TNA a normalizar
 * @returns TNA como decimal (ej: 0.385)
 */
export function normalizarTNA(valor: number): number {
  if (valor > 1) {
    return valor / 100;
  }
  return valor;
}

/**
 * Convierte TNA a Tasa Efectiva Mensual (TEM)
 * Fórmula bancaria argentina estándar: TEM = TNA / 12
 * @param tna - Tasa nominal anual como decimal (ej: 0.45)
 * @returns TEM como decimal
 */
export function tnaATEM(tna: number): number {
  return tna / 12;
}

/**
 * Convierte TNA a Tasa Efectiva Anual (TEA)
 * TEA = (1 + TEM)^12 - 1
 * @param tna - Tasa nominal anual como decimal (ej: 0.45)
 * @returns TEA como decimal
 */
export function tnaATEA(tna: number): number {
  const tem = tnaATEM(tna);
  return Math.pow(1 + tem, 12) - 1;
}

/**
 * SISTEMA FRANCÉS: Calcula la cuota fija mensual (PMT)
 * Fórmula: C = P * TEM * (1 + TEM)^n / ((1 + TEM)^n - 1)
 * Incluye IVA 21% sobre intereses (el interés varía, la cuota neta es fija pero con IVA varía levemente)
 * Nota: esta función devuelve la cuota sin IVA (cuota financiera pura)
 * @param capital - Monto del préstamo
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual ya normalizada (ej: 0.45)
 * @returns Cuota mensual pura sin IVA
 */
export function calcularCuotaMensualFrances(capital: number, meses: number, tna: number): number {
  const tem = tnaATEM(tna);
  if (tem === 0) return capital / meses;
  return (capital * tem * Math.pow(1 + tem, meses)) / (Math.pow(1 + tem, meses) - 1);
}

/**
 * Genera tabla de amortización SISTEMA FRANCÉS
 * Cuotas constantes (sin IVA), interés sobre saldo deudor, IVA 21% sobre interés
 * @param capital - Monto del préstamo
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual ya normalizada (ej: 0.45)
 * @returns Array de filas de amortización
 */
export function generarTablaFrances(capital: number, meses: number, tna: number): FilaAmortizacion[] {
  const tem = tnaATEM(tna);
  const cuotaPura = calcularCuotaMensualFrances(capital, meses, tna);
  const tabla: FilaAmortizacion[] = [];
  let saldo = capital;

  for (let i = 1; i <= meses; i++) {
    const interesPuro = saldo * tem;
    const ivaIntereses = interesPuro * IVA_TASA;
    const capitalAmortizado = cuotaPura - interesPuro;
    const cuota = cuotaPura + ivaIntereses;
    saldo = saldo - capitalAmortizado;

    // Ajuste de redondeo en la última cuota
    if (i === meses) {
      const capitalFinal = saldo + capitalAmortizado;
      const interesFinal = capitalFinal * tem;
      const ivaFinal = interesFinal * IVA_TASA;
      tabla.push({
        periodo: i,
        cuota: capitalFinal + interesFinal + ivaFinal,
        capitalAmortizado: capitalFinal,
        interesPuro: interesFinal,
        ivaIntereses: ivaFinal,
        saldoDeudor: 0,
      });
    } else {
      tabla.push({
        periodo: i,
        cuota: Math.round(cuota * 100) / 100,
        capitalAmortizado: Math.round(capitalAmortizado * 100) / 100,
        interesPuro: Math.round(interesPuro * 100) / 100,
        ivaIntereses: Math.round(ivaIntereses * 100) / 100,
        saldoDeudor: Math.round(Math.max(0, saldo) * 100) / 100,
      });
    }
  }

  return tabla;
}

/**
 * SISTEMA ALEMÁN: Amortización constante, cuotas decrecientes
 * Capital amortizado = Capital / n (constante)
 * Interés = Saldo deudor * TEM
 * Cuota = Capital amortizado + Interés + IVA(Interés)
 * @param capital - Monto del préstamo
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual ya normalizada (ej: 0.45)
 * @returns Array de filas de amortización
 */
export function generarTablaAleman(capital: number, meses: number, tna: number): FilaAmortizacion[] {
  const tem = tnaATEM(tna);
  const capitalAmortizado = capital / meses;
  const tabla: FilaAmortizacion[] = [];
  let saldo = capital;

  for (let i = 1; i <= meses; i++) {
    const interesPuro = saldo * tem;
    const ivaIntereses = interesPuro * IVA_TASA;
    const cuota = capitalAmortizado + interesPuro + ivaIntereses;
    saldo = saldo - capitalAmortizado;

    tabla.push({
      periodo: i,
      cuota: Math.round(cuota * 100) / 100,
      capitalAmortizado: Math.round(capitalAmortizado * 100) / 100,
      interesPuro: Math.round(interesPuro * 100) / 100,
      ivaIntereses: Math.round(ivaIntereses * 100) / 100,
      saldoDeudor: Math.round(Math.max(0, saldo) * 100) / 100,
    });
  }

  return tabla;
}

/**
 * INTERÉS SIMPLE (Concesionaria):
 * Interés total = Capital * TNA * (Meses / 12)
 * Se distribuye en cuotas iguales: cada cuota = (Capital + Interés total + IVA total) / n
 * Capital por cuota = Capital / n
 * Interés por cuota = Interés total / n
 * IVA por cuota = 21% del interés por cuota
 * Saldo deudor decrece linealmente
 * @param capital - Monto del préstamo
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual ya normalizada (ej: 0.45)
 * @returns Array de filas de amortización
 */
export function generarTablaSimple(capital: number, meses: number, tna: number): FilaAmortizacion[] {
  const interesTotal = capital * tna * (meses / 12);
  const capitalPorCuota = capital / meses;
  const interesPorCuota = interesTotal / meses;
  const ivaPorCuota = interesPorCuota * IVA_TASA;
  const cuotaFija = capitalPorCuota + interesPorCuota + ivaPorCuota;
  const tabla: FilaAmortizacion[] = [];
  let saldo = capital;

  for (let i = 1; i <= meses; i++) {
    saldo = saldo - capitalPorCuota;

    tabla.push({
      periodo: i,
      cuota: Math.round(cuotaFija * 100) / 100,
      capitalAmortizado: Math.round(capitalPorCuota * 100) / 100,
      interesPuro: Math.round(interesPorCuota * 100) / 100,
      ivaIntereses: Math.round(ivaPorCuota * 100) / 100,
      saldoDeudor: Math.round(Math.max(0, saldo) * 100) / 100,
    });
  }

  return tabla;
}

/**
 * Calcula el CFT como TEA a partir de la tabla de amortización
 * Usa bisección para encontrar la TIR mensual tal que NPV = 0
 * NPV = -Capital + suma(Cuota_i / (1+r)^i) = 0
 * @param capital - Monto original del préstamo
 * @param tabla - Tabla de amortización generada
 * @returns TEA como decimal
 */
export function calcularCFTcomoTEA(capital: number, tabla: FilaAmortizacion[]): number {
  const cuotas = tabla.map((f) => f.cuota);

  // Función NPV para una tasa mensual r
  const npv = (r: number): number => {
    let valor = -capital;
    for (let i = 0; i < cuotas.length; i++) {
      valor += (cuotas[i] ?? 0) / Math.pow(1 + r, i + 1);
    }
    return valor;
  };

  // Bisección entre 0% y 100% mensual
  let low = 0;
  let high = 1;
  let mid = 0;

  for (let iter = 0; iter < 100; iter++) {
    mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < 0.001) break;
    if (npvMid > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Convertir TIM a TEA
  return Math.pow(1 + mid, 12) - 1;
}

/**
 * Genera el ResultadoCalculo completo para un sistema de amortización
 * @param sistema - Sistema de amortización a calcular
 * @param capital - Monto del préstamo
 * @param meses - Cantidad de cuotas
 * @param tna - Tasa nominal anual ya normalizada (ej: 0.45)
 * @returns ResultadoCalculo completo
 */
export function generarResultado(
  sistema: SistemaAmortizacion,
  capital: number,
  meses: number,
  tna: number
): ResultadoCalculo {
  let tabla: FilaAmortizacion[];

  switch (sistema) {
    case 'frances':
      tabla = generarTablaFrances(capital, meses, tna);
      break;
    case 'aleman':
      tabla = generarTablaAleman(capital, meses, tna);
      break;
    case 'simple':
      tabla = generarTablaSimple(capital, meses, tna);
      break;
  }

  const totalIntereses = tabla.reduce((acc, f) => acc + f.interesPuro, 0);
  const totalIva = tabla.reduce((acc, f) => acc + f.ivaIntereses, 0);
  const totalPagado = capital + totalIntereses + totalIva;
  const cuotaInicial = tabla[0]?.cuota ?? 0;
  const cuotaFinal = tabla[tabla.length - 1]?.cuota ?? 0;
  const tea = calcularCFTcomoTEA(capital, tabla);

  return {
    sistema,
    cuotaInicial,
    cuotaFinal,
    totalIntereses: Math.round(totalIntereses * 100) / 100,
    totalIva: Math.round(totalIva * 100) / 100,
    totalPagado: Math.round(totalPagado * 100) / 100,
    tea,
    tabla,
  };
}

/**
 * Genera el texto comparativo para el vendedor
 * Describe los 3 sistemas en lenguaje coloquial para facilitar la explicación al cliente
 * @param capital - Monto del préstamo
 * @param meses - Plazo en meses
 * @param frances - Resultado del sistema francés
 * @param aleman - Resultado del sistema alemán
 * @param simple - Resultado del sistema interés simple
 * @returns Texto comparativo en lenguaje natural
 */
export function generarTextoComparativo(
  capital: number,
  meses: number,
  frances: ResultadoCalculo,
  aleman: ResultadoCalculo,
  simple: ResultadoCalculo
): string {
  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const diferenciaAlemanFrances = simple.totalPagado - aleman.totalPagado;
  const diferenciaPct = ((diferenciaAlemanFrances / aleman.totalPagado) * 100).toFixed(1);

  return (
    `Para un préstamo de ${fmt(capital)} a ${meses} meses:\n\n` +
    `• Sistema Francés: cuota fija de ${fmt(frances.cuotaInicial)} todos los meses. ` +
    `Total a pagar: ${fmt(frances.totalPagado)}.\n\n` +
    `• Sistema Alemán: empezás pagando ${fmt(aleman.cuotaInicial)} y terminás en ${fmt(aleman.cuotaFinal)} ` +
    `(cuotas decrecientes). Total: ${fmt(aleman.totalPagado)}. ` +
    `Es el más conveniente en intereses totales.\n\n` +
    `• Interés Simple: cuota fija de ${fmt(simple.cuotaInicial)}. ` +
    `Total: ${fmt(simple.totalPagado)}. ` +
    `Es el más caro: pagás ${fmt(diferenciaAlemanFrances)} más que con el Sistema Alemán (${diferenciaPct}% extra).`
  );
}

export const DISCLAIMER_LEGAL =
  'Los valores son referenciales, calculados con la tasa del BCRA al día de la fecha y están sujetos a aprobación crediticia y cambios en la política monetaria.';
