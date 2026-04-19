import { memo, useCallback } from 'react';
import type { SelectorSistemaProps, SistemaAmortizacion } from '../types';
import { nombreSistema } from '../utils/formatters';

const SISTEMAS: SistemaAmortizacion[] = ['frances', 'aleman', 'simple'];

export const SelectorSistema = memo(({ sistemaSeleccionado, onChange }: SelectorSistemaProps) => {
  const handleClick = useCallback(
    (sistema: SistemaAmortizacion) => () => {
      onChange(sistema);
    },
    [onChange]
  );

  return (
    <div className="sc-selector-sistema">
      <label className="sc-label">Sistema de amortización</label>
      <div className="sc-sistema-tabs" role="tablist" aria-label="Sistema de amortización">
        {SISTEMAS.map((sistema) => {
          const esSimple = sistema === 'simple';
          const esActivo = sistema === sistemaSeleccionado;
          return (
            <button
              key={sistema}
              type="button"
              role="tab"
              aria-selected={esActivo}
              className={[
                'sc-btn-sistema',
                esActivo ? 'sc-btn-sistema--activo' : '',
                esSimple ? 'sc-btn-sistema--advertencia' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={handleClick(sistema)}
            >
              {nombreSistema(sistema)}
              {esSimple && (
                <span className="sc-badge-caro" title="Este sistema genera más intereses totales">
                  Más caro
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

SelectorSistema.displayName = 'SelectorSistema';
