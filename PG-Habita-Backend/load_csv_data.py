"""
Script de migración de datos desde archivos CSV a la base de datos.
Este script carga datos de ejemplo para todos los modelos del sistema Habita.

Uso:
    python manage.py shell < load_csv_data.py
    O mejor:
    python load_csv_data.py
"""
import os
import sys
import django
import csv
from datetime import datetime, date
from decimal import Decimal

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Habita_Backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from apps.permisos.models import Permisos
from apps.roles.models import Rol
from apps.suscripciones.models import Suscripciones
from apps.usuarios.models import CustomUser
from apps.planes.models import Plan
from apps.propiedades.models import Propiedades
from apps.servicios.models import Servicio
from apps.reservas.models import Reservas
from apps.favoritos.models import Favoritos
from apps.resenas.models import Resena
from apps.notificaciones.models import Notificacion
from apps.ads.models import Publicidad
from apps.facturas.models import Factura
from apps.puntos.models import Puntos
from apps.recompensas.models import Recompensa


CSV_DIR = 'csv_data'


def limpiar_base_datos():
    """Limpia todos los datos existentes (CUIDADO: Elimina todo!)"""
    print("\n🗑️  Limpiando base de datos...")
    
    # Orden importante: primero eliminar modelos dependientes
    models_to_clear = [
        Factura,
        Resena,
        Notificacion,
        Favoritos,
        Reservas,
        Propiedades,
        Plan,
        Puntos,
        Publicidad,
        Servicio,
        Recompensa,
        CustomUser,
        Rol,
        Permisos,
        Suscripciones,
    ]
    
    for model in models_to_clear:
        count = model.objects.count()
        model.objects.all().delete()
        print(f"   ✓ Eliminados {count} registros de {model.__name__}")


def cargar_permisos():
    """Carga los permisos desde CSV"""
    print("\n📋 Cargando Permisos...")
    csv_path = os.path.join(CSV_DIR, 'permisos.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            permiso, created = Permisos.objects.get_or_create(
                nombre=row['nombre'],
                defaults={'descripcion': row['descripcion']}
            )
            if created:
                print(f"   ✓ Creado permiso: {permiso.nombre}")


def cargar_roles():
    """Carga los roles y sus permisos desde CSV"""
    print("\n👥 Cargando Roles...")
    csv_path = os.path.join(CSV_DIR, 'roles.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            rol, created = Rol.objects.get_or_create(
                nombre=row['nombre'],
                defaults={'descripcion': row['descripcion']}
            )
            
            # Asignar permisos
            if row['permisos']:
                permisos_nombres = [p.strip() for p in row['permisos'].split(',')]
                permisos = Permisos.objects.filter(nombre__in=permisos_nombres)
                rol.permisos.set(permisos)
            
            if created:
                print(f"   ✓ Creado rol: {rol.nombre} con {rol.permisos.count()} permisos")


def cargar_suscripciones():
    """Carga las suscripciones desde CSV"""
    print("\n💳 Cargando Suscripciones...")
    csv_path = os.path.join(CSV_DIR, 'suscripciones.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            suscripcion, created = Suscripciones.objects.get_or_create(
                nombre=row['nombre'],
                defaults={
                    'descripcion': row['descripcion'],
                    'precio_mensual': Decimal(row['precio_mensual']),
                    'status': row['status'],
                    'duracion': row['duracion']
                }
            )
            if created:
                print(f"   ✓ Creada suscripción: {suscripcion.nombre}")


