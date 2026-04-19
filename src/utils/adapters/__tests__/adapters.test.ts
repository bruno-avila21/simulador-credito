import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManualAdapter } from '../manual';
import { createBackendProxyAdapter } from '../backend-proxy';
import { bcraDirectAdapter, invalidarCacheBCRADirect } from '../bcra-direct';

// --- createManualAdapter ---

describe('createManualAdapter', () => {
  it('retorna valor normalizado cuando se pasa porcentaje (45)', async () => {
    const adapter = createManualAdapter(45);
    const resultado = await adapter.obtener();
    expect(resultado.valor).toBeCloseTo(0.45);
    expect(resultado.fuente).toBe('manual');
  });

  it('retorna valor sin cambios cuando se pasa decimal (0.45)', async () => {
    const adapter = createManualAdapter(0.45);
    const resultado = await adapter.obtener();
    expect(resultado.valor).toBeCloseTo(0.45);
    expect(resultado.fuente).toBe('manual');
  });

  it('nombre del adaptador es "manual"', () => {
    const adapter = createManualAdapter(0.38);
    expect(adapter.nombre).toBe('manual');
  });

  it('incluye fechaReferencia en formato YYYY-MM-DD', async () => {
    const adapter = createManualAdapter(0.60);
    const resultado = await adapter.obtener();
    expect(resultado.fechaReferencia).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('normaliza correctamente TNA 0% (valor 0)', async () => {
    const adapter = createManualAdapter(0);
    const resultado = await adapter.obtener();
    expect(resultado.valor).toBe(0);
  });
});

// --- createBackendProxyAdapter ---

describe('createBackendProxyAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('nombre del adaptador es "backend-proxy"', () => {
    const adapter = createBackendProxyAdapter('https://mi-app.vercel.app');
    expect(adapter.nombre).toBe('backend-proxy');
  });

  it('hace fetch al endpoint correcto y retorna el resultado', async () => {
    const mockData = {
      valor: 0.38,
      fuente: 'bcra',
      fechaBCRA: '2026-04-10',
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    const adapter = createBackendProxyAdapter('https://mi-app.vercel.app');
    const resultado = await adapter.obtener();

    expect(resultado.valor).toBe(0.38);
    expect(resultado.fuente).toBe('bcra');
    expect(resultado.fechaReferencia).toBe('2026-04-10');
    expect(fetch).toHaveBeenCalledWith(
      'https://mi-app.vercel.app/api/tna',
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    );
  });

  it('retorna fallback cuando el backend falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network error')));

    const adapter = createBackendProxyAdapter('https://mi-app.vercel.app');
    const resultado = await adapter.obtener();

    expect(resultado.fuente).toBe('manual');
    expect(resultado.valor).toBe(0.60); // TNA_FALLBACK
  });

  it('retorna fallback cuando el backend responde con error HTTP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
    }));

    const adapter = createBackendProxyAdapter();
    const resultado = await adapter.obtener();

    expect(resultado.fuente).toBe('manual');
  });

  it('usa URL relativa cuando no se pasa backendUrl', async () => {
    const mockData = { valor: 0.50, fuente: 'bcra', fechaBCRA: '2026-04-10' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    const adapter = createBackendProxyAdapter();
    await adapter.obtener();

    expect(fetch).toHaveBeenCalledWith('/api/tna', expect.anything());
  });
});

// --- bcraDirectAdapter ---

describe('bcraDirectAdapter', () => {
  beforeEach(() => {
    invalidarCacheBCRADirect();
    vi.restoreAllMocks();
  });

  it('nombre del adaptador es "bcra-direct"', () => {
    expect(bcraDirectAdapter.nombre).toBe('bcra-direct');
  });

  it('retorna fallback cuando el fetch falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network error')));

    const resultado = await bcraDirectAdapter.obtener();

    expect(resultado.fuente).toBe('manual');
    expect(resultado.valor).toBe(0.60); // TNA_FALLBACK
  });

  it('retorna datos BCRA cuando el fetch es exitoso', async () => {
    const mockBCRAResponse = {
      status: 200,
      results: [{
        idVariable: 7,
        detalle: [{ fecha: '2026-04-10', valor: 38.0 }],
      }],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockBCRAResponse,
    }));

    const resultado = await bcraDirectAdapter.obtener();

    expect(resultado.fuente).toBe('bcra');
    expect(resultado.valor).toBeCloseTo(0.38);
    expect(resultado.fechaReferencia).toBe('2026-04-10');
  });

  it('usa cache en llamadas sucesivas sin hacer fetch de nuevo', async () => {
    const mockBCRAResponse = {
      status: 200,
      results: [{
        idVariable: 7,
        detalle: [{ fecha: '2026-04-10', valor: 45.0 }],
      }],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBCRAResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    await bcraDirectAdapter.obtener();
    await bcraDirectAdapter.obtener();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
