import { memo, useCallback } from 'react';
import type { SelectorPlazoProps } from '../types';

export const SelectorPlazo = memo(({ plazoSeleccionado, opciones, onChange }: SelectorPlazoProps) => {
  const handleClick = useCallback(
    (plazo: number) => () => {
      onChange(plazo);
    },
    [onChange]
  );

  return (
    <div className="sc-selector-plazo">
      <label className="sc-label">Plazo</label>
      <div className="sc-plazo-opciones" role="group" aria-label="Seleccionar plazo">
        {opciones.map((plazo) => (
          <button
            key={plazo}
            type="button"
            className={`sc-btn-plazo${plazo === plazoSeleccionado ? ' sc-btn-plazo--activo' : ''}`}
            onClick={handleClick(plazo)}
            aria-pressed={plazo === plazoSeleccionado}
          >
            {plazo} meses
          </button>
        ))}
      </div>
    </div>
  );
});

SelectorPlazo.displayName = 'SelectorPlazo';
