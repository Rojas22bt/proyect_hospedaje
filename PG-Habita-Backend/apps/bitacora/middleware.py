from .models import Bitacora

class BitacoraMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            self.registrar_accion(request, response)
        return response

    def registrar_accion(self, request, response):
        try:
            accion = self.determinar_accion(request)
            if accion:
                Bitacora.objects.create(
                    usuario=request.user,
                    accion=accion['accion'],
                    modulo=accion['modulo'],
                    detalles={
                        'method': request.method,
                        'path': request.path,
                        'status_code': response.status_code,
                        'params': dict(request.GET) if request.method == 'GET' else {}
                    },
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
        except Exception:
            pass

    def determinar_accion(self, request):
        path = request.path
        method = request.method
        if '/api/propiedades/' in path:
            return {'accion': 'Creó propiedad' if method == 'POST' else 'Actualizó propiedad' if method == 'PUT' else 'Eliminó propiedad', 'modulo': 'Propiedades'}
        if '/api/reservas/' in path:
            return {'accion': 'Creó reserva' if method == 'POST' else 'Actualizó reserva', 'modulo': 'Reservas'}
        if '/api/backup/' in path:
            return {'accion': 'Usó sistema de backup', 'modulo': 'Backup'}
        if '/api/reportes/' in path:
            return {'accion': 'Generó reporte', 'modulo': 'Reportes'}
        return None

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip