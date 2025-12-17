from rest_framework import generics, permissions
from rest_framework.response import Response
from apps.reservas.models import Reservas
from apps.reservas.serializers import ReservasSerializer

class HistorialPagos(generics.ListAPIView):
    serializer_class = ReservasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservas.objects.filter(user=self.request.user, pago_estado='pagado')

class HistorialDepositos(generics.ListAPIView):
    serializer_class = ReservasSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservas.objects.filter(propiedad__user=self.request.user, pago_estado='pagado')