import io
import json
import os
import time
import traceback
from datetime import datetime, timedelta

import requests
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.permisos.permissions import HasPermission
from apps.reservas.models import Reservas
from apps.propiedades.models import Propiedades
from apps.facturas.models import Factura
from apps.usuarios.models import CustomUser
from .models import ReporteGenerado
from .serializers import GenerarReporteDinamicoSerializer, ReporteIASerializer

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

        top_propiedades = list(reservas_por_propiedad[:5])

        reporte = {
            'total_reservas': total_reservas,
            'total_ganancias': float(total_ganancias) if total_ganancias is not None else 0,
            'periodo': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin,
            },
            'estadisticas': {
                'reservas_por_estado': [
                    {
                        'estado': item['status'],
                        'count': item['count'],
                        'total': float(item['total'] or 0),
                    }
                    for item in reservas_por_estado
                ],
                'reservas_por_propiedad': [
                    {
                        'propiedad__nombre': item['propiedad__nombre'],
                        'count': item['count'],
                        'total': float(item['total'] or 0),
                    }
                    for item in reservas_por_propiedad
                ],
                'top_propiedades': [
                    {
                        'propiedad__id': item['propiedad__id'],
                        'propiedad__nombre': item['propiedad__nombre'],
                        'count': item['count'],
                        'total': float(item['total'] or 0),
                    }
                    for item in top_propiedades
                ],
            },
            'graficos': datos_graficos,
        }

        return JsonResponse({'status': 'success', 'reporte': reporte})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

reportes_reservas.permission_codename = "reportes.ver"


def _user_scope(user, tipo_reporte: str):
    """Restringe el alcance según el usuario (host vs admin)."""
    if user.is_superuser:
        if tipo_reporte == 'reservas' or tipo_reporte == 'ingresos' or tipo_reporte == 'ocupacion':
            return Reservas.objects.all(), None
        if tipo_reporte == 'propiedades':
            return Propiedades.objects.all(), None
        if tipo_reporte == 'usuarios':
            return CustomUser.objects.all(), None
        if tipo_reporte == 'facturas':
            return Factura.objects.select_related('reserva', 'reserva__propiedad'), None
    else:
        propiedades_usuario = Propiedades.objects.filter(user=user)
        if tipo_reporte == 'reservas' or tipo_reporte == 'ingresos' or tipo_reporte == 'ocupacion':
            return Reservas.objects.filter(propiedad__in=propiedades_usuario), propiedades_usuario
        if tipo_reporte == 'propiedades':
            return propiedades_usuario, None
        if tipo_reporte == 'facturas':
            return Factura.objects.filter(reserva__propiedad__in=propiedades_usuario).select_related('reserva', 'reserva__propiedad'), None
        if tipo_reporte == 'usuarios':
            return CustomUser.objects.none(), None

    return None, None


def _reservas_meta():
    return {
        'label': 'Reservas',
        'campos': {
            'id': {'label': 'ID', 'tipo': 'number'},
            'fecha_checkin': {'label': 'Check-in', 'tipo': 'date'},
            'fecha_checkout': {'label': 'Check-out', 'tipo': 'date'},
            'status': {'label': 'Estado', 'tipo': 'string'},
            'pago_estado': {'label': 'Estado de pago', 'tipo': 'string'},
            'monto_total': {'label': 'Monto total', 'tipo': 'money'},
            'descuento': {'label': 'Descuento', 'tipo': 'money'},
            'cant_huesp': {'label': 'Cantidad huéspedes', 'tipo': 'number'},
            'cant_noches': {'label': 'Noches', 'tipo': 'number'},
            'propiedad__id': {'label': 'ID Propiedad', 'tipo': 'number'},
            'propiedad__nombre': {'label': 'Propiedad', 'tipo': 'string'},
            'user__correo': {'label': 'Correo huésped', 'tipo': 'string'},
        },
        'filtros': {
            'fecha_inicio': {'label': 'Fecha inicio (check-in >=)', 'tipo': 'date'},
            'fecha_fin': {'label': 'Fecha fin (check-out <=)', 'tipo': 'date'},
            'status': {'label': 'Estado reserva', 'tipo': 'string'},
            'pago_estado': {'label': 'Estado pago', 'tipo': 'string'},
            'propiedad_id': {'label': 'Propiedad', 'tipo': 'number'},
        },
        'agrupaciones': ['status', 'propiedad', 'mes'],
    }


