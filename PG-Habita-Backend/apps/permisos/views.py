from rest_framework import generics
from .models import Permisos
from .serializers import permisosSerializer
from ..permisos.permissions import HasPermission # Asegúrate de que esta importación sea correcta

class PermisosList(generics.ListCreateAPIView):
    queryset = Permisos.objects.all()
    serializer_class = permisosSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_permisos'

class PermisosCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Permisos.objects.all()
    serializer_class = permisosSerializer
    permission_classes = [HasPermission]
    permission_codename = 'cud_permiso'