import traceback

from django.db.models import Count, Sum, Q
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.templatetags.rest_framework import data

from apps.permisos.permissions import HasPermission
from apps.reservas.models import Reservas
from apps.propiedades.models import Propiedades
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def reportes_reservas(request):
    try:
        fecha_inicio = request.GET.get('fecha_inicio')
        fecha_fin = request.GET.get('fecha_fin')
        user = request.user
        propiedades_usuario = Propiedades.objects.filter(user=user)
        reservas = Reservas.objects.filter(propiedad__in=propiedades_usuario)
        if fecha_inicio:
            reservas = reservas.filter(fecha_checkin__gte=fecha_inicio)
        if fecha_fin:
            reservas = reservas.filter(fecha_checkout__lte=fecha_fin)
        total_reservas = reservas.count()
        total_ganancias = reservas.aggregate(total=Sum('monto_total'))['total'] or 0
        reservas_por_estado = reservas.values('status').annotate(count=Count('id'), total=Sum('monto_total'))
        reservas_por_propiedad = reservas.values('propiedad__nombre', 'propiedad__id').annotate(count=Count('id'), total=Sum('monto_total')).order_by('-total')
        seis_meses_atras = datetime.now() - timedelta(days=180)
        tendencia_mensual = reservas.filter(fecha_checkin__gte=seis_meses_atras).extra({
            'month': "EXTRACT(month FROM fecha_checkin)",
            'year': "EXTRACT(year FROM fecha_checkin)"
        }).values('year', 'month').annotate(count=Count('id'), total=Sum('monto_total')).order_by('year', 'month')
        datos_graficos = {
            'estados': list(reservas_por_estado),
            'propiedades': list(reservas_por_propiedad),
            'tendencia_mensual': list(tendencia_mensual)
        }
        return JsonResponse({'status': 'success', 'data': data})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

reportes_reservas.permission_codename = "reportes.ver"