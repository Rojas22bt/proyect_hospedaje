# apps/usuarios/signals/seed_data.py - VERSIÓN COMPLETA Y MEJORADA
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
from django.db import connection, transaction
import datetime
from decimal import Decimal

@receiver(post_migrate)
def seed_initial_data(sender, **kwargs):
    # Evita ejecución múltiple verificando el emisor
    if not hasattr(seed_initial_data, 'has_run'):
        seed_initial_data.has_run = True
    else:
        return

    try:
        with transaction.atomic():
            # Obtener los modelos
            CustomUser = apps.get_model('usuarios', 'CustomUser')
            Rol = apps.get_model('roles', 'Rol')
            Permisos = apps.get_model('permisos', 'Permisos')
            Suscripciones = apps.get_model('suscripciones', 'Suscripciones')

            # 🔥 NUEVO: Obtener modelos adicionales para datos iniciales
            try:
                Propiedades = apps.get_model('propiedades', 'Propiedades')
                Servicio = apps.get_model('servicios', 'Servicio')
                Publicidad = apps.get_model('publicidad', 'Publicidad')
            except LookupError:
                Propiedades = Servicio = Publicidad = None  # Si no existen, salta

            # Truncar tablas y reiniciar secuencias
            with connection.cursor() as cursor:
                cursor.execute("TRUNCATE TABLE usuarios_customuser RESTART IDENTITY CASCADE")
                cursor.execute("TRUNCATE TABLE roles_rol RESTART IDENTITY CASCADE")
                cursor.execute("TRUNCATE TABLE permisos_permisos RESTART IDENTITY CASCADE")
                cursor.execute("TRUNCATE TABLE suscripciones_suscripciones RESTART IDENTITY CASCADE")
                if Propiedades:
                    cursor.execute("TRUNCATE TABLE propiedades_propiedades RESTART IDENTITY CASCADE")
                if Servicio:
                    cursor.execute("TRUNCATE TABLE servicios_servicio RESTART IDENTITY CASCADE")
                if Publicidad:
                    cursor.execute("TRUNCATE TABLE publicidad_publicidad RESTART IDENTITY CASCADE")
                print("Tablas truncadas y secuencias reiniciadas.")

            # 🔥 ACTUALIZADO: Crear Permisos (agregados para módulos nuevos)
            permisos_nombres = [
                # Usuarios
                'ver_usuarios', 'cud_usuario',
                # Roles
                'ver_roles', 'cud_rol',
                # Permisos
                'ver_permisos', 'cud_permiso',
                # Suscripciones
                'ver_suscripciones', 'cud_suscripcion',
                # Servicios
                'ver_servicios', 'cud_servicio',
                # Propiedades
                'ver_propiedades', 'cud_propiedad',
                # Reservas
                'ver_reservas', 'cud_reserva',
                # Planes
                'ver_planes', 'cud_plan',
                # Notificaciones
                'ver_notificaciones', 'cud_notificacion',
                # 🔥 NUEVO: Publicidad
                'ver_publicidad', 'cud_publicidad',
                # 🔥 NUEVO: Reseñas
                'ver_resenas', 'cud_resena',
                # 🔥 NUEVO: Facturas
                'ver_facturas', 'cud_factura',
                # 🔥 NUEVO: Pagos
                'ver_pagos', 'cud_pago',
                # 🔥 NUEVO: Historiales
                'ver_historiales',
                # 🔥 NUEVO: Devoluciones
                'ver_devoluciones', 'cud_devolucion',
                # 🔥 NUEVO: Puntos/Recompensas
                'ver_puntos', 'cud_punto', 'ver_recompensas', 'cud_recompensa',
                # Backup
                'backup.crear', 'backup.ver', 'backup.descargar', 'backup.eliminar', 'backup.restaurar',
                # 🔥 NUEVO: Reportes
                'reportes.ver',
                # 🔥 NUEVO: Bitácora
                'bitacora.ver',
            ]

            permisos_objs = {}
            for nombre in permisos_nombres:
                permiso, created = Permisos.objects.get_or_create(nombre=nombre)
                permisos_objs[nombre] = permiso
                if created:
                    print(f"Permiso '{nombre}' creado.")

            # Crear Roles (igual que antes, pero con permisos nuevos asignados)
            rol_superuser, created = Rol.objects.get_or_create(
                nombre='SUPERUSER',
                defaults={'descripcion': 'Rol con acceso total al sistema.'}
            )
            if created:
                print("Rol 'SUPERUSER' creado.")
            rol_superuser.permisos.set(permisos_objs.values())

            rol_administrador, created = Rol.objects.get_or_create(
                nombre='ADMIN',
                defaults={'descripcion': 'Administrador del sistema con gestión completa.'}
            )
            if created:
                print("Rol 'ADMIN' creado.")
            rol_administrador.permisos.set([
                permisos_objs['ver_usuarios'], permisos_objs['cud_usuario'],
                permisos_objs['ver_propiedades'], permisos_objs['cud_propiedad'],
                permisos_objs['ver_reservas'], permisos_objs['cud_reserva'],
                permisos_objs['ver_servicios'], permisos_objs['cud_servicio'],
                permisos_objs['ver_suscripciones'], permisos_objs['cud_suscripcion'],
                permisos_objs['ver_planes'], permisos_objs['cud_plan'],
                permisos_objs['ver_notificaciones'], permisos_objs['cud_notificacion'],
                permisos_objs['ver_publicidad'], permisos_objs['cud_publicidad'],  # 🔥 NUEVO
                permisos_objs['ver_resenas'], permisos_objs['cud_resena'],  # 🔥 NUEVO
                permisos_objs['ver_facturas'], permisos_objs['cud_factura'],  # 🔥 NUEVO
                permisos_objs['ver_pagos'], permisos_objs['cud_pago'],  # 🔥 NUEVO
                permisos_objs['ver_historiales'],  # 🔥 NUEVO
                permisos_objs['ver_devoluciones'], permisos_objs['cud_devolucion'],  # 🔥 NUEVO
                permisos_objs['ver_puntos'], permisos_objs['cud_punto'], permisos_objs['ver_recompensas'], permisos_objs['cud_recompensa'],  # 🔥 NUEVO
                permisos_objs['backup.crear'], permisos_objs['backup.ver'], permisos_objs['backup.descargar'], permisos_objs['backup.eliminar'],
                permisos_objs['reportes.ver'],  # 🔥 NUEVO
                permisos_objs['bitacora.ver'],  # 🔥 NUEVO
            ])

            rol_cliente, created = Rol.objects.get_or_create(
                nombre='CLIENT',
                defaults={'descripcion': 'Usuario del sistema. Capacidades varían según suscripción.'}
            )
            if created:
                print("Rol 'CLIENT' creado.")
            rol_cliente.permisos.set([
                permisos_objs['ver_propiedades'], permisos_objs['cud_propiedad'],
                permisos_objs['ver_reservas'], permisos_objs['cud_reserva'],
                permisos_objs['ver_notificaciones'],
                permisos_objs['ver_resenas'], permisos_objs['cud_resena'],  # 🔥 NUEVO
                permisos_objs['ver_facturas'],  # 🔥 NUEVO
                permisos_objs['ver_pagos'], permisos_objs['cud_pago'],  # 🔥 NUEVO
                permisos_objs['ver_historiales'],  # 🔥 NUEVO
                permisos_objs['ver_devoluciones'], permisos_objs['cud_devolucion'],  # 🔥 NUEVO
                permisos_objs['ver_puntos'], permisos_objs['cud_punto'], permisos_objs['ver_recompensas'],  # 🔥 NUEVO
            ])

            # 🔥 ACTUALIZADO: Crear Suscripciones (con descuentos calculados)
            suscripciones_data = [
                {
                    'nombre': 'Básica',
                    'descripcion': 'Suscripción gratuita para realizar reservas.',
                    'precio_mensual': Decimal('0.00'),
                    'status': 'Activa',
                    'duracion': 'Mensual',  # 🔥 NUEVO: Campo duración
                },
                {
                    'nombre': 'Premium',
                    'descripcion': 'Suscripción para publicar hasta 5 propiedades.',
                    'precio_mensual': Decimal('9.99'),
                    'status': 'Activa',
                    'duracion': 'Mensual',
                },
                {
                    'nombre': 'Esmeralda',
                    'descripcion': 'Suscripción para publicar propiedades ilimitadas.',
                    'precio_mensual': Decimal('19.99'),
                    'status': 'Activa',
                    'duracion': 'Mensual',
                },
                # 🔥 NUEVO: Más suscripciones de ejemplo
                {
                    'nombre': 'Anual Básica',
                    'descripcion': 'Suscripción anual gratuita.',
                    'precio_mensual': Decimal('0.00'),
                    'status': 'Activa',
                    'duracion': 'Anual',
                },
                {
                    'nombre': 'Semestral Premium',
                    'descripcion': 'Suscripción semestral premium.',
                    'precio_mensual': Decimal('9.99'),
                    'status': 'Activa',
                    'duracion': 'Semestral',
                },
            ]

            for data in suscripciones_data:
                suscripcion, created = Suscripciones.objects.get_or_create(
                    nombre=data['nombre'],
                    defaults=data
                )
                if created:
                    print(f"Suscripción '{data['nombre']}' creada.")

            # 🔥 ACTUALIZADO: Crear Superusuarios (igual, pero con más variedad)
            super_users_data = [
                {'username': 'Cristian', 'N_Cel': '77314101', 'fecha_Nac': '2000-01-01', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'Fernanda', 'N_Cel': '77314102', 'fecha_Nac': '2001-02-02', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'Antonio', 'N_Cel': '77314103', 'fecha_Nac': '2002-03-03', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'Marcelo', 'N_Cel': '77314104', 'fecha_Nac': '2003-04-04', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'Carlos', 'N_Cel': '77314105', 'fecha_Nac': '2004-05-05', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'Victor', 'N_Cel': '77314106', 'fecha_Nac': '2005-06-06', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
                {'username': 'SuperAdmin', 'N_Cel': '77314107', 'fecha_Nac': '1990-01-01', 'rol': rol_superuser, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
            ]

            for user_data in super_users_data:
                correo = f"{user_data['username'].lower()}@admin.com"
                user, created = CustomUser.objects.get_or_create(
                    username=user_data['username'],
                    correo=correo,
                    defaults={
                        'is_staff': True,
                        'is_superuser': True,
                        'is_active': True,
                        'N_Cel': user_data['N_Cel'],
                        'fecha_Nac': datetime.date.fromisoformat(user_data['fecha_Nac']),
                        'rol': user_data['rol'],
                        'suscripcion': user_data['suscripcion'],
                    }
                )
                if created:
                    user.set_password('1004')
                    user.save()
                    print(f"Superusuario '{user_data['username']}' creado.")
                else:
                    print(f"Superusuario '{user_data['username']}' ya existe, omitiendo la creación.")

            # 🔥 NUEVO: Crear Usuarios de Prueba (Clientes)
            clientes_data = [
                {'username': 'Cliente1', 'N_Cel': '60000001', 'fecha_Nac': '1995-01-01', 'rol': rol_cliente, 'suscripcion': Suscripciones.objects.get(nombre='Básica')},
                {'username': 'Cliente2', 'N_Cel': '60000002', 'fecha_Nac': '1996-02-02', 'rol': rol_cliente, 'suscripcion': Suscripciones.objects.get(nombre='Premium')},
                {'username': 'Cliente3', 'N_Cel': '60000003', 'fecha_Nac': '1997-03-03', 'rol': rol_cliente, 'suscripcion': Suscripciones.objects.get(nombre='Esmeralda')},
            ]

            for user_data in clientes_data:
                correo = f"{user_data['username'].lower()}@cliente.com"
                user, created = CustomUser.objects.get_or_create(
                    username=user_data['username'],
                    correo=correo,
                    defaults={
                        'is_active': True,
                        'N_Cel': user_data['N_Cel'],
                        'fecha_Nac': datetime.date.fromisoformat(user_data['fecha_Nac']),
                        'rol': user_data['rol'],
                        'suscripcion': user_data['suscripcion'],
                    }
                )
                if created:
                    user.set_password('1234')
                    user.save()
                    print(f"Cliente '{user_data['username']}' creado.")
                else:
                    print(f"Cliente '{user_data['username']}' ya existe.")

            # 🔥 NUEVO: Datos Iniciales de Ejemplo (si los modelos existen)
            if Servicio:
                servicios_data = [
                    {'nombre': 'Limpieza', 'descripcion': 'Servicio de limpieza profesional', 'precio': Decimal('50.00'), 'status': True},
                    {'nombre': 'Desayuno', 'descripcion': 'Desayuno incluido', 'precio': Decimal('20.00'), 'status': True},
                    {'nombre': 'Traslado', 'descripcion': 'Traslado al aeropuerto', 'precio': Decimal('100.00'), 'status': True},
                ]
                for data in servicios_data:
                    Servicio.objects.get_or_create(**data)
                    print(f"Servicio '{data['nombre']}' creado.")

            if Publicidad:
                publicidad_data = [
                    {'titulo': '¡Oferta Especial!', 'descripcion': 'Descuento del 20% en reservas', 'tipo': 'promocion', 'fecha_inicio': datetime.datetime.now(), 'fecha_fin': datetime.datetime.now() + datetime.timedelta(days=30), 'activa': True, 'creado_por': CustomUser.objects.get(username='SuperAdmin')},
                ]
                for data in publicidad_data:
                    Publicidad.objects.get_or_create(**data)
                    print(f"Publicidad '{data['titulo']}' creada.")

            print("\n✅ ¡Seeding completado con éxito!")
            print(f"📋 Permisos creados: {len(permisos_objs)}")
            print("👥 Roles creados: SUPERUSER, ADMIN, CLIENT")  # 🔥 CORREGIDO: Paréntesis cerrado
            print(f"💳 Suscripciones creadas: {len(suscripciones_data)}")
            print(f"👤 Usuarios creados: {len(super_users_data)} superusuarios + {len(clientes_data)} clientes")
            if Servicio:
                print(f"🛎️ Servicios creados: {len(servicios_data)}")
            if Publicidad:
                print(f"📢 Publicidades creadas: {len(publicidad_data)}")

    except Exception as e:
        print(f"\n❌ Error durante el seeder: {e}")
        import traceback
        traceback.print_exc()