def _propiedades_meta():
    return {
        'label': 'Propiedades',
        'campos': {
            'id': {'label': 'ID', 'tipo': 'number'},
            'nombre': {'label': 'Nombre', 'tipo': 'string'},
            'tipo': {'label': 'Tipo', 'tipo': 'string'},
            'precio_noche': {'label': 'Precio/noche', 'tipo': 'money'},
            'max_huespedes': {'label': 'Máx. huéspedes', 'tipo': 'number'},
            'ciudad': {'label': 'Ciudad', 'tipo': 'string'},
            'departamento': {'label': 'Departamento', 'tipo': 'string'},
            'pais': {'label': 'País', 'tipo': 'string'},
            'es_destino_turistico': {'label': 'Destino turístico', 'tipo': 'bool'},
            'creado_en': {'label': 'Creado', 'tipo': 'datetime'},
        },
        'filtros': {
            'tipo': {'label': 'Tipo', 'tipo': 'string'},
            'ciudad': {'label': 'Ciudad', 'tipo': 'string'},
            'es_destino_turistico': {'label': 'Destino turístico', 'tipo': 'bool'},
        },
        'agrupaciones': ['tipo', 'ciudad'],
    }


def _facturas_meta():
    return {
        'label': 'Facturas',
        'campos': {
            'id': {'label': 'ID', 'tipo': 'number'},
            'nit_ci': {'label': 'NIT/CI', 'tipo': 'string'},
            'nombre': {'label': 'Nombre', 'tipo': 'string'},
            'total': {'label': 'Total', 'tipo': 'money'},
            'enviada': {'label': 'Enviada', 'tipo': 'bool'},
            'creado_en': {'label': 'Creado', 'tipo': 'datetime'},
            'reserva__id': {'label': 'ID Reserva', 'tipo': 'number'},
            'reserva__propiedad__nombre': {'label': 'Propiedad', 'tipo': 'string'},
        },
        'filtros': {
            'enviada': {'label': 'Enviada', 'tipo': 'bool'},
            'fecha_inicio': {'label': 'Fecha inicio (creado >=)', 'tipo': 'date'},
            'fecha_fin': {'label': 'Fecha fin (creado <=)', 'tipo': 'date'},
        },
        'agrupaciones': ['enviada', 'mes'],
    }


def _usuarios_meta():
    return {
        'label': 'Usuarios (solo admin)',
        'campos': {
            'id': {'label': 'ID', 'tipo': 'number'},
            'username': {'label': 'Username', 'tipo': 'string'},
            'correo': {'label': 'Correo', 'tipo': 'string'},
            'N_Cel': {'label': 'Celular', 'tipo': 'string'},
            'fecha_Nac': {'label': 'Fecha nac.', 'tipo': 'date'},
            'is_active': {'label': 'Activo', 'tipo': 'bool'},
            'is_superuser': {'label': 'Admin', 'tipo': 'bool'},
            'date_joined': {'label': 'Registro', 'tipo': 'datetime'},
        },
        'filtros': {
            'is_active': {'label': 'Activo', 'tipo': 'bool'},
            'fecha_inicio': {'label': 'Fecha inicio (registro >=)', 'tipo': 'date'},
            'fecha_fin': {'label': 'Fecha fin (registro <=)', 'tipo': 'date'},
        },
        'agrupaciones': ['is_active', 'mes'],
    }


