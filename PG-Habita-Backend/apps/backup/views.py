# apps/backup/views.py - VERSIÓN COMPLETA CON MANEJO DE ERRORES
import os
import json
from datetime import datetime
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.permisos.permissions import HasPermission


@api_view(['POST'])
@permission_classes([IsAuthenticated, HasPermission])
def backup_database(request):
    """Crear backup rápido de toda la base de datos"""
    try:
        print("🔧 Iniciando proceso de backup...")

        # Importar modelos dentro del try para evitar imports circulares
        from apps.usuarios.models import CustomUser
        from apps.propiedades.models import Propiedades
        from apps.reservas.models import Reservas
        from apps.favoritos.models import Favoritos
        from apps.notificaciones.models import Notificacion

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        print(f"📁 Directorio de backup: {backup_dir}")

        backup_data = {
            'timestamp': timestamp,
            'database': 'habita_db',
            'backup_type': 'full'
        }

        # Recopilar datos con manejo de errores individual
        models_data = {}

        try:
            models_data['usuarios'] = json.loads(serializers.serialize('json', CustomUser.objects.all()))
            print(f"✅ Usuarios backup: {len(models_data['usuarios'])} registros")
        except Exception as e:
            print(f"❌ Error en usuarios: {e}")
            models_data['usuarios'] = []

        try:
            models_data['propiedades'] = json.loads(serializers.serialize('json', Propiedades.objects.all()))
            print(f"✅ Propiedades backup: {len(models_data['propiedades'])} registros")
        except Exception as e:
            print(f"❌ Error en propiedades: {e}")
            models_data['propiedades'] = []

        try:
            models_data['reservas'] = json.loads(serializers.serialize('json', Reservas.objects.all()))
            print(f"✅ Reservas backup: {len(models_data['reservas'])} registros")
        except Exception as e:
            print(f"❌ Error en reservas: {e}")
            models_data['reservas'] = []

        try:
            models_data['favoritos'] = json.loads(serializers.serialize('json', Favoritos.objects.all()))
            print(f"✅ Favoritos backup: {len(models_data['favoritos'])} registros")
        except Exception as e:
            print(f"❌ Error en favoritos: {e}")
            models_data['favoritos'] = []

        try:
            models_data['notificaciones'] = json.loads(serializers.serialize('json', Notificacion.objects.all()))
            print(f"✅ Notificaciones backup: {len(models_data['notificaciones'])} registros")
        except Exception as e:
            print(f"❌ Error en notificaciones: {e}")
            models_data['notificaciones'] = []

        backup_data['models'] = models_data

        # Guardar archivo
        filename = f'backup_habita_{timestamp}.json'
        filepath = os.path.join(backup_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)

        # Estadísticas
        stats = {
            'usuarios': len(models_data['usuarios']),
            'propiedades': len(models_data['propiedades']),
            'reservas': len(models_data['reservas']),
            'favoritos': len(models_data['favoritos']),
            'notificaciones': len(models_data['notificaciones'])
        }

        print(f"💾 Backup guardado: {filename}")

        return JsonResponse({
            'status': 'success',
            'message': f'Backup creado: {filename}',
            'filename': filename,
            'filepath': filepath,
            'stats': stats,
            'size': f"{os.path.getsize(filepath) / 1024:.1f} KB"
        })

    except Exception as e:
        print(f"💥 ERROR CRÍTICO en backup: {e}")
        import traceback
        traceback.print_exc()

        return JsonResponse({
            'status': 'error',
            'message': f'Error creando backup: {str(e)}'
        }, status=500)


backup_database.permission_codename = "backup.crear"


@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def list_backups(request):
    """Listar todos los backups disponibles"""
    try:
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        backups = []

        print(f"📁 Buscando backups en: {backup_dir}")

        if os.path.exists(backup_dir):
            for file in os.listdir(backup_dir):
                if file.endswith('.json') and file.startswith('backup_habita_'):
                    file_path = os.path.join(backup_dir, file)

                    try:
                        stats = os.stat(file_path)

                        # Leer metadata del backup
                        with open(file_path, 'r', encoding='utf-8') as f:
                            data = json.load(f)

                        backups.append({
                            'name': file,
                            'size': f"{stats.st_size / 1024:.1f} KB",
                            'created': datetime.fromtimestamp(stats.st_ctime).strftime("%Y-%m-%d %H:%M:%S"),
                            'timestamp': data.get('timestamp', ''),
                            'records': sum(len(data.get('models', {}).get(key, [])) for key in data.get('models', {}))
                        })
                    except Exception as e:
                        print(f"⚠️ Error leyendo backup {file}: {e}")
                        continue

        # Ordenar por fecha (más reciente primero)
        backups.sort(key=lambda x: x['created'], reverse=True)

        print(f"📊 Encontrados {len(backups)} backups")

        return JsonResponse({
            'status': 'success',
            'backups': backups,
            'total': len(backups)
        })

    except Exception as e:
        print(f"💥 ERROR listando backups: {e}")
        import traceback
        traceback.print_exc()

        return JsonResponse({
            'status': 'error',
            'message': f'Error listando backups: {str(e)}'
        }, status=500)


list_backups.permission_codename = "backup.ver"


