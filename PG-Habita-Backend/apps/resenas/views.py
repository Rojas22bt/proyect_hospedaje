from rest_framework import generics, permissions
from .models import Resena
from .serializers import ResenaSerializer

class ResenaList(generics.ListCreateAPIView):
    serializer_class = ResenaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resena.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ResenaCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResenaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resena.objects.filter(usuario=self.request.user)