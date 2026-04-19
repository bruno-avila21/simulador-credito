import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { GraficoAmortizacionProps } from '../types';
import { formatearMoneda } from '../utils/formatters';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="sc-tooltip">
      <p className="sc-tooltip-titulo">Cuota {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="sc-tooltip-item" style={{ color: entry.color }}>
          {entry.name}: {formatearMoneda(entry.value)}
        </p>
      ))}
      <p className="sc-tooltip-total">
        Total: {formatearMoneda(payload.reduce((acc, e) => acc + e.value, 0))}
      </p>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

export const GraficoAmortizacion = memo(({ tabla }: GraficoAmortizacionProps) => {
  const datos = tabla.map((fila) => ({
    periodo: fila.periodo,
    Capital: Math.round(fila.capitalAmortizado),
    Interés: Math.round(fila.interesPuro),
    IVA: Math.round(fila.ivaIntereses),
  }));

  return (
    <div className="sc-grafico-wrapper">
      <h3 className="sc-grafico-titulo">Composición de cuotas</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={datos}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--sc-color-border)" />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 11, fill: 'var(--sc-color-text-muted)' }}
            label={{
              value: 'Cuota',
              position: 'insideBottom',
              offset: -2,
              fontSize: 11,
              fill: 'var(--sc-color-text-muted)',
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--sc-color-text-muted)' }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar dataKey="Capital" stackId="a" fill="var(--sc-color-primary)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Interés" stackId="a" fill="var(--sc-color-secondary)" />
          <Bar dataKey="IVA" stackId="a" fill="var(--sc-color-danger)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

GraficoAmortizacion.displayName = 'GraficoAmortizacion';
