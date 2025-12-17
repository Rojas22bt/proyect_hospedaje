from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, F, ExpressionWrapper, fields
from django.utils import timezone
from apps.propiedades.models import Propiedades
from apps.reservas.models import Reservas
from apps.notificaciones.models import Notificacion
from datetime import date, timedelta

class DashboardEstadisticasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        total_propiedades = Propiedades.objects.filter(status=True).count() if user.is_staff or user.is_superuser else Propiedades.objects.filter(user=user, status=True).count()
        total_reservas = Reservas.objects.count() if user.is_staff or user.is_superuser else Reservas.objects.filter(user=user).count()
        reservas_activas = Reservas.objects.filter(status=True).count() if user.is_staff or user.is_superuser else Reservas.objects.filter(user=user, status=True).count()
        ocupacion_promedio = (reservas_activas / total_propiedades) * 100 if total_propiedades > 0 else 0
        ingresos_totales = Reservas.objects.filter(status=True).aggregate(total=Sum('monto_total'))['total'] or 0 if user.is_staff or user.is_superuser else Reservas.objects.filter(user=user, status=True).aggregate(total=Sum('monto_total'))['total'] or 0
        reservas_pendientes = Reservas.objects.filter(status=False).count() if user.is_staff or user.is_superuser else Reservas.objects.filter(user=user, status=False).count()
        notificaciones_no_leidas = Notificacion.objects.filter(usuario=user, leida=False).count()
        publicidades_activas = 0  # Placeholder si no tienes modelo Publicidad
        fecha_limite = timezone.now() - timedelta(days=7)
        notificaciones_recientes = Notificacion.objects.filter(creado_en__gte=fecha_limite).count() if user.is_staff or user.is_superuser else Notificacion.objects.filter(usuario=user, creado_en__gte=fecha_limite).count()
        reservas_recientes = Reservas.objects.filter(fecha_checkin__gte=fecha_limite).count() if user.is_staff or user.is_superuser else Reservas.objects.filter(user=user, fecha_checkin__gte=fecha_limite).count()
        dashboard_data = {
            'total_propiedades': total_propiedades,
            'total_reservas': total_reservas,
            'ocupacion_promedio': round(ocupacion_promedio, 2),
            'ingresos_totales': float(ingresos_totales),
            'reservas_pendientes': reservas_pendientes,
            'notificaciones_no_leidas': notificaciones_no_leidas,
            'publicidades_activas': publicidades_activas,
            'notificaciones_recientes': notificaciones_recientes,
            'reservas_recientes': reservas_recientes,
            'user_role': user.rol.nombre if hasattr(user, 'rol') and user.rol else 'CLIENT',
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
        return Response(dashboard_data)