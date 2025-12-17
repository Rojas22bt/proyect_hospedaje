from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Reservas
from .serializers import ReservasSerializer, ReservaDetalleSerializer


class ReservaListCreate(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReservasSerializer

    def get_queryset(self):
        user = self.request.user

        # ✅ CORREGIDO: Cambiar 'role' por 'rol'
        if user.is_superuser or user.rol in ['ADMIN', 'SUPERUSER']:
            return Reservas.objects.all().order_by('-creado_en')

        # CLIENT ve solo sus reservas
        return Reservas.objects.filter(user=user).order_by('-creado_en')

    def perform_create(self, serializer):
        print(f"🎯 SOLICITUD DE CREACIÓN DE RESERVA RECIBIDA")
        print(f"👤 Usuario: {self.request.user.username}")
        print(f"📦 Datos recibidos: {serializer.validated_data}")
        serializer.save(user=self.request.user)


class ReservaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # ✅ USAR ReservaDetalleSerializer para mostrar detalles completos
        if self.request.method == 'GET':
            return ReservaDetalleSerializer
        return ReservasSerializer

    def get_queryset(self):
        user = self.request.user

        # ✅ CORREGIDO: Cambiar 'role' por 'rol'
        if user.is_superuser or user.rol in ['ADMIN', 'SUPERUSER']:
            return Reservas.objects.all()

        return Reservas.objects.filter(user=user)

    def perform_update(self, serializer):
        print(f"🔄 ACTUALIZANDO RESERVA #{self.get_object().id}")
        print(f"📦 Datos de actualización: {serializer.validated_data}")
        reserva = serializer.save()
        print(f"✅ RESERVA #{reserva.id} ACTUALIZADA - NOTIFICACIONES ENVIADAS SI HUBO CAMBIOS")


class ReservaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # 🔥 USAR ReservaDetalleSerializer para mostrar detalles completos
        if self.request.method == 'GET':
            return ReservaDetalleSerializer
        return ReservasSerializer

    def get_queryset(self):
        user = self.request.user

        # 🔥 CORREGIR: Cambiar 'role' por 'rol'
        if user.is_superuser or user.rol in ['ADMIN', 'SUPERUSER']:
            return Reservas.objects.all()

        return Reservas.objects.filter(user=user)

    def perform_update(self, serializer):
        print(f"🔄 ACTUALIZANDO RESERVA #{self.get_object().id}")
        print(f"📦 Datos de actualización: {serializer.validated_data}")

        # Esto activará automáticamente las notificaciones de cambio de estado
        reserva = serializer.save()

        print(f"✅ RESERVA #{reserva.id} ACTUALIZADA - NOTIFICACIONES ENVIADAS SI HUBO CAMBIOS")


class FechasOcupadasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, propiedad_id):
        try:
            # Obtener fechas ocupadas (excluyendo reservas canceladas/rechazadas)
            reservas_activas = Reservas.objects.filter(
                propiedad_id=propiedad_id
            ).exclude(
                status__in=['cancelada', 'rechazada']
            )

            fechas_ocupadas = []
            for reserva in reservas_activas:
                # Generar rango de fechas entre checkin y checkout
                current_date = reserva.fecha_checkin
                while current_date < reserva.fecha_checkout:
                    fechas_ocupadas.append(current_date.isoformat())
                    current_date += timezone.timedelta(days=1)

            return Response({
                'fechas_ocupadas': fechas_ocupadas,
                'propiedad_id': propiedad_id,
                'total_reservas': reservas_activas.count()
            })

        except Exception as e:
            print(f"❌ Error obteniendo fechas ocupadas: {e}")
            return Response({
                'fechas_ocupadas': [],
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)