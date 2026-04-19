import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchTNAFromBCRA } from './_lib/bcra';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const tna = await fetchTNAFromBCRA();
    res.status(200).json(tna);
  } catch {
    res.status(500).json({
      error: 'Error interno',
      valor: 0.60,
      valorPorcentaje: 60,
      fechaBCRA: new Date().toISOString().split('T')[0],
      fuente: 'fallback',
      timestamp: new Date().toISOString(),
    });
  }
}