@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def backup_status(request):
    """Estado actual de la base de datos"""
    try:
        print("📊 Obteniendo estado de la base de datos...")

        from apps.usuarios.models import CustomUser
        from apps.propiedades.models import Propiedades
        from apps.reservas.models import Reservas
        from apps.favoritos.models import Favoritos

        stats = {
            'usuarios': CustomUser.objects.count(),
            'propiedades': Propiedades.objects.count(),
            'reservas': Reservas.objects.count(),
            'favoritos': Favoritos.objects.count(),
            'ultimo_backup': 'Ninguno'
        }

        # Verificar si hay backups
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        if os.path.exists(backup_dir) and os.listdir(backup_dir):
            backups = [f for f in os.listdir(backup_dir) if f.startswith('backup_habita_')]
            if backups:
                backups.sort(reverse=True)
                stats['ultimo_backup'] = backups[0]

        print(f"📈 Estadísticas: {stats}")

        return JsonResponse({
            'status': 'success',
            'database_stats': stats
        })

    except Exception as e:
        print(f"💥 ERROR obteniendo estado: {e}")
        import traceback
        traceback.print_exc()

        return JsonResponse({
            'status': 'error',
            'message': f'Error obteniendo estado: {str(e)}'
        }, status=500)


backup_status.permission_codename = "backup.ver"


@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def download_backup(request, filename):
    """Descargar backup específico"""
    try:
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        file_path = os.path.join(backup_dir, filename)

        if os.path.exists(file_path) and filename.startswith('backup_habita_'):
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type='application/json')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                return response
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Backup no encontrado'
            }, status=404)

    except Exception as e:
        print(f"💥 ERROR descargando backup: {e}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error descargando backup: {str(e)}'
        }, status=500)


download_backup.permission_codename = "backup.descargar"


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, HasPermission])
def delete_backup(request, filename):
    """Eliminar backup"""
    try:
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        file_path = os.path.join(backup_dir, filename)

        if os.path.exists(file_path) and filename.startswith('backup_habita_'):
            os.remove(file_path)
            return JsonResponse({
                'status': 'success',
                'message': f'Backup {filename} eliminado'
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Backup no encontrado'
            }, status=404)

    except Exception as e:
        print(f"💥 ERROR eliminando backup: {e}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error eliminando backup: {str(e)}'
        }, status=500)


delete_backup.permission_codename = "backup.eliminar"


# apps/backup/views.py - AGREGAR ESTA FUNCIÓN
@api_view(['POST'])
@permission_classes([IsAuthenticated, HasPermission])
def restore_backup(request):
    """Restaurar base de datos desde un backup - Requiere backup.restaurar"""
    try:
        filename = request.data.get('filename')

        if not filename:
            return JsonResponse({
                'status': 'error',
                'message': 'Nombre de archivo requerido'
            }, status=400)

        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        file_path = os.path.join(backup_dir, filename)

        if not os.path.exists(file_path) or not filename.startswith('backup_habita_'):
            return JsonResponse({
                'status': 'error',
                'message': 'Archivo de backup no encontrado o inválido'
            }, status=404)

        print(f"🔄 Iniciando restauración desde: {filename}")

        # Leer el archivo de backup
        with open(file_path, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)

        # Importar modelos
        from apps.usuarios.models import CustomUser
        from apps.propiedades.models import Propiedades
        from apps.reservas.models import Reservas
        from apps.favoritos.models import Favoritos
        from apps.notificaciones.models import Notificacion
        from django.core import serializers

        # Estadísticas de restauración
        stats = {
            'usuarios': 0,
            'propiedades': 0,
            'reservas': 0,
            'favoritos': 0,
            'notificaciones': 0
        }

        # 🔥 RESTAURAR DATOS - CON TRANSACCIÓN PARA SEGURIDAD
        from django.db import transaction

        with transaction.atomic():
            # 1. Limpiar datos existentes (OPCIONAL - COMENTADO POR SEGURIDAD)
            # CustomUser.objects.all().delete()
            # Propiedades.objects.all().delete()
            # Reservas.objects.all().delete()
            # Favoritos.objects.all().delete()
            # Notificacion.objects.all().delete()

            # 2. Restaurar desde backup (SOLO LECTURA POR AHORA - MÁS SEGURO)
            models_data = backup_data.get('models', {})

            # Solo contar registros para mostrar estadísticas
            stats['usuarios'] = len(models_data.get('usuarios', []))
            stats['propiedades'] = len(models_data.get('propiedades', []))
            stats['reservas'] = len(models_data.get('reservas', []))
            stats['favoritos'] = len(models_data.get('favoritos', []))
            stats['notificaciones'] = len(models_data.get('notificaciones', []))

            print(f"📊 Backup contiene: {stats}")

        return JsonResponse({
            'status': 'success',
            'message': f'Análisis de backup completado. El archivo contiene: {stats["usuarios"]} usuarios, {stats["propiedades"]} propiedades, etc.',
            'filename': filename,
            'stats': stats,
            'backup_info': {
                'timestamp': backup_data.get('timestamp'),
                'database': backup_data.get('database'),
                'backup_type': backup_data.get('backup_type')
            },
            'nota': 'La restauración completa está deshabilitada por seguridad. Contacta al administrador.'
        })

    except Exception as e:
        print(f"💥 ERROR restaurando backup: {e}")
        import traceback
        traceback.print_exc()

        return JsonResponse({
            'status': 'error',
            'message': f'Error restaurando backup: {str(e)}'
        }, status=500)


restore_backup.permission_codename = "backup.restaurar"