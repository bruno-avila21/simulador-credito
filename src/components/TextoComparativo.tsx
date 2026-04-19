import { memo } from 'react';
import type { TextoComparativoProps } from '../types';

export const TextoComparativo = memo(({ textoComparativo }: TextoComparativoProps) => {
  const lineas = textoComparativo.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div className="sc-texto-comparativo">
      <div className="sc-texto-header">
        <span className="sc-texto-icono" aria-hidden="true">💡</span>
        <h3 className="sc-texto-titulo">Nota del asesor</h3>
      </div>
      <div className="sc-texto-contenido">
        {lineas.map((linea, idx) => (
          <p key={idx} className="sc-texto-parrafo">
            {linea}
          </p>
        ))}
      </div>
    </div>
  );
});

TextoComparativo.displayName = 'TextoComparativo';
