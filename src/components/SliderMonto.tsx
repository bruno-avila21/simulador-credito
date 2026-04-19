import { memo, useCallback, useState } from 'react';
import type { SliderMontoProps } from '../types';
import { formatearMoneda } from '../utils/formatters';

export const SliderMonto = memo(({ valor, min, max, step, onChange }: SliderMontoProps) => {
  const [inputValue, setInputValue] = useState<string>(String(valor));
  const [editando, setEditando] = useState(false);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nuevoValor = Number(e.target.value);
      onChange(nuevoValor);
      setInputValue(String(nuevoValor));
    },
    [onChange]
  );

  const handleInputFocus = useCallback(() => {
    setEditando(true);
    setInputValue(String(valor));
  }, [valor]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    setEditando(false);
    const parsed = Number(inputValue.replace(/[^0-9]/g, ''));
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setInputValue(String(clamped));
    } else {
      setInputValue(String(valor));
    }
  }, [inputValue, min, max, onChange, valor]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const porcentaje = ((valor - min) / (max - min)) * 100;

  return (
    <div className="sc-slider-monto">
      <div className="sc-slider-header">
        <label className="sc-label" htmlFor="sc-input-monto">
          Monto del préstamo
        </label>
        <div className="sc-slider-input-wrapper">
          {editando ? (
            <input
              id="sc-input-monto"
              type="text"
              className="sc-monto-input sc-monto-input--editing"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="sc-monto-display"
              onClick={handleInputFocus}
              aria-label="Editar monto"
            >
              {formatearMoneda(valor)}
            </button>
          )}
        </div>
      </div>
      <div className="sc-range-wrapper">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valor}
          onChange={handleSliderChange}
          className="sc-range-input"
          aria-label="Slider de monto"
          style={{ '--sc-range-pct': `${porcentaje}%` } as React.CSSProperties}
        />
      </div>
      <div className="sc-slider-limits">
        <span className="sc-limit-text">{formatearMoneda(min)}</span>
        <span className="sc-limit-text">{formatearMoneda(max)}</span>
      </div>
    </div>
  );
});

SliderMonto.displayName = 'SliderMonto';
