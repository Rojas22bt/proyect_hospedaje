// src/components/bitacora/BitacoraSistema.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, User, Clock, Monitor, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface BitacoraItem {
  id: number;
  usuario: {
    id: number;
    username: string;
    nombre_completo: string;
  };
  accion: string;
  modulo: string;
  detalles: any;
  ip_address: string;
  user_agent: string;
  creado_en: string;
}

export default function BitacoraSistema() {
  const [bitacoras, setBitacoras] = useState<BitacoraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const { toast } = useToast();

  const cargarBitacora = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());

      const response = await api.obtenerBitacora(params.toString());
      setBitacoras(response.bitacoras);
      setTotalPaginas(response.total_paginas);
      setPagina(page);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || "Error cargando bitácora",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  const buscarBitacora = () => {
    cargarBitacora(1, busqueda);
  };

  const getModuloColor = (modulo: string) => {
    const colores: { [key: string]: string } = {
      'Propiedades': 'bg-blue-100 text-blue-800',
      'Reservas': 'bg-green-100 text-green-800',
      'Backup': 'bg-purple-100 text-purple-800',
      'Reportes': 'bg-orange-100 text-orange-800',
      'Usuarios': 'bg-red-100 text-red-800',
    };
    return colores[modulo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bitácora del Sistema</h1>
          <p className="text-muted-foreground">
            Registro de actividades de los usuarios
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar en Bitácora</CardTitle>
          <CardDescription>
            Encuentra actividades por usuario, acción o módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, acción, módulo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarBitacora()}
                className="pl-10"
              />
            </div>
            <Button onClick={buscarBitacora} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Bitácora */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Actividad</CardTitle>
          <CardDescription>
            {bitacoras.length} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bitacoras.length === 0 ? (
            <Alert>
              <AlertDescription>
                No se encontraron registros en la bitácora.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {bitacoras.map((bitacora) => (
                <div key={bitacora.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{bitacora.usuario.nombre_completo}</h4>
                        <p className="text-sm text-muted-foreground">@{bitacora.usuario.username}</p>
                      </div>
                    </div>
                    <Badge className={getModuloColor(bitacora.modulo)}>
                      {bitacora.modulo}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium">{bitacora.accion}</p>
                    {bitacora.detalles?.path && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Ruta: {bitacora.detalles.path} • Método: {bitacora.detalles.method}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Monitor className="w-4 h-4" />
                      <span>{bitacora.ip_address || 'IP no disponible'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(bitacora.creado_en).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagina === 1}
                onClick={() => cargarBitacora(pagina - 1, busqueda)}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                disabled={pagina === totalPaginas}
                onClick={() => cargarBitacora(pagina + 1, busqueda)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}