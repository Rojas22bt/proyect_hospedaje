from rest_framework import generics
from apps.planes.models import Plan
from apps.planes.serializers import PlanSerializer
from apps.permisos.permissions import HasPermission


class PlanList(generics.ListCreateAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_planes'

class PlanCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [HasPermission]
    permission_codename = 'editar_plan'