// src/components/admin/BackupSystem.tsx - VERSIÓN COMPLETA ACTUALIZADA
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, Database, RefreshCw, Shield, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

interface Backup {
  name: string;
  size: string;
  created: string;
  timestamp: string;
  records: number;
}

interface DatabaseStats {
  usuarios: number;
  propiedades: number;
  reservas: number;
  favoritos: number;
  ultimo_backup: string;
}

export default function BackupSystem() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Cargar backups y estadísticas
  const loadData = async () => {
    try {
      const [backupsRes, statsRes] = await Promise.all([
        api.listarBackups(),
        api.backupStatus()
      ]);

      setBackups(backupsRes.backups || []);
      setStats(statsRes.database_stats || null);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de backup",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Crear backup
  const createBackup = async () => {
    setLoading(true);
    try {
      const result = await api.crearBackup();
      toast({
        title: "✅ Backup creado",
        description: result.message,
      });
      await loadData(); // Recargar lista
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || "Error creando backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Descargar backup
  const downloadBackup = async (filename: string) => {
    try {
      const response = await api.descargarBackup(filename);

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "📥 Descargando",
        description: `Backup ${filename} se está descargando`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Error descargando backup",
        variant: "destructive",
      });
    }
  };

  // Eliminar backup
  const deleteBackup = async (filename: string) => {
    if (!confirm(`¿Estás seguro de eliminar el backup ${filename}?`)) return;

    try {
      await api.eliminarBackup(filename);
      toast({
        title: "🗑️ Backup eliminado",
        description: `Backup ${filename} fue eliminado`,
      });
      await loadData(); // Recargar lista
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Error eliminando backup",
        variant: "destructive",
      });
    }
  };

  // 🔥 NUEVA FUNCIÓN: Restaurar/Analizar backup
  const restaurarBackup = async (filename: string) => {
    if (!confirm(`¿Estás seguro de que quieres ANALIZAR el backup ${filename} para restauración?\n\n⚠️ ADVERTENCIA: Esta operación es sensible. Contacta al administrador para restauración completa.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.restaurarBackup(filename);
      toast({
        title: "🔍 Análisis de Backup",
        description: result.message,
      });

      // Mostrar detalles del análisis en consola
      console.log('📊 Análisis de backup completado:', result);

      // Opcional: Mostrar modal con detalles del análisis
      if (result.stats) {
        const stats = result.stats;
        toast({
          title: "📋 Contenido del Backup",
          description: `Usuarios: ${stats.usuarios} | Propiedades: ${stats.propiedades} | Reservas: ${stats.reservas} | Favoritos: ${stats.favoritos} | Notificaciones: ${stats.notificaciones}`,
        });
      }

    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.response?.data?.message || "Error analizando backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Backup</h1>
          <p className="text-muted-foreground">
            Gestiona los backups de la base de datos
          </p>
        </div>
        <Button
          onClick={createBackup}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Database className="w-4 h-4 mr-2" />
          {loading ? "Creando Backup..." : "Crear Backup"}
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Estado de la Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.usuarios}</div>
                <div className="text-sm text-blue-800">Usuarios</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.propiedades}</div>
                <div className="text-sm text-green-800">Propiedades</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.reservas}</div>
                <div className="text-sm text-purple-800">Reservas</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.favoritos}</div>
                <div className="text-sm text-orange-800">Favoritos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-bold text-gray-600">
                  {stats.ultimo_backup === 'Ninguno' ? 'Sin backups' : 'Último backup'}
                </div>
                <div className="text-xs text-gray-800 truncate" title={stats.ultimo_backup}>
                  {stats.ultimo_backup === 'Ninguno' ? '—' : stats.ultimo_backup.split('_')[2]}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backups Disponibles</CardTitle>
          <CardDescription>
            {backups.length} backups encontrados • Ordenados por fecha (más reciente primero)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <Alert>
              <AlertDescription>
                No hay backups disponibles. Crea el primer backup para empezar.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{backup.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>📅 {backup.created}</span>
                          <span>💾 {backup.size}</span>
                          <span>📊 {backup.records} registros</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 🔥 NUEVO BOTÓN: Analizar/Restaurar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restaurarBackup(backup.name)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Analizar backup para restauración"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Analizar
                    </Button>

                    {/* Botón Descargar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.name)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>

                    {/* Botón Eliminar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información importante */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800">
          <strong>💡 Información importante:</strong> Los backups contienen toda la información
          de la base de datos. Mantén estos archivos seguros y no los compartas.
        </AlertDescription>
      </Alert>

      {/* 🔥 NUEVA SECCIÓN: Funcionalidades de Restauración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Restauración de Backups
          </CardTitle>
          <CardDescription>
            Funcionalidades avanzadas para gestión de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">✅ Análisis de Backup</h4>
              <p className="text-sm text-muted-foreground">
                Usa el botón "Analizar" para ver el contenido de un backup sin modificar la base de datos actual.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ver estadísticas del backup</li>
                <li>• Validar integridad de datos</li>
                <li>• Preparar restauración</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">🔒 Restauración Completa</h4>
              <p className="text-sm text-muted-foreground">
                Para restauraciones completas, contacta al administrador del sistema.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Requiere permisos de superusuario</li>
                <li>• Backup completo de la base de datos</li>
                <li>• Procedimiento supervisado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}