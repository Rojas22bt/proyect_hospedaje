from rest_framework import generics
from .models import Rol
from .serializers import RolSerializer
from apps.permisos.permissions import HasPermission

class RolList(generics.ListCreateAPIView):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_roles'


class RolCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [HasPermission]
    permission_codename = 'cud_rol'