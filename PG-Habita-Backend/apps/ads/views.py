from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Publicidad
from .serializers import PublicidadSerializer, PublicidadCreateSerializer, PublicidadActivaSerializer

class PublicidadList(generics.ListCreateAPIView):
    serializer_class = PublicidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Publicidad.objects.all()
        return Publicidad.objects.filter(activa=True)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PublicidadCreateSerializer
        return PublicidadSerializer

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

class PublicidadCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PublicidadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Publicidad.objects.all()
        return Publicidad.objects.filter(activa=True)

class PublicidadActivaList(generics.ListAPIView):
    serializer_class = PublicidadActivaSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        ahora = timezone.now()
        return Publicidad.objects.filter(activa=True, fecha_inicio__lte=ahora, fecha_fin__gte=ahora)

class ToggleActiva(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'No tienes permisos'}, status=status.HTTP_403_FORBIDDEN)
        try:
            publicidad = Publicidad.objects.get(pk=pk)
            publicidad.activa = not publicidad.activa
            publicidad.save()
            return Response({'status': 'success', 'activa': publicidad.activa})
        except Publicidad.DoesNotExist:
            return Response({'error': 'Publicidad no encontrada'}, status=status.HTTP_404_NOT_FOUND)