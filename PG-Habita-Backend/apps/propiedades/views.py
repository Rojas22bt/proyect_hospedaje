from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .serializers import PropiedadesSerializer, DarBajaPropiedadSerializer
from .models import Propiedades
from django_filters.rest_framework import DjangoFilterBackend

# Importar nuestros servicios
from .services.maps_service import OpenStreetMapService
from .services.geo_service import GeoService


class PropiedadesPublicList(generics.ListAPIView):
    """
    Vista pública para landing page - muestra propiedades activas
    """
    serializer_class = PropiedadesSerializer
    permission_classes = [AllowAny]  # IMPORTANTE: Permitir acceso público

    def get_queryset(self):
        # Solo propiedades activas y disponibles
        return Propiedades.objects.filter(status=True, estado_baja='activa')


class PropiedadesList(generics.ListCreateAPIView):
    serializer_class = PropiedadesSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]  # Configuración de filtros agregada
    filterset_fields = ['tipo', 'ciudad', 'provincia', 'pais', 'precio_noche', 'max_huespedes', 'pets', 'es_destino_turistico']  # Campos filtrables

    def get_queryset(self):
        if self.request.user.is_superuser or self.request.user.is_staff:
            return Propiedades.objects.all()
        return Propiedades.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        print("🎯🎯🎯 DEBUG ACTIVADO - CREACIÓN DE PROPIEDAD 🎯🎯🎯")
        print("📦 DATOS RECIBIDOS DEL FRONTEND:")
        for key, value in request.data.items():
            print(f"   {key}: {value} (tipo: {type(value)})")

        print("👤 USUARIO:", request.user.username)
        print("🔐 AUTENTICADO:", request.user.is_authenticated)

        # Validar manualmente
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("❌❌❌ ERRORES DE VALIDACIÓN ❌❌❌")
            for field, errors in serializer.errors.items():
                print(f"   🚫 {field}: {errors}")
            print("❌❌❌ FIN ERRORES ❌❌❌")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        print("✅ DATOS VÁLIDOS - Procediendo con creación...")

        try:
            # Usar perform_create para que se ejecute el logging del serializer
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print("🎉 PROPIEDAD CREADA EXITOSAMENTE")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"💥 ERROR DURANTE CREACIÓN: {str(e)}")
            import traceback
            print(f"🔍 Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        propiedad = serializer.save(user=self.request.user)
        print(f"🔨 PROPIEDAD GUARDADA: {propiedad.nombre} (ID: {propiedad.id})")

        # 🔥 NUEVO: Intentar geocodificar automáticamente al crear
        try:
            from .services.geo_service import GeoService
            exito, resultado = GeoService.actualizar_geodatos_propiedad(propiedad)
            if exito:
                propiedad.save()
                print(f"✅ Propiedad geocodificada automáticamente: {propiedad.nombre}")
            else:
                print(f"⚠️ No se pudo geocodificar automáticamente: {resultado.get('error', 'Error desconocido')}")
        except Exception as e:
            print(f"⚠️ Error en geocodificación automática: {e}")


class PropiedadesCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropiedadesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser or self.request.user.is_staff:
            return Propiedades.objects.all()
        return Propiedades.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        propiedad = serializer.save()

        # 🔥 NUEVO: Si se actualiza la dirección, intentar geocodificar
        if 'direccion' in serializer.validated_data:
            try:
                from .services.geo_service import GeoService
                exito, resultado = GeoService.actualizar_geodatos_propiedad(propiedad)
                if exito:
                    propiedad.save()
                    print(f"✅ Dirección actualizada y geocodificada: {propiedad.nombre}")
            except Exception as e:
                print(f"⚠️ Error en geocodificación durante actualización: {e}")


# 🔥 NUEVAS VISTAS PARA GEOLOCALIZACIÓN
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def geocodificar_direccion(request):
    """
    Vista para geocodificar una dirección y obtener coordenadas
    """
    direccion = request.data.get('direccion', '').strip()

    if not direccion:
        return Response(
            {'error': 'La dirección es requerida'},
            status=status.HTTP_400_BAD_REQUEST
        )

    resultado = OpenStreetMapService.obtener_coordenadas(direccion)

    if resultado['exito']:
        return Response({
            'latitud': resultado['latitud'],
            'longitud': resultado['longitud'],
            'direccion_completa': resultado.get('direccion_completa', ''),
            'ciudad': resultado.get('ciudad', ''),
            'provincia': resultado.get('provincia', ''),
            'pais': resultado.get('pais', 'Argentina'),
            'exito': True
        })
    else:
        return Response(
            {'error': f"No se pudo geocodificar la dirección: {resultado['error']}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def actualizar_ubicacion_propiedad(request, pk):
    """
    Vista para actualizar la ubicación de una propiedad existente
    """
    try:
        if request.user.is_superuser or request.user.is_staff:
            propiedad = Propiedades.objects.get(pk=pk)
        else:
            propiedad = Propiedades.objects.get(pk=pk, user=request.user)
    except Propiedades.DoesNotExist:
        return Response(
            {'error': 'Propiedad no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    direccion_completa = request.data.get('direccion_completa', propiedad.direccion_completa)

    exito, resultado = GeoService.actualizar_geodatos_propiedad(propiedad, direccion_completa)

    if exito:
        propiedad.save()
        return Response(PropiedadesSerializer(propiedad).data)
    else:
        return Response(
            {'error': f"No se pudo geocodificar: {resultado['error']}"},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def obtener_ubicacion_propiedad(request, pk):
    """
    Vista para obtener la ubicación actual de una propiedad
    """
    try:
        if request.user.is_superuser or request.user.is_staff:
            propiedad = Propiedades.objects.get(pk=pk)
        else:
            propiedad = Propiedades.objects.get(pk=pk, user=request.user)
    except Propiedades.DoesNotExist:
        return Response(
            {'error': 'Propiedad no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'propiedad_id': propiedad.id,
        'nombre': propiedad.nombre,
        'direccion_completa': propiedad.direccion_completa,
        'latitud': propiedad.latitud,
        'longitud': propiedad.longitud,
        'ciudad': propiedad.ciudad,
        'provincia': propiedad.provincia,
        'pais': propiedad.pais,
        'tiene_ubicacion': propiedad.latitud is not None and propiedad.longitud is not None
    })


# 🔥 VISTAS EXISTENTES PARA BAJAS (MANTENIENDO TU CÓDIGO)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def dar_baja_propiedad(request, pk):
    """
    Vista para dar de baja una propiedad (temporal o indefinida)
    """
    try:
        # Verificar permisos
        if request.user.is_superuser or request.user.is_staff:
            propiedad = Propiedades.objects.get(pk=pk)
        else:
            propiedad = Propiedades.objects.get(pk=pk, user=request.user)
    except Propiedades.DoesNotExist:
        return Response(
            {'error': 'Propiedad no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = DarBajaPropiedadSerializer(data=request.data)
    if serializer.is_valid():
        tipo_baja = serializer.validated_data['tipo_baja']
        fecha_baja_fin = serializer.validated_data.get('fecha_baja_fin')
        motivo_baja = serializer.validated_data.get('motivo_baja', '')

        # Actualizar estado de baja
        propiedad.estado_baja = 'baja_temporal' if tipo_baja == 'temporal' else 'baja_indefinida'
        propiedad.fecha_baja_inicio = timezone.now().date()
        propiedad.fecha_baja_fin = fecha_baja_fin
        propiedad.motivo_baja = motivo_baja
        propiedad.save()

        return Response(
            PropiedadesSerializer(propiedad).data,
            status=status.HTTP_200_OK
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reactivar_propiedad(request, pk):
    """
    Vista para reactivar una propiedad que estaba de baja
    """
    try:
        # Verificar permisos
        if request.user.is_superuser or request.user.is_staff:
            propiedad = Propiedades.objects.get(pk=pk)
        else:
            propiedad = Propiedades.objects.get(pk=pk, user=request.user)
    except Propiedades.DoesNotExist:
        return Response(
            {'error': 'Propiedad no encontrada'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Reactivar la propiedad
    propiedad.estado_baja = 'activa'
    propiedad.fecha_baja_inicio = None
    propiedad.fecha_baja_fin = None
    propiedad.motivo_baja = ''
    propiedad.save()

    return Response(
        PropiedadesSerializer(propiedad).data,
        status=status.HTTP_200_OK
    )