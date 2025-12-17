from rest_framework import generics
from apps.permisos.permissions import HasPermission
from apps.servicios.models import Servicio
from apps.servicios.serializers import ServiciosSerializer


class ServicioList(generics.ListCreateAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServiciosSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_servicios'


class ServicioCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServiciosSerializer
    permission_classes = [HasPermission]
    permission_codename = 'cud_servicio'