def cargar_usuarios():
    """Carga los usuarios desde CSV"""
    print("\n👤 Cargando Usuarios...")
    csv_path = os.path.join(CSV_DIR, 'usuarios.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Obtener rol y suscripción
            rol = Rol.objects.get(nombre=row['rol'])
            suscripcion = Suscripciones.objects.get(nombre=row['suscripcion']) if row['suscripcion'] else None
            
            # Crear usuario
            usuario, created = CustomUser.objects.get_or_create(
                correo=row['correo'],
                defaults={
                    'username': row['username'],
                    'N_Cel': row['N_Cel'],
                    'fecha_Nac': datetime.strptime(row['fecha_Nac'], '%Y-%m-%d').date() if row['fecha_Nac'] else None,
                    'password': make_password(row['password']),
                    'first_name': row['first_name'],
                    'last_name': row['last_name'],
                    'rol': rol,
                    'suscripcion': suscripcion,
                    'is_staff': row['is_staff'] == 'True',
                    'is_superuser': row['is_superuser'] == 'True',
                    'is_active': row['is_active'] == 'True'
                }
            )
            if created:
                print(f"   ✓ Creado usuario: {usuario.username} ({usuario.correo})")


def cargar_planes():
    """Carga los planes desde CSV"""
    print("\n📅 Cargando Planes...")
    csv_path = os.path.join(CSV_DIR, 'planes.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            suscripcion = Suscripciones.objects.get(nombre=row['suscripcion_nombre'])
            
            plan, created = Plan.objects.get_or_create(
                usuario=usuario,
                suscripcion=suscripcion,
                defaults={
                    'fecha_inicio': datetime.strptime(row['fecha_inicio'], '%Y-%m-%d').date(),
                    'duracion': row['duracion']
                }
            )
            if created:
                print(f"   ✓ Creado plan: {usuario.username} - {suscripcion.nombre}")


def cargar_propiedades():
    """Carga las propiedades desde CSV"""
    print("\n🏠 Cargando Propiedades...")
    csv_path = os.path.join(CSV_DIR, 'propiedades.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['user_correo'])
            
            # Parsear características JSON
            import json
            caracteristicas = json.loads(row['caracteristicas'])
            
            propiedad, created = Propiedades.objects.get_or_create(
                nombre=row['nombre'],
                user=usuario,
                defaults={
                    'descripcion': row['descripcion'],
                    'tipo': row['tipo'],
                    'caracteristicas': caracteristicas,
                    'status': row['status'] == 'True',
                    'precio_noche': float(row['precio_noche']),
                    'cant_bath': int(row['cant_bath']),
                    'cant_hab': int(row['cant_hab']),
                    'descuento': float(row['descuento']),
                    'max_huespedes': int(row['max_huespedes']),
                    'pets': row['pets'] == 'True',
                    'latitud': float(row['latitud']) if row['latitud'] else None,
                    'longitud': float(row['longitud']) if row['longitud'] else None,
                    'direccion_completa': row['direccion_completa'],
                    'ciudad': row['ciudad'],
                    'provincia': row['provincia'],
                    'pais': row['pais'],
                    'departamento': row['departamento'],
                    'es_destino_turistico': row['es_destino_turistico'] == 'True',
                    'estado_baja': row['estado_baja']
                }
            )
            if created:
                print(f"   ✓ Creada propiedad: {propiedad.nombre} ({propiedad.tipo})")


def cargar_servicios():
    """Carga los servicios desde CSV"""
    print("\n🛎️  Cargando Servicios...")
    csv_path = os.path.join(CSV_DIR, 'servicios.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            servicio, created = Servicio.objects.get_or_create(
                nombre=row['nombre'],
                defaults={
                    'descripcion': row['descripcion'],
                    'precio': Decimal(row['precio']),
                    'status': row['status'] == 'True',
                    'descuento': Decimal(row['descuento'])
                }
            )
            if created:
                print(f"   ✓ Creado servicio: {servicio.nombre}")


def cargar_reservas():
    """Carga las reservas desde CSV"""
    print("\n📅 Cargando Reservas...")
    csv_path = os.path.join(CSV_DIR, 'reservas.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            propiedad = Propiedades.objects.get(nombre=row['propiedad_nombre'])
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            
            reserva, created = Reservas.objects.get_or_create(
                propiedad=propiedad,
                user=usuario,
                fecha_checkin=datetime.strptime(row['fecha_checkin'], '%Y-%m-%d').date(),
                fecha_checkout=datetime.strptime(row['fecha_checkout'], '%Y-%m-%d').date(),
                defaults={
                    'cant_huesp': int(row['cant_huesp']),
                    'cant_noches': int(row['cant_noches']),
                    'monto_total': Decimal(row['monto_total']),
                    'descuento': Decimal(row['descuento']),
                    'status': row['status'],
                    'pago_estado': row['pago_estado'],
                    'comentario_huesp': row['comentario_huesp']
                }
            )
            
            # Asignar servicios si existen
            if created and row['servicios']:
                servicios_nombres = [s.strip() for s in row['servicios'].split(',')]
                servicios = Servicio.objects.filter(nombre__in=servicios_nombres)
                reserva.servicios.set(servicios)
                print(f"   ✓ Creada reserva: {usuario.username} en {propiedad.nombre}")


def cargar_favoritos():
    """Carga los favoritos desde CSV"""
    print("\n⭐ Cargando Favoritos...")
    csv_path = os.path.join(CSV_DIR, 'favoritos.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            propiedad = Propiedades.objects.get(nombre=row['propiedad_nombre'])
            
            favorito, created = Favoritos.objects.get_or_create(
                usuario=usuario,
                propiedad=propiedad
            )
            if created:
                print(f"   ✓ Creado favorito: {usuario.username} - {propiedad.nombre}")


def cargar_resenas():
    """Carga las reseñas desde CSV"""
    print("\n⭐ Cargando Reseñas...")
    csv_path = os.path.join(CSV_DIR, 'resenas.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            propiedad = Propiedades.objects.get(nombre=row['propiedad_nombre'])
            
            # Buscar una reserva completada del usuario en esa propiedad
            reserva = Reservas.objects.filter(
                user=usuario,
                propiedad=propiedad,
                status='completada'
            ).first()
            
            resena, created = Resena.objects.get_or_create(
                usuario=usuario,
                propiedad=propiedad,
                defaults={
                    'reserva': reserva,
                    'estrellas': int(row['estrellas']),
                    'comentario': row['comentario']
                }
            )
            if created:
                print(f"   ✓ Creada reseña: {usuario.username} - {propiedad.nombre} ({row['estrellas']} estrellas)")


def cargar_notificaciones():
    """Carga las notificaciones desde CSV"""
    print("\n🔔 Cargando Notificaciones...")
    csv_path = os.path.join(CSV_DIR, 'notificaciones.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            
            notificacion, created = Notificacion.objects.get_or_create(
                usuario=usuario,
                titulo=row['titulo'],
                mensaje=row['mensaje'],
                defaults={
                    'tipo': row['tipo'],
                    'leida': row['leida'] == 'True'
                }
            )
            if created:
                print(f"   ✓ Creada notificación: {usuario.username} - {row['titulo']}")


def cargar_publicidad():
    """Carga los anuncios publicitarios desde CSV"""
    print("\n📢 Cargando Publicidad...")
    csv_path = os.path.join(CSV_DIR, 'publicidad.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            creado_por = CustomUser.objects.get(correo=row['creado_por_correo'])
            
            publicidad, created = Publicidad.objects.get_or_create(
                titulo=row['titulo'],
                defaults={
                    'descripcion': row['descripcion'],
                    'tipo': row['tipo'],
                    'fecha_inicio': datetime.strptime(row['fecha_inicio'], '%Y-%m-%d'),
                    'fecha_fin': datetime.strptime(row['fecha_fin'], '%Y-%m-%d'),
                    'activa': row['activa'] == 'True',
                    'creado_por': creado_por
                }
            )
            if created:
                print(f"   ✓ Creada publicidad: {publicidad.titulo}")


def cargar_facturas():
    """Carga las facturas desde CSV"""
    print("\n🧾 Cargando Facturas...")
    csv_path = os.path.join(CSV_DIR, 'facturas.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Obtener reserva por ID
            reserva = Reservas.objects.filter(id=int(row['reserva_id'])).first()
            
            if reserva and not hasattr(reserva, 'factura'):
                factura, created = Factura.objects.get_or_create(
                    reserva=reserva,
                    defaults={
                        'nit_ci': row['nit_ci'],
                        'nombre': row['nombre'],
                        'total': Decimal(row['total']),
                        'enviada': row['enviada'] == 'True'
                    }
                )
                if created:
                    print(f"   ✓ Creada factura: #{factura.id} para reserva #{reserva.id}")


def cargar_puntos():
    """Carga los puntos de usuarios desde CSV"""
    print("\n🎯 Cargando Puntos...")
    csv_path = os.path.join(CSV_DIR, 'puntos.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            usuario = CustomUser.objects.get(correo=row['usuario_correo'])
            
            puntos, created = Puntos.objects.get_or_create(
                usuario=usuario,
                defaults={
                    'saldo': int(row['saldo']),
                    'total_acumulado': int(row['total_acumulado'])
                }
            )
            if created:
                print(f"   ✓ Creados puntos: {usuario.username} - {puntos.saldo} puntos")


def cargar_recompensas():
    """Carga las recompensas desde CSV"""
    print("\n🎁 Cargando Recompensas...")
    csv_path = os.path.join(CSV_DIR, 'recompensas.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            recompensa, created = Recompensa.objects.get_or_create(
                nombre=row['nombre'],
                defaults={
                    'descripcion': row['descripcion'],
                    'puntos_requeridos': int(row['puntos_requeridos']),
                    'activa': row['activa'] == 'True',
                    'stock': int(row['stock'])
                }
            )
            if created:
                print(f"   ✓ Creada recompensa: {recompensa.nombre} ({recompensa.puntos_requeridos} pts)")


def main():
    """Función principal que ejecuta toda la migración"""
    print("\n" + "="*60)
    print("🚀 INICIANDO MIGRACIÓN DE DATOS CSV A BASE DE DATOS")
    print("="*60)
    
    try:
        # En producción (Railway), auto-limpiar si la variable de entorno está configurada
        import os
        auto_clean = os.environ.get('AUTO_CLEAN_DB', 'false').lower() == 'true'
        
        if auto_clean:
            print("\n🔄 Auto-limpiando base de datos...")
            limpiar_base_datos()
        else:
            # Preguntar si desea limpiar la base de datos (solo en desarrollo)
            try:
                respuesta = input("\n⚠️  ¿Desea limpiar la base de datos antes de cargar? (s/n): ")
                if respuesta.lower() == 's':
                    limpiar_base_datos()
            except EOFError:
                # Si no hay terminal interactiva, omitir limpieza
                print("\n⚠️  No hay terminal interactiva, omitiendo limpieza...")
        
        # Cargar datos en orden de dependencias
        cargar_permisos()
        cargar_roles()
        cargar_suscripciones()
        cargar_usuarios()
        cargar_planes()
        cargar_propiedades()
        cargar_servicios()
        cargar_reservas()
        cargar_favoritos()
        cargar_resenas()
        cargar_notificaciones()
        cargar_publicidad()
        cargar_facturas()
        cargar_puntos()
        cargar_recompensas()
        
        print("\n" + "="*60)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("="*60)
        
        # Mostrar resumen
        print("\n📊 RESUMEN DE DATOS CARGADOS:")
        print(f"   • Permisos: {Permisos.objects.count()}")
        print(f"   • Roles: {Rol.objects.count()}")
        print(f"   • Suscripciones: {Suscripciones.objects.count()}")
        print(f"   • Usuarios: {CustomUser.objects.count()}")
        print(f"   • Planes: {Plan.objects.count()}")
        print(f"   • Propiedades: {Propiedades.objects.count()}")
        print(f"   • Servicios: {Servicio.objects.count()}")
        print(f"   • Reservas: {Reservas.objects.count()}")
        print(f"   • Favoritos: {Favoritos.objects.count()}")
        print(f"   • Reseñas: {Resena.objects.count()}")
        print(f"   • Notificaciones: {Notificacion.objects.count()}")
        print(f"   • Publicidad: {Publicidad.objects.count()}")
        print(f"   • Facturas: {Factura.objects.count()}")
        print(f"   • Puntos: {Puntos.objects.count()}")
        print(f"   • Recompensas: {Recompensa.objects.count()}")
        
    except Exception as e:
        print(f"\n❌ ERROR durante la migración: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
