from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Recompensa, Canje
from .serializers import RecompensaSerializer, CanjeSerializer
from apps.puntos.models import Puntos


class RecompensaList(generics.ListCreateAPIView):
    serializer_class = RecompensaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recompensa.objects.filter(activa=True)


class RecompensaCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecompensaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recompensa.objects.all()


class CanjearRecompensa(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, recompensa_id):
        try:
            recompensa = Recompensa.objects.get(id=recompensa_id, activa=True, stock__gt=0)
            puntos_usuario = Puntos.objects.get(usuario=request.user)

            if puntos_usuario.saldo >= recompensa.puntos_requeridos:
                # Canjear
                puntos_usuario.restar_puntos(recompensa.puntos_requeridos)
                recompensa.stock -= 1
                recompensa.save()
                Canje.objects.create(
                    usuario=request.user,
                    recompensa=recompensa,
                    puntos_usados=recompensa.puntos_requeridos
                )
                return Response({'status': 'success', 'message': 'Recompensa canjeada'})
            else:
                return Response({'error': 'Puntos insuficientes'}, status=status.HTTP_400_BAD_REQUEST)
        except Recompensa.DoesNotExist:
            return Response({'error': 'Recompensa no disponible'}, status=status.HTTP_404_NOT_FOUND)
        except Puntos.DoesNotExist:
            return Response({'error': 'Usuario sin puntos'}, status=status.HTTP_404_NOT_FOUND)