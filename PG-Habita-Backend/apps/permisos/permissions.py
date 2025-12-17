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
        user_permissions = request.auth.get('permisos', [])

        # El nombre del permiso que se necesita para acceder a la vista
        required_permission = getattr(view, 'permission_codename', None)

        # Si la vista no tiene un nombre de permiso, se le da acceso
        if not required_permission:
            return True

        return required_permission in user_permissions