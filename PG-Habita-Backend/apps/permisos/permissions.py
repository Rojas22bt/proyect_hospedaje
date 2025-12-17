from rest_framework.permissions import BasePermission


class HasPermission(BasePermission):
    def has_permission(self, request, view):
        # Si el usuario no está autenticado, el acceso es denegado
        if not request.user.is_authenticated:
            return False

        # Si el usuario es un superusuario, tiene acceso total
        if request.user.is_superuser:
            return True

        # Obtiene los permisos del payload del token
        # Nota: con SimpleJWT, request.auth suele ser un Token (dict-like) y no siempre expone .get()
        token = getattr(request, 'auth', None)
        user_permissions = []

        if token is not None:
            # dict real
            if isinstance(token, dict):
                user_permissions = token.get('permisos', [])
            else:
                # Token/AccessToken (dict-like)
                try:
                    if hasattr(token, 'get'):
                        user_permissions = token.get('permisos', [])
                    else:
                        user_permissions = token['permisos']
                except Exception:
                    try:
                        user_permissions = token['permisos']
                    except Exception:
                        user_permissions = []

        # El nombre del permiso que se necesita para acceder a la vista
        required_permission = getattr(view, 'permission_codename', None)

        # Si la vista no tiene un nombre de permiso, se le da acceso
        if not required_permission:
            return True

        return required_permission in user_permissions