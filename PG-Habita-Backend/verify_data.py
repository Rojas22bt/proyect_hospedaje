"""
Script para verificar la integridad de los datos cargados en el sistema.
Ejecutar después de load_csv_data.py para asegurar que todo está correcto.

Uso:
    python verify_data.py
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Habita_Backend.settings')
django.setup()

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


def print_section(title):
    """Imprime un título de sección"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)


def verificar_conteos():
    """Verifica que los conteos sean correctos"""
    print_section("📊 VERIFICACIÓN DE CONTEOS")
    
    conteos = {
        'Permisos': Permisos.objects.count(),
        'Roles': Rol.objects.count(),
        'Suscripciones': Suscripciones.objects.count(),
        'Usuarios': CustomUser.objects.count(),
        'Planes': Plan.objects.count(),
        'Propiedades': Propiedades.objects.count(),
        'Servicios': Servicio.objects.count(),
        'Reservas': Reservas.objects.count(),
        'Favoritos': Favoritos.objects.count(),
        'Reseñas': Resena.objects.count(),
        'Notificaciones': Notificacion.objects.count(),
        'Publicidad': Publicidad.objects.count(),
        'Facturas': Factura.objects.count(),
        'Puntos': Puntos.objects.count(),
        'Recompensas': Recompensa.objects.count(),
    }
    
    for modelo, count in conteos.items():
        status = "✅" if count > 0 else "❌"
        print(f"{status} {modelo}: {count}")
    
    return all(count > 0 for count in conteos.values())


def verificar_relaciones():
    """Verifica que las relaciones entre modelos sean correctas"""
    print_section("🔗 VERIFICACIÓN DE RELACIONES")
    
    errores = []
    
    # Verificar roles tienen permisos
    roles_sin_permisos = Rol.objects.filter(permisos__isnull=True).count()
    if roles_sin_permisos > 0:
        errores.append(f"❌ {roles_sin_permisos} roles sin permisos")
    else:
        print("✅ Todos los roles tienen permisos asignados")
    
    # Verificar usuarios tienen roles
    usuarios_sin_rol = CustomUser.objects.filter(rol__isnull=True).count()
    if usuarios_sin_rol > 0:
        errores.append(f"❌ {usuarios_sin_rol} usuarios sin rol")
    else:
        print("✅ Todos los usuarios tienen rol asignado")
    
    # Verificar propiedades tienen usuario
    propiedades_sin_user = Propiedades.objects.filter(user__isnull=True).count()
    if propiedades_sin_user > 0:
        errores.append(f"❌ {propiedades_sin_user} propiedades sin usuario")
    else:
        print("✅ Todas las propiedades tienen usuario")
    
    # Verificar reservas tienen usuario y propiedad
    reservas_invalidas = Reservas.objects.filter(
        user__isnull=True
    ).count() + Reservas.objects.filter(
        propiedad__isnull=True
    ).count()
    if reservas_invalidas > 0:
        errores.append(f"❌ {reservas_invalidas} reservas inválidas")
    else:
        print("✅ Todas las reservas son válidas")
    
    # Verificar reseñas tienen usuario y propiedad
    resenas_invalidas = Resena.objects.filter(
        usuario__isnull=True
    ).count() + Resena.objects.filter(
        propiedad__isnull=True
    ).count()
    if resenas_invalidas > 0:
        errores.append(f"❌ {resenas_invalidas} reseñas inválidas")
    else:
        print("✅ Todas las reseñas son válidas")
    
    return len(errores) == 0, errores


def verificar_datos_coherentes():
    """Verifica que los datos sean coherentes"""
    print_section("🔍 VERIFICACIÓN DE COHERENCIA")
    
    errores = []
    
    # Verificar precios positivos
    propiedades_precio_negativo = Propiedades.objects.filter(precio_noche__lt=0).count()
    if propiedades_precio_negativo > 0:
        errores.append(f"❌ {propiedades_precio_negativo} propiedades con precio negativo")
    else:
        print("✅ Todos los precios de propiedades son positivos")
    
    # Verificar fechas de reservas coherentes
    reservas_fechas_invalidas = Reservas.objects.filter(
        fecha_checkout__lte=models.F('fecha_checkin')
    ).count()
    if reservas_fechas_invalidas > 0:
        errores.append(f"❌ {reservas_fechas_invalidas} reservas con fechas inválidas")
    else:
        print("✅ Todas las fechas de reservas son coherentes")
    
    # Verificar coordenadas válidas
    propiedades_coordenadas_invalidas = Propiedades.objects.filter(
        latitud__isnull=False,
        longitud__isnull=False
    ).exclude(
        latitud__range=(-90, 90),
        longitud__range=(-180, 180)
    ).count()
    if propiedades_coordenadas_invalidas > 0:
        errores.append(f"❌ {propiedades_coordenadas_invalidas} propiedades con coordenadas inválidas")
    else:
        print("✅ Todas las coordenadas son válidas")
    
    # Verificar stock de recompensas
    recompensas_stock_negativo = Recompensa.objects.filter(stock__lt=0).count()
    if recompensas_stock_negativo > 0:
        errores.append(f"❌ {recompensas_stock_negativo} recompensas con stock negativo")
    else:
        print("✅ Todo el stock de recompensas es positivo")
    
    # Verificar puntos positivos
    puntos_negativos = Puntos.objects.filter(saldo__lt=0).count()
    if puntos_negativos > 0:
        errores.append(f"❌ {puntos_negativos} usuarios con puntos negativos")
    else:
        print("✅ Todos los saldos de puntos son positivos")
    
    return len(errores) == 0, errores


def verificar_funcionalidades_clave():
    """Verifica que las funcionalidades clave funcionen"""
    print_section("⚙️  VERIFICACIÓN DE FUNCIONALIDADES")
    
    try:
        # Probar login
        admin = CustomUser.objects.filter(correo='admin@habita.com').first()
        if admin and admin.check_password('admin123'):
            print("✅ Login de administrador funciona")
        else:
            print("❌ Login de administrador NO funciona")
        
        # Verificar permisos de roles
        admin_role = Rol.objects.filter(nombre='Administrador').first()
        if admin_role and admin_role.permisos.count() > 0:
            print(f"✅ Rol Administrador tiene {admin_role.permisos.count()} permisos")
        else:
            print("❌ Rol Administrador sin permisos")
        
        # Verificar propiedades activas
        propiedades_activas = Propiedades.objects.filter(status=True).count()
        print(f"✅ {propiedades_activas} propiedades activas disponibles")
        
        # Verificar reservas con diferentes estados
        estados_reservas = Reservas.objects.values('status').distinct().count()
        print(f"✅ Reservas con {estados_reservas} estados diferentes")
        
        # Verificar notificaciones no leídas
        notif_no_leidas = Notificacion.objects.filter(leida=False).count()
        print(f"✅ {notif_no_leidas} notificaciones no leídas para probar")
        
        # Verificar publicidad activa
        pub_activas = Publicidad.objects.filter(activa=True).count()
        print(f"✅ {pub_activas} publicidades activas")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al verificar funcionalidades: {str(e)}")
        return False


def generar_reporte_usuarios():
    """Genera un reporte detallado de usuarios"""
    print_section("👥 REPORTE DE USUARIOS")
    
    for rol in Rol.objects.all():
        usuarios_rol = CustomUser.objects.filter(rol=rol).count()
        print(f"\n📋 {rol.nombre}: {usuarios_rol} usuarios")
        
        usuarios = CustomUser.objects.filter(rol=rol)[:3]  # Mostrar primeros 3
        for usuario in usuarios:
            suscripcion = usuario.suscripcion.nombre if usuario.suscripcion else "Sin suscripción"
            print(f"   • {usuario.username} ({usuario.correo}) - {suscripcion}")


def generar_reporte_propiedades():
    """Genera un reporte de propiedades por tipo y ciudad"""
    print_section("🏠 REPORTE DE PROPIEDADES")
    
    # Por tipo
    print("\n📊 Por Tipo:")
    for tipo_choice in Propiedades.TIPO:
        tipo_codigo, tipo_nombre = tipo_choice
        count = Propiedades.objects.filter(tipo=tipo_codigo).count()
        print(f"   • {tipo_nombre}: {count}")
    
    # Por ciudad
    print("\n📍 Por Ciudad:")
    ciudades = Propiedades.objects.values('ciudad').distinct()
    for ciudad in ciudades:
        if ciudad['ciudad']:
            count = Propiedades.objects.filter(ciudad=ciudad['ciudad']).count()
            print(f"   • {ciudad['ciudad']}: {count}")


def generar_reporte_reservas():
    """Genera un reporte de reservas por estado"""
    print_section("📅 REPORTE DE RESERVAS")
    
    print("\n📊 Por Estado:")
    for estado_choice in Reservas.ESTADOS_RESERVA:
        estado_codigo, estado_nombre = estado_choice
        count = Reservas.objects.filter(status=estado_codigo).count()
        print(f"   • {estado_nombre}: {count}")
    
    print("\n💰 Por Estado de Pago:")
    for pago_choice in Reservas.ESTADOS_PAGO:
        pago_codigo, pago_nombre = pago_choice
        count = Reservas.objects.filter(pago_estado=pago_codigo).count()
        print(f"   • {pago_nombre}: {count}")


def main():
    """Función principal"""
    print("\n" + "🔍"*30)
    print(" "*15 + "VERIFICACIÓN DE DATOS DEL SISTEMA")
    print("🔍"*30)
    
    # Ejecutar verificaciones
    conteos_ok = verificar_conteos()
    relaciones_ok, errores_relaciones = verificar_relaciones()
    coherencia_ok, errores_coherencia = verificar_datos_coherentes()
    funcionalidades_ok = verificar_funcionalidades_clave()
    
    # Generar reportes
    generar_reporte_usuarios()
    generar_reporte_propiedades()
    generar_reporte_reservas()
    
    # Resumen final
    print_section("📋 RESUMEN FINAL")
    
    if conteos_ok and relaciones_ok and coherencia_ok and funcionalidades_ok:
        print("\n✅ ¡TODOS LOS DATOS ESTÁN CORRECTOS!")
        print("✅ El sistema está listo para usar")
        print("\n🚀 Puedes iniciar el servidor con: python manage.py runserver")
    else:
        print("\n⚠️  SE ENCONTRARON PROBLEMAS:")
        if not conteos_ok:
            print("   ❌ Algunos modelos no tienen datos")
        if not relaciones_ok:
            for error in errores_relaciones:
                print(f"   {error}")
        if not coherencia_ok:
            for error in errores_coherencia:
                print(f"   {error}")
        if not funcionalidades_ok:
            print("   ❌ Algunas funcionalidades no funcionan correctamente")
        
        print("\n💡 Sugerencia: Ejecuta nuevamente load_csv_data.py con limpieza de BD")
    
    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    try:
        from django.db import models  # Importar aquí para poder usar F()
        main()
    except Exception as e:
        print(f"\n❌ ERROR FATAL: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
