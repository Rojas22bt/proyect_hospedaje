from rest_framework import generics
from apps.suscripciones.models import Suscripciones
from apps.suscripciones.serializers import SuscripcionesSerializer
from apps.permisos.permissions import HasPermission

class SuscripcionesList(generics.ListCreateAPIView):
    queryset = Suscripciones.objects.all()
    serializer_class = SuscripcionesSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_suscripciones'

class SuscripcionesCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Suscripciones.objects.all()
    serializer_class = SuscripcionesSerializer
    permission_classes = [HasPermission]
    permission_codename = 'cud_suscripcion'


