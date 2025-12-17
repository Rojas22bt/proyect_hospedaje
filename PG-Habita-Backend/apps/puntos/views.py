from rest_framework import generics, permissions
from .models import Puntos
from .serializers import PuntosSerializer

class PuntosList(generics.ListCreateAPIView):
    serializer_class = PuntosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Puntos.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class PuntosCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PuntosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Puntos.objects.filter(usuario=self.request.user)