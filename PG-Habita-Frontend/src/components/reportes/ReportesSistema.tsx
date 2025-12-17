import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Mic, Sparkles, Square, TrendingUp } from 'lucide-react';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

type MetaCampo = { label: string; tipo: string };
type MetaReporte = { label: string; campos: Record<string, MetaCampo>; filtros?: Record<string, MetaCampo> };

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function ReportesSistema() {
  const { toast } = useToast();
  const [meta, setMeta] = useState<Record<string, MetaReporte> | null>(null);
  const [tipoReporte, setTipoReporte] = useState<string>('reservas');
  const [camposSeleccionados, setCamposSeleccionados] = useState<Record<string, boolean>>({});
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [statusReserva, setStatusReserva] = useState<string>('');
  const [pagoEstado, setPagoEstado] = useState<string>('');
  const [promptIA, setPromptIA] = useState<string>('');

  const [listening, setListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.obtenerReportesMeta();
        setMeta(res.meta);
      } catch (e: any) {
        toast({
          title: '❌ Error',
          description: e.response?.data?.message || 'No se pudo cargar la configuración de reportes',
          variant: 'destructive',
        });
      }
    };
    load();
  }, [toast]);

  const metaActual = useMemo(() => (meta ? meta[tipoReporte] : null), [meta, tipoReporte]);
  const listaCampos = useMemo(() => {
    if (!metaActual) return [] as Array<[string, MetaCampo]>;
    return Object.entries(metaActual.campos);
  }, [metaActual]);

  useEffect(() => {
    if (!metaActual) return;
    const initial: Record<string, boolean> = {};
    // Selección inicial: primeros 6 campos
    listaCampos.slice(0, 6).forEach(([key]) => (initial[key] = true));
    setCamposSeleccionados(initial);
    setReporte(null);
    setStatusReserva('');
    setPagoEstado('');
  }, [tipoReporte, metaActual, listaCampos]);

  const buildPayload = () => {
    const campos = Object.entries(camposSeleccionados)
      .filter(([, v]) => v)
      .map(([k]) => k);

    const filtros: any = {};
    const filtrosMeta = metaActual?.filtros || {};
    if (filtrosMeta.fecha_inicio && fechaInicio) filtros.fecha_inicio = fechaInicio;
    if (filtrosMeta.fecha_fin && fechaFin) filtros.fecha_fin = fechaFin;
    if (filtrosMeta.status && statusReserva) filtros.status = statusReserva;
    if (filtrosMeta.pago_estado && pagoEstado) filtros.pago_estado = pagoEstado;

    return {
      tipo_reporte: tipoReporte,
      campos_seleccionados: campos,
      filtros,
      limite: 200,
      incluir_estadisticas: true,
      incluir_graficos: true,
    };
  };

  const getSelectedCount = () => Object.values(camposSeleccionados).filter(Boolean).length;

  const generarReporte = async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await api.generarReporteDinamico(payload);
      setReporte(res.reporte);
      toast({
        title: '✅ Reporte generado',
        description: `Se generaron ${res.reporte?.rows?.length ?? 0} filas`,
      });
    } catch (e: any) {
      toast({
        title: '❌ Error',
        description: e.response?.data?.message || 'Error generando reporte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generación (sin botón): cuando cambian tipo/campos/filtros, genera con debounce.
  useEffect(() => {
    if (!metaActual) return;
    if (loading) return;
    if (getSelectedCount() === 0) return;

    const t = window.setTimeout(() => {
      generarReporte();
    }, 500);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tipoReporte,
    camposSeleccionados,
    fechaInicio,
    fechaFin,
    statusReserva,
    pagoEstado,
    metaActual,
  ]);

  const exportar = async (formato: 'pdf' | 'csv' | 'excel') => {
    try {
      const payload = buildPayload();
      const resp = await api.exportarReporteDinamico(payload, formato);
      const ext = formato === 'excel' ? 'xlsx' : formato;
      downloadBlob(resp.data, `reporte_${tipoReporte}.${ext}`);
      toast({ title: '✅ Exportación lista', description: `Descargado ${ext.toUpperCase()}` });
    } catch (e: any) {
      toast({
        title: '❌ Error',
        description: e.response?.data?.message || 'No se pudo exportar',
        variant: 'destructive',
      });
    }
  };

  const generarConIAConPrompt = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({ title: '⚠️ Falta prompt', description: 'Escribe qué reporte necesitas.' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.generarReportePorIA({ prompt });
      setReporte(res.reporte);
      // Si la IA eligió otro tipo/campos, reflejarlo en UI
      if (res.config?.tipo_reporte) setTipoReporte(res.config.tipo_reporte);
      if (Array.isArray(res.config?.campos_seleccionados)) {
        const next: Record<string, boolean> = {};
        res.config.campos_seleccionados.forEach((k: string) => (next[k] = true));
        setCamposSeleccionados(next);
      }
      toast({ title: '✅ Reporte generado con IA', description: 'Se aplicó la configuración sugerida.' });
    } catch (e: any) {
      const validationErrors = e.response?.data?.validation_errors;
      const firstError =
        validationErrors && typeof validationErrors === 'object'
          ? Object.entries(validationErrors)[0]
          : null;
      const extra = firstError ? ` (${String(firstError[0])}: ${String((firstError[1] as any)?.[0] ?? firstError[1])})` : '';
      toast({
        title: '❌ Error IA',
        description: (e.response?.data?.message || 'No se pudo generar con IA') + extra,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generarConIA = async () => generarConIAConPrompt(promptIA);

  const initSpeechRecognition = () => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recog = new SpeechRecognition();
    recog.lang = 'es-ES';
    recog.interimResults = true;
    recog.continuous = false;
    return recog;
  };

  const toggleVoice = async () => {
    try {
      if (listening) {
        recognitionRef.current?.stop?.();
        setListening(false);
        return;
      }

      const recog = initSpeechRecognition();
      if (!recog) {
        toast({
          title: '❌ No compatible',
          description: 'Tu navegador no soporta reconocimiento de voz (Web Speech API). Usa Chrome/Edge.',
          variant: 'destructive',
        });
        return;
      }

      let finalText = '';
      let lastCombined = '';
      recog.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const part = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) finalText += part;
          else interim += part;
        }
        const combined = (finalText + ' ' + interim).trim();
        lastCombined = combined;
        if (combined) setPromptIA(combined);
      };

      recog.onerror = (event: any) => {
        setListening(false);
        toast({
          title: '❌ Voz',
          description: `Error de micrófono/reconocimiento: ${event?.error || 'desconocido'}`,
          variant: 'destructive',
        });
      };

      recog.onend = () => {
        setListening(false);
        const text = lastCombined.trim();
        if (text) generarConIAConPrompt(text);
      };

      recognitionRef.current = recog;
      setListening(true);
      recog.start();
    } catch (e: any) {
      setListening(false);
      toast({
        title: '❌ Voz',
        description: e?.message || 'No se pudo iniciar el micrófono',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Reportes dinámicos</h1>
          <p className="text-muted-foreground">Elige atributos, aplica filtros y exporta (PDF/CSV/Excel).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportar('csv')} disabled={!reporte}>
            <Download className="w-4 h-4 mr-2" />CSV
          </Button>
          <Button variant="outline" onClick={() => exportar('excel')} disabled={!reporte}>
            <Download className="w-4 h-4 mr-2" />Excel
          </Button>
          <Button variant="outline" onClick={() => exportar('pdf')} disabled={!reporte}>
            <Download className="w-4 h-4 mr-2" />PDF
          </Button>
        </div>
      </div>

      {!meta && (
        <Alert>
          <AlertDescription>Cargando configuración de reportes...</AlertDescription>
        </Alert>
      )}

      {meta && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Selecciona tipo, filtros y/o genera con IA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de reporte</label>
                <select
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {Object.entries(meta).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {(metaActual?.filtros?.status || metaActual?.filtros?.pago_estado) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metaActual?.filtros?.status && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado reserva</label>
                    <input
                      value={statusReserva}
                      onChange={(e) => setStatusReserva(e.target.value)}
                      placeholder="confirmada / pendiente / cancelada..."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
                {metaActual?.filtros?.pago_estado && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado pago</label>
                    <input
                      value={pagoEstado}
                      onChange={(e) => setPagoEstado(e.target.value)}
                      placeholder="pagado / pendiente / reembolsado..."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="text-sm font-medium mb-2 block">Generar con IA (opcional)</label>
                <textarea
                  value={promptIA}
                  onChange={(e) => setPromptIA(e.target.value)}
                  placeholder="Ej: Quiero un reporte de ingresos por mes, del último semestre, con total y cantidad de reservas."
                  className="w-full p-2 border rounded-md min-h-[42px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={toggleVoice} disabled={loading} variant="outline">
                  {listening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button onClick={generarConIA} disabled={loading} variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />IA
                </Button>
              </div>
            </div>

            <Button onClick={generarReporte} disabled={loading}>
              <TrendingUp className="w-4 h-4 mr-2" />
              {loading ? 'Generando...' : 'Generar reporte'}
            </Button>
          </CardContent>
        </Card>
      )}

      {metaActual && (
        <Card>
          <CardHeader>
            <CardTitle>Atributos</CardTitle>
            <CardDescription>Marca qué columnas quieres ver en el reporte.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {listaCampos.map(([key, cfg]) => (
                <label key={key} className="flex items-center gap-2 p-2 border rounded-md">
                  <input
                    type="checkbox"
                    checked={!!camposSeleccionados[key]}
                    onChange={(e) =>
                      setCamposSeleccionados((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">{cfg.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {cfg.tipo}
                  </Badge>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reporte && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Estadísticas e insights (con lógica).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">{JSON.stringify(reporte.resumen || {})}</div>
              {(reporte.insights || []).length > 0 && (
                <div className="space-y-1">
                  {(reporte.insights || []).map((i: string, idx: number) => (
                    <div key={idx} className="text-sm">• {i}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos</CardTitle>
              <CardDescription>Vista previa (hasta 50 filas).</CardDescription>
            </CardHeader>
            <CardContent>
              {!Array.isArray(reporte.rows) || reporte.rows.length === 0 ? (
                <Alert>
                  <AlertDescription>No hay filas para mostrar con estos filtros.</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {(reporte.campos || Object.keys(reporte.rows[0] || {})).map((c: string) => (
                          <th key={c} className="text-left p-2 font-medium whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.rows.slice(0, 50).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          {(reporte.campos || Object.keys(row)).map((c: string) => (
                            <td key={c} className="p-2 whitespace-nowrap">
                              {String(row?.[c] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!reporte && meta && !loading && (
        <Alert>
          <AlertDescription>
            Selecciona atributos y filtros: el reporte se genera automáticamente. También puedes describirlo con IA (texto o voz).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}