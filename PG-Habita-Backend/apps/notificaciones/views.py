from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q

from .models import Notificacion
from .serializers import NotificacionSerializer, NotificacionCreateSerializer, MarcarLeidaSerializer


class NotificacionList(generics.ListCreateAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return Notificacion.objects.all().order_by('-creado_en')
            return Notificacion.objects.filter(usuario=self.request.user).order_by('-creado_en')
        except Exception as e:
            print(f"Error en get_queryset de notificaciones: {e}")
            return Notificacion.objects.none()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NotificacionCreateSerializer
        return NotificacionSerializer

    def perform_create(self, serializer):
        try:
            if not self.request.user.is_staff:
                serializer.save(usuario=self.request.user)
            else:
                serializer.save()
        except Exception as e:
            print(f"Error en perform_create de notificaciones: {e}")
            raise


class NotificacionCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            if self.request.user.is_staff or self.request.user.is_superuser:
                return Notificacion.objects.all()
            return Notificacion.objects.filter(usuario=self.request.user)
        except Exception as e:
            print(f"Error en get_queryset de NotificacionCUD: {e}")
            return Notificacion.objects.none()


class NotificacionesNoLeidas(generics.ListAPIView):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return Notificacion.objects.filter(
                usuario=self.request.user,
                leida=False
            ).order_by('-creado_en')
        except Exception as e:
            print(f"Error en get_queryset de NotificacionesNoLeidas: {e}")
            return Notificacion.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)

            # 🔥 ASEGURAR QUE SIEMPRE RETORNE UN ARRAY
            response_data = serializer.data
            if not isinstance(response_data, list):
                response_data = []

            return Response(response_data)

        except Exception as e:
            print(f"Error en list de NotificacionesNoLeidas: {e}")
            return Response([])  # 🔥 RETORNAR ARRAY VACÍO EN CASO DE ERROR


class MarcarTodasLeidas(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            notificaciones = Notificacion.objects.filter(usuario=request.user, leida=False)
            count = notificaciones.update(leida=True)

            return Response({
                'status': 'success',
                'message': f'{count} notificaciones marcadas como leídas',
                'count': count
            })
        except Exception as e:
            print(f"Error en MarcarTodasLeidas: {e}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarcarLeida(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # Buscar la notificación que pertenezca al usuario
            notificacion = Notificacion.objects.get(
                Q(pk=pk) &
                (Q(usuario=request.user) | Q(usuario__is_staff=True) | Q(usuario__is_superuser=True))
            )

            serializer = MarcarLeidaSerializer(data=request.data)

            if serializer.is_valid():
                notificacion.leida = serializer.validated_data['leida']
                notificacion.save()

                return Response({
                    'status': 'success',
                    'message': 'Notificación actualizada',
                    'notificacion_id': notificacion.id,
                    'leida': notificacion.leida
                })

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Notificacion.DoesNotExist:
            return Response(
                {'error': 'Notificación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error en MarcarLeida: {e}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )