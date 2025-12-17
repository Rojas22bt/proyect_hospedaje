from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from apps.permisos.permissions import HasPermission
from .models import Bitacora
from apps.usuarios.models import CustomUser

@api_view(['GET'])
@permission_classes([IsAuthenticated, HasPermission])
def listar_bitacora(request):
    try:
        user = request.user
        search = request.GET.get('search', '')
        page = int(request.GET.get('page', 1))
        page_size = 20
        queryset = Bitacora.objects.all() if user.is_superuser else Bitacora.objects.filter(usuario=user)
        if search:
            queryset = queryset.filter(Q(usuario__username__icontains=search) | Q(accion__icontains=search) | Q(modulo__icontains=search))
        total = queryset.count()
        bitacoras = queryset.select_related('usuario')[(page - 1) * page_size: page * page_size]
        datos_bitacora = []
        for bitacora in bitacoras:
            datos_bitacora.append({
                'id': bitacora.id,
                'usuario': {
                    'id': bitacora.usuario.id,
                    'username': bitacora.usuario.username,
                    'nombre_completo': f"{bitacora.usuario.first_name} {bitacora.usuario.last_name}".strip() or bitacora.usuario.username
                },
                'accion': bitacora.accion,
                'modulo': bitacora.modulo,
                'detalles': bitacora.detalles,
                'ip_address': bitacora.ip_address,
                'user_agent': bitacora.user_agent,
                'creado_en': bitacora.creado_en.isoformat()
            })
        return JsonResponse({
            'status': 'success',
            'bitacoras': datos_bitacora,
            'total': total,
            'pagina': page,
            'total_paginas': (total + page_size - 1) // page_size
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Error obteniendo bitácora: {str(e)}'}, status=500)

listar_bitacora.permission_codename = "bitacora.ver"