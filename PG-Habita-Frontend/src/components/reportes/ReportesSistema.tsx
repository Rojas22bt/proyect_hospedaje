// src/components/reportes/ReportesSistema.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, DollarSign, Home, TrendingUp, Users, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { DatePicker } from '@/components/ui/date-picker';

interface ReporteData {
  total_reservas: number;
  total_ganancias: number;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  estadisticas: {
    reservas_por_estado: Array<{ estado: string; count: number; total: number }>;
    reservas_por_propiedad: Array<{ propiedad__nombre: string; count: number; total: number }>;
    top_propiedades: Array<any>;
  };
  graficos: any;
}

export default function ReportesSistema() {
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const { toast } = useToast();

  const generarReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);

      const response = await api.obtenerReportesReservas(params.toString());
      setReporte(response.reporte);

      toast({
        title: "✅ Reporte generado",
        description: `Se analizaron ${response.reporte.total_reservas} reservas`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || "Error generando reporte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    toast({
      title: "📊 Exportando PDF",
      description: "Funcionalidad de exportación en desarrollo",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Reservas</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tus propiedades y ganancias
          </p>
        </div>
        <Button onClick={exportarPDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros del Reporte</CardTitle>
          <CardDescription>
            Selecciona el rango de fechas para analizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button onClick={generarReporte} disabled={loading}>
              <TrendingUp className="w-4 h-4 mr-2" />
              {loading ? "Generando..." : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Principales */}
      {reporte && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                    <h3 className="text-2xl font-bold">{reporte.total_reservas}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ganancias Totales</p>
                    <h3 className="text-2xl font-bold">Bs. {reporte.total_ganancias.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Propiedades Activas</p>
                    <h3 className="text-2xl font-bold">{reporte.estadisticas.reservas_por_propiedad.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reservas por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Reservas por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reporte.estadisticas.reservas_por_estado.map((item) => (
                  <div key={item.estado} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        item.estado === 'confirmada' ? 'default' :
                        item.estado === 'pendiente' ? 'secondary' : 'destructive'
                      }>
                        {item.estado}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.count} reservas</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Bs. {item.total.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Propiedades */}
          <Card>
            <CardHeader>
              <CardTitle>Top Propiedades por Ganancias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reporte.estadisticas.top_propiedades.map((prop, index) => (
                  <div key={prop.propiedad__id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{prop.propiedad__nombre}</div>
                        <div className="text-sm text-muted-foreground">{prop.count} reservas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        Bs. {prop.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!reporte && !loading && (
        <Alert>
          <AlertDescription>
            Selecciona un rango de fechas y genera tu primer reporte para ver las estadísticas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}