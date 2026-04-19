import { memo, useState, useCallback } from 'react';
import type { TablaAmortizacionProps } from '../types';
import { formatearMoneda } from '../utils/formatters';

export const TablaAmortizacion = memo(({ tabla, moneda, locale }: TablaAmortizacionProps) => {
  const colapsarPorDefecto = tabla.length > 24;
  const [expandida, setExpandida] = useState(!colapsarPorDefecto);

  const toggleExpandida = useCallback(() => {
    setExpandida((prev) => !prev);
  }, []);

  const fmt = useCallback(
    (valor: number) => formatearMoneda(valor, locale, moneda),
    [locale, moneda]
  );

  return (
    <div className="sc-tabla-wrapper">
      <div className="sc-tabla-header">
        <h3 className="sc-tabla-titulo">Tabla de amortización</h3>
        <button
          type="button"
          className="sc-btn-toggle"
          onClick={toggleExpandida}
          aria-expanded={expandida}
        >
          {expandida ? 'Ocultar tabla' : `Ver tabla (${tabla.length} cuotas)`}
        </button>
      </div>

      {expandida && (
        <div className="sc-tabla-scroll">
          <table className="sc-tabla-amortizacion">
            <thead className="sc-tabla-thead">
              <tr>
                <th className="sc-th sc-th--numero">Nro</th>
                <th className="sc-th">Cuota total</th>
                <th className="sc-th">Capital</th>
                <th className="sc-th">Interés</th>
                <th className="sc-th">IVA (21%)</th>
                <th className="sc-th">Saldo deudor</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila, idx) => (
                <tr
                  key={fila.periodo}
                  className={`sc-tr${idx % 2 === 0 ? ' sc-tr--par' : ' sc-tr--impar'}`}
                >
                  <td className="sc-td sc-td--numero">{fila.periodo}</td>
                  <td className="sc-td sc-td--monto">{fmt(fila.cuota)}</td>
                  <td className="sc-td sc-td--monto">{fmt(fila.capitalAmortizado)}</td>
                  <td className="sc-td sc-td--monto">{fmt(fila.interesPuro)}</td>
                  <td className="sc-td sc-td--monto">{fmt(fila.ivaIntereses)}</td>
                  <td className="sc-td sc-td--monto">{fmt(fila.saldoDeudor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

TablaAmortizacion.displayName = 'TablaAmortizacion';