def _meta_reportes():
    return {
        'reservas': _reservas_meta(),
        'propiedades': _propiedades_meta(),
        'facturas': _facturas_meta(),
        'usuarios': _usuarios_meta(),
        'ingresos': {'label': 'Ingresos (derivado de reservas)', 'campos': {'mes': {'label': 'Mes', 'tipo': 'string'}, 'total': {'label': 'Total', 'tipo': 'money'}, 'count': {'label': 'Reservas', 'tipo': 'number'}}, 'filtros': _reservas_meta()['filtros'], 'agrupaciones': ['mes']},
        'ocupacion': {'label': 'Ocupación (estimada)', 'campos': {'mes': {'label': 'Mes', 'tipo': 'string'}, 'noches_reservadas': {'label': 'Noches reservadas', 'tipo': 'number'}, 'noches_posibles': {'label': 'Noches posibles', 'tipo': 'number'}, 'ocupacion': {'label': 'Ocupación', 'tipo': 'percent'}}, 'filtros': _reservas_meta()['filtros'], 'agrupaciones': ['mes']},
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def reportes_meta(request):
    try:
        return JsonResponse({'status': 'success', 'meta': _meta_reportes()})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


reportes_meta.permission_codename = 'reportes.ver'


def _apply_filters(qs, tipo_reporte: str, filtros: dict):
    if not filtros:
        return qs

    fecha_inicio = filtros.get('fecha_inicio')
    fecha_fin = filtros.get('fecha_fin')

    if tipo_reporte in ['reservas', 'ingresos', 'ocupacion']:
        if fecha_inicio:
            qs = qs.filter(fecha_checkin__gte=fecha_inicio)
        if fecha_fin:
            qs = qs.filter(fecha_checkout__lte=fecha_fin)
        if filtros.get('status'):
            qs = qs.filter(status=filtros.get('status'))
        if filtros.get('pago_estado'):
            qs = qs.filter(pago_estado=filtros.get('pago_estado'))
        if filtros.get('propiedad_id'):
            qs = qs.filter(propiedad_id=filtros.get('propiedad_id'))

    if tipo_reporte == 'propiedades':
        if filtros.get('tipo'):
            qs = qs.filter(tipo=filtros.get('tipo'))
        if filtros.get('ciudad'):
            qs = qs.filter(ciudad__icontains=filtros.get('ciudad'))
        if 'es_destino_turistico' in filtros:
            val = filtros.get('es_destino_turistico')
            if isinstance(val, bool):
                qs = qs.filter(es_destino_turistico=val)

    if tipo_reporte == 'facturas':
        if 'enviada' in filtros:
            val = filtros.get('enviada')
            if isinstance(val, bool):
                qs = qs.filter(enviada=val)
        if fecha_inicio:
            qs = qs.filter(creado_en__date__gte=fecha_inicio)
        if fecha_fin:
            qs = qs.filter(creado_en__date__lte=fecha_fin)

    if tipo_reporte == 'usuarios':
        if 'is_active' in filtros:
            val = filtros.get('is_active')
            if isinstance(val, bool):
                qs = qs.filter(is_active=val)
        if fecha_inicio:
            qs = qs.filter(date_joined__date__gte=fecha_inicio)
        if fecha_fin:
            qs = qs.filter(date_joined__date__lte=fecha_fin)

    return qs


def _rows_from_values(values_qs, campos):
    rows = []
    for item in values_qs:
        row = {}
        for campo in campos:
            val = item.get(campo)
            if hasattr(val, 'isoformat'):
                row[campo] = val.isoformat()
            else:
                try:
                    from decimal import Decimal
                    if isinstance(val, Decimal):
                        row[campo] = float(val)
                    else:
                        row[campo] = val
                except Exception:
                    row[campo] = val
        rows.append(row)
    return rows


def _insights_basicos(tipo_reporte: str, resumen: dict):
    insights = []
    if tipo_reporte in ['reservas', 'ingresos']:
        total = resumen.get('total_ingresos')
        count = resumen.get('total_registros')
        if count == 0:
            insights.append('No hay datos para el rango de filtros seleccionado.')
        elif total is not None:
            if float(total) > 0 and count:
                insights.append(f"Ingreso promedio por reserva: {float(resumen.get('ingreso_promedio') or 0):.2f}")
    if tipo_reporte == 'ocupacion':
        prom = resumen.get('ocupacion_promedio')
        if prom is not None:
            insights.append(f"Ocupación promedio estimada: {float(prom) * 100:.1f}%")
    return insights


def _generar_reporte_desde_payload(user, payload: dict, propiedades_usuario_cache=None):
    """Genera el reporte a partir del payload validado (sin depender de request)."""
    start = time.time()

    tipo_reporte = payload['tipo_reporte']
    campos = payload.get('campos_seleccionados') or []
    filtros = payload.get('filtros') or {}
    agrupacion = payload.get('agrupacion')
    ordenamiento = payload.get('ordenamiento')
    limite = int(payload.get('limite') or 100)
    incluir_estadisticas = bool(payload.get('incluir_estadisticas', True))
    incluir_graficos = bool(payload.get('incluir_graficos', True))

    meta = _meta_reportes().get(tipo_reporte)
    if not meta:
        raise ValueError('Tipo de reporte no soportado')

    qs, propiedades_usuario = _user_scope(user, tipo_reporte)
    if qs is None:
        raise PermissionError('No autorizado para este reporte')

    if propiedades_usuario_cache is not None:
        propiedades_usuario = propiedades_usuario_cache

    campos_disponibles = set(meta.get('campos', {}).keys())
    if not campos:
        campos = list(campos_disponibles)[:10]
    campos = [c for c in campos if c in campos_disponibles]

    qs = _apply_filters(qs, tipo_reporte, filtros)

    resultado = {
        'tipo_reporte': tipo_reporte,
        'campos': campos,
        'filtros': filtros,
        'agrupacion': agrupacion,
        'ordenamiento': ordenamiento,
    }

    if tipo_reporte in ['reservas', 'propiedades', 'facturas', 'usuarios']:
        values_qs = qs.values(*campos)
        if ordenamiento and ordenamiento in campos:
            values_qs = values_qs.order_by(ordenamiento)
        resultado['rows'] = _rows_from_values(values_qs[:limite], campos)

    if tipo_reporte == 'ingresos':
        trend = qs.annotate(mes=TruncMonth('fecha_checkin')).values('mes').annotate(
            total=Sum('monto_total'),
            count=Count('id'),
        ).order_by('mes')
        resultado['rows'] = [
            {
                'mes': (item['mes'].date().isoformat() if item['mes'] else None),
                'total': float(item['total'] or 0),
                'count': item['count'],
            }
            for item in trend
        ]

    if tipo_reporte == 'ocupacion':
        if user.is_superuser:
            props_qs = Propiedades.objects.all()
        else:
            props_qs = propiedades_usuario or Propiedades.objects.filter(user=user)
        total_propiedades = props_qs.count() or 1

        trend = qs.annotate(mes=TruncMonth('fecha_checkin')).values('mes').annotate(
            noches_reservadas=Sum('cant_noches'),
        ).order_by('mes')

        rows = []
        for item in trend:
            mes = item['mes'].date() if item['mes'] else None
            if not mes:
                continue
            next_month = (mes.replace(day=28) + timedelta(days=4)).replace(day=1)
            days_in_month = (next_month - mes.replace(day=1)).days
            noches_posibles = days_in_month * total_propiedades
            noches_reservadas = int(item['noches_reservadas'] or 0)
            ocupacion = (noches_reservadas / noches_posibles) if noches_posibles else 0
            rows.append({
                'mes': mes.isoformat(),
                'noches_reservadas': noches_reservadas,
                'noches_posibles': noches_posibles,
                'ocupacion': ocupacion,
            })
        resultado['rows'] = rows

    resumen = {}
    graficos = {}

    if incluir_estadisticas:
        if tipo_reporte in ['reservas', 'ingresos', 'ocupacion']:
            agg = qs.aggregate(
                total_registros=Count('id'),
                total_ingresos=Sum('monto_total'),
                ingreso_promedio=Avg('monto_total'),
                total_descuentos=Sum('descuento'),
            )
            resumen.update({
                'total_registros': int(agg.get('total_registros') or 0),
                'total_ingresos': float(agg.get('total_ingresos') or 0),
                'ingreso_promedio': float(agg.get('ingreso_promedio') or 0),
                'total_descuentos': float(agg.get('total_descuentos') or 0),
            })
            if tipo_reporte == 'ocupacion' and resultado.get('rows'):
                resumen['ocupacion_promedio'] = sum(r['ocupacion'] for r in resultado['rows']) / max(len(resultado['rows']), 1)

        if tipo_reporte == 'propiedades':
            agg = qs.aggregate(total=Count('id'), precio_promedio=Avg('precio_noche'))
            resumen.update({
                'total_registros': int(agg.get('total') or 0),
                'precio_promedio': float(agg.get('precio_promedio') or 0),
            })

        if tipo_reporte == 'facturas':
            agg = qs.aggregate(total=Count('id'), total_facturado=Sum('total'))
            resumen.update({
                'total_registros': int(agg.get('total') or 0),
                'total_facturado': float(agg.get('total_facturado') or 0),
            })

    if incluir_graficos:
        if tipo_reporte == 'reservas':
            por_estado = qs.values('status').annotate(count=Count('id'), total=Sum('monto_total')).order_by('-count')
            por_propiedad = qs.values('propiedad__nombre').annotate(count=Count('id'), total=Sum('monto_total')).order_by('-total')[:10]
            tendencia = qs.annotate(mes=TruncMonth('fecha_checkin')).values('mes').annotate(count=Count('id'), total=Sum('monto_total')).order_by('mes')
            graficos = {
                'reservas_por_estado': [
                    {'estado': i['status'], 'count': i['count'], 'total': float(i['total'] or 0)}
                    for i in por_estado
                ],
                'reservas_por_propiedad': [
                    {'propiedad': i['propiedad__nombre'], 'count': i['count'], 'total': float(i['total'] or 0)}
                    for i in por_propiedad
                ],
                'tendencia_mensual': [
                    {'mes': (i['mes'].date().isoformat() if i['mes'] else None), 'count': i['count'], 'total': float(i['total'] or 0)}
                    for i in tendencia
                ]
            }

    resultado['resumen'] = resumen
    resultado['graficos'] = graficos
    resultado['insights'] = _insights_basicos(tipo_reporte, resumen)
    resultado['generado_en'] = datetime.utcnow().isoformat() + 'Z'

    elapsed = time.time() - start
    return resultado, elapsed


@api_view(['POST'])
@permission_classes([IsAuthenticated, HasPermission])
def generar_reporte_dinamico(request):
    try:
        serializer = GenerarReporteDinamicoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        resultado, elapsed = _generar_reporte_desde_payload(request.user, payload)

        ReporteGenerado.objects.create(
            usuario=request.user,
            tipo_reporte=resultado.get('tipo_reporte') or payload.get('tipo_reporte'),
            configuracion_usada={
                'campos': resultado.get('campos'),
                'agrupacion': resultado.get('agrupacion'),
                'ordenamiento': resultado.get('ordenamiento'),
                'limite': payload.get('limite') or 100,
            },
            parametros_filtro=resultado.get('filtros') or {},
            resultado_resumen=resultado.get('resumen') or {},
            formato_exportado='json',
            tiempo_generacion=float(elapsed),
        )

        return JsonResponse({'status': 'success', 'reporte': resultado})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


generar_reporte_dinamico.permission_codename = 'reportes.ver'


def _export_csv(reporte: dict):
    import csv
    output = io.StringIO()
    writer = csv.writer(output)
    campos = reporte.get('campos') or []
    rows = reporte.get('rows') or []
    if rows and not campos:
        campos = list(rows[0].keys())
    writer.writerow(campos)
    for r in rows:
        writer.writerow([r.get(c) for c in campos])
    return output.getvalue().encode('utf-8')


def _export_excel(reporte: dict):
    try:
        from openpyxl import Workbook
    except ImportError as e:
        raise RuntimeError(
            "Falta dependencia 'openpyxl' para exportar a Excel. "
            "Activa el entorno virtual del backend y ejecuta: pip install -r requirements.txt"
        ) from e
    wb = Workbook()
    ws = wb.active
    ws.title = 'Reporte'
    campos = reporte.get('campos') or []
    rows = reporte.get('rows') or []
    if rows and not campos:
        campos = list(rows[0].keys())
    ws.append(campos)
    for r in rows:
        ws.append([r.get(c) for c in campos])
    buff = io.BytesIO()
    wb.save(buff)
    return buff.getvalue()


def _export_pdf(reporte: dict):
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except ImportError as e:
        raise RuntimeError(
            "Falta dependencia 'reportlab' para exportar a PDF. "
            "Activa el entorno virtual del backend y ejecuta: pip install -r requirements.txt"
        ) from e

    buff = io.BytesIO()
    c = canvas.Canvas(buff, pagesize=letter)
    width, height = letter
    y = height - 50

    c.setFont('Helvetica-Bold', 14)
    c.drawString(50, y, f"Reporte: {reporte.get('tipo_reporte')}")
    y -= 24

    c.setFont('Helvetica', 10)
    filtros = reporte.get('filtros') or {}
    c.drawString(50, y, f"Filtros: {json.dumps(filtros, ensure_ascii=False)}")
    y -= 18

    campos = reporte.get('campos') or []
    rows = reporte.get('rows') or []
    if rows and not campos:
        campos = list(rows[0].keys())

    c.setFont('Helvetica-Bold', 9)
    c.drawString(50, y, ' | '.join(campos[:8]))
    y -= 14
    c.setFont('Helvetica', 9)

    for r in rows[:200]:
        line = ' | '.join([str(r.get(col, '')) for col in campos[:8]])
        c.drawString(50, y, line[:140])
        y -= 12
        if y < 60:
            c.showPage()
            y = height - 50
            c.setFont('Helvetica', 9)

    c.showPage()
    c.save()
    return buff.getvalue()


@api_view(['POST'])
@permission_classes([IsAuthenticated, HasPermission])
def exportar_reporte(request):
    """Exporta un reporte generado (enviando el mismo payload de generar_reporte_dinamico)."""
    try:
        formato = (request.query_params.get('formato') or 'csv').lower()
        if formato == 'excel':
            formato = 'xlsx'

        # Validar payload y generar reporte SIN invocar otra vista DRF (evita 500)
        serializer = GenerarReporteDinamicoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        reporte, elapsed = _generar_reporte_desde_payload(request.user, payload)

        filename = f"reporte_{reporte.get('tipo_reporte','data')}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

        if formato == 'csv':
            content = _export_csv(reporte)
            resp = HttpResponse(content, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
        elif formato in ['xlsx']:
            content = _export_excel(reporte)
            resp = HttpResponse(content, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            resp['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
        elif formato == 'pdf':
            content = _export_pdf(reporte)
            resp = HttpResponse(content, content_type='application/pdf')
            resp['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        else:
            return JsonResponse({'status': 'error', 'message': 'Formato no soportado'}, status=400)

        # Registrar exportación
        try:
            ReporteGenerado.objects.create(
                usuario=request.user,
                tipo_reporte=reporte.get('tipo_reporte') or payload.get('tipo_reporte'),
                configuracion_usada={
                    'campos': reporte.get('campos'),
                    'agrupacion': reporte.get('agrupacion'),
                    'ordenamiento': reporte.get('ordenamiento'),
                    'limite': payload.get('limite') or 100,
                },
                parametros_filtro=reporte.get('filtros') or {},
                resultado_resumen=reporte.get('resumen') or {},
                formato_exportado=formato,
                tiempo_generacion=float(elapsed),
            )
        except Exception:
            # No romper export si falla el log
            traceback.print_exc()

        return resp
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


exportar_reporte.permission_codename = 'reportes.ver'


@api_view(['POST'])
@permission_classes([IsAuthenticated, HasPermission])
def generar_reporte_por_ia(request):
    """IA: convierte un prompt en una configuración de reporte (JSON) y genera el reporte."""
    try:
        serializer = ReporteIASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']
        contexto = serializer.validated_data.get('contexto_adicional') or ''
        meta = _meta_reportes()

        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('VITE_OPENAI_API_KEY')
        api_url = os.getenv('OPENAI_API_URL') or os.getenv('VITE_OPENAI_API_URL') or 'https://api.openai.com/v1/chat/completions'
        model = os.getenv('OPENAI_MODEL') or os.getenv('VITE_OPENAI_MODEL') or 'gpt-4o-mini'

        if not api_key:
            return JsonResponse({'status': 'error', 'message': 'Falta OPENAI_API_KEY en el backend (.env).'}, status=500)

        system = (
            'Eres un analista de datos. Devuelve SOLO JSON válido (sin markdown). '\
            'Debes mapear el pedido a una configuración para generar_reporte_dinamico con las claves: '\
            'tipo_reporte, campos_seleccionados, filtros, agrupacion, ordenamiento, limite, incluir_estadisticas, incluir_graficos. '\
            'Usa únicamente tipos/campos/filtros permitidos por este meta JSON. Si falta info, asume lo mínimo.'
        )

        user_msg = {
            'prompt_usuario': prompt,
            'contexto_adicional': contexto,
            'meta_permitido': meta,
        }

        resp = requests.post(
            api_url,
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': model,
                'messages': [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': json.dumps(user_msg, ensure_ascii=False)},
                ],
                'temperature': 0.2,
            },
            timeout=60,
        )

        if resp.status_code >= 400:
            return JsonResponse({'status': 'error', 'message': 'Error consultando IA', 'detail': resp.text}, status=502)

        data = resp.json()
        content = data['choices'][0]['message']['content']
        try:
            config = json.loads(content)
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'La IA no devolvió JSON válido', 'raw': content}, status=400)

        # Sanear valores null/"" que rompen validación
        if isinstance(config, dict):
            for k in ['agrupacion', 'ordenamiento']:
                if config.get(k) is None or config.get(k) == '':
                    config.pop(k, None)
            if config.get('campos_seleccionados') is None:
                config.pop('campos_seleccionados', None)
            if config.get('filtros') is None:
                config.pop('filtros', None)

        # Validar que la config cumple el serializer
        dyn = GenerarReporteDinamicoSerializer(data=config)
        try:
            dyn.is_valid(raise_exception=True)
        except Exception as ve:
            detail = getattr(ve, 'detail', None)
            print('❌ IA config inválida (validación serializer)')
            print('Prompt:', prompt)
            print('Modelo:', model)
            print('AI raw content:', content)
            print('AI parsed config:', config)
            # Errores de validación -> 400 para que el frontend muestre el mensaje
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Config generada por IA inválida',
                    'validation_errors': detail if detail is not None else str(ve),
                    'ai_model': model,
                    'ai_raw': content,
                    'ai_config': config,
                },
                status=400,
            )
        valid = dyn.validated_data

        resultado, elapsed = _generar_reporte_desde_payload(request.user, valid)

        ReporteGenerado.objects.create(
            usuario=request.user,
            tipo_reporte=resultado.get('tipo_reporte') or valid.get('tipo_reporte') or 'personalizado',
            configuracion_usada=config,
            parametros_filtro=resultado.get('filtros') or {},
            prompt_ia=prompt,
            respuesta_ia=content,
            resultado_resumen=resultado.get('resumen') or {},
            formato_exportado='json',
            tiempo_generacion=float(elapsed),
        )

        return JsonResponse({'status': 'success', 'reporte': resultado, 'config': config})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


generar_reporte_por_ia.permission_codename = 'reportes.ver'