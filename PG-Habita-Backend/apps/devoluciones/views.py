from rest_framework import generics, permissions
from .models import Devolucion
from .serializers import DevolucionSerializer

class DevolucionList(generics.ListCreateAPIView):
    serializer_class = DevolucionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Devolucion.objects.filter(reserva__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()  # Asume que el usuario envía reserva_id en el serializer

class DevolucionCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DevolucionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Devolucion.objects.filter(reserva__user=self.request.user)