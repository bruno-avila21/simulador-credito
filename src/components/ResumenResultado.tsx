import { memo } from 'react';
import type { ResumenResultadoProps } from '../types';
import { formatearMoneda, formatearPorcentaje, nombreSistema } from '../utils/formatters';

export const ResumenResultado = memo(({ resultado, monto, tna, fuente }: ResumenResultadoProps) => {
  const esAleman = resultado.sistema === 'aleman';
  const cuotaVariable = esAleman && Math.abs(resultado.cuotaInicial - resultado.cuotaFinal) > 1;

  return (
    <div className="sc-resumen-resultado">
      <div className="sc-resumen-header">
        <h3 className="sc-resumen-titulo">Resumen — {nombreSistema(resultado.sistema)}</h3>
        <div className="sc-tna-badge">
          <span className="sc-tna-label">TNA</span>
          <span className="sc-tna-valor">{formatearPorcentaje(tna)}</span>
          <span className={`sc-fuente-badge sc-fuente-badge--${fuente}`}>
            {fuente === 'bcra' ? 'BCRA' : 'Manual'}
          </span>
        </div>
      </div>

      <div className="sc-resumen-grid">
        <div className="sc-metrica sc-metrica--destacada">
          <span className="sc-metrica-label">
            {cuotaVariable ? 'Primera cuota' : 'Cuota mensual'}
          </span>
          <span className="sc-metrica-valor sc-metrica-valor--grande">
            {formatearMoneda(resultado.cuotaInicial)}
          </span>
          {cuotaVariable && (
            <span className="sc-metrica-sub">
              Última: {formatearMoneda(resultado.cuotaFinal)}
            </span>
          )}
        </div>

        <div className="sc-metrica">
          <span className="sc-metrica-label">Capital</span>
          <span className="sc-metrica-valor">{formatearMoneda(monto)}</span>
        </div>

        <div className="sc-metrica">
          <span className="sc-metrica-label">Total intereses</span>
          <span className="sc-metrica-valor">{formatearMoneda(resultado.totalIntereses)}</span>
        </div>

        <div className="sc-metrica">
          <span className="sc-metrica-label">IVA sobre intereses</span>
          <span className="sc-metrica-valor">{formatearMoneda(resultado.totalIva)}</span>
        </div>

        <div className="sc-metrica sc-metrica--total">
          <span className="sc-metrica-label">Total a pagar</span>
          <span className="sc-metrica-valor sc-metrica-valor--total">
            {formatearMoneda(resultado.totalPagado)}
          </span>
        </div>

        <div className="sc-metrica">
          <span className="sc-metrica-label">TEA / CFT</span>
          <span className="sc-metrica-valor">{formatearPorcentaje(resultado.tea)}</span>
        </div>
      </div>
    </div>
  );
});

ResumenResultado.displayName = 'ResumenResultado';
