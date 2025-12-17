from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from .models import Factura
from .serializers import FacturaSerializer
from apps.reservas.models import Reservas

class FacturaList(generics.ListCreateAPIView):
    serializer_class = FacturaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Factura.objects.filter(reserva__user=self.request.user)

class FacturaCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FacturaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Factura.objects.filter(reserva__user=self.request.user)

class GenerarFactura(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, reserva_id):
        try:
            reserva = Reservas.objects.get(id=reserva_id, user=request.user, pago_estado='pagado')
            factura, created = Factura.objects.get_or_create(
                reserva=reserva,
                defaults={'nit_ci': request.data.get('nit_ci'), 'nombre': request.data.get('nombre'), 'total': reserva.monto_total}
            )
            if created:
                send_mail(
                    'Factura Generada',
                    f'Factura #{factura.id} por {factura.total} Bs.',
                    'from@example.com',
                    [request.user.correo],
                    fail_silently=False,
                )
                factura.enviada = True
                factura.save()
            return Response({'status': 'success', 'factura_id': factura.id})
        except Reservas.DoesNotExist:
            return Response({'error': 'Reserva no encontrada o no pagada'}, status=status.HTTP_404_NOT_FOUND)