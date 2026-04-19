import { memo } from 'react';
import type { DisclaimerLegalProps } from '../types';
import { formatearFecha } from '../utils/formatters';

export const DisclaimerLegal = memo(({ disclaimer, timestamp }: DisclaimerLegalProps) => {
  return (
    <div className="sc-disclaimer">
      <span className="sc-disclaimer-icono" aria-hidden="true">⚠️</span>
      <div className="sc-disclaimer-contenido">
        <p className="sc-disclaimer-texto">{disclaimer}</p>
        <p className="sc-disclaimer-fecha">
          Calculado el {formatearFecha(timestamp)}
        </p>
      </div>
    </div>
  );
});

DisclaimerLegal.displayName = 'DisclaimerLegal';
