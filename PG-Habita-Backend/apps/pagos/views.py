import stripe
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from .models import MetodoPago
from .serializers import MetodoPagoSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

class MetodoPagoList(generics.ListCreateAPIView):
    serializer_class = MetodoPagoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MetodoPago.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class MetodoPagoCUD(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MetodoPagoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MetodoPago.objects.filter(usuario=self.request.user)

class ProcesarPago(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        payment_method_id = request.data.get('payment_method_id')
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # En centavos
                currency='bob',
                payment_method=payment_method_id,
                confirm=True,
            )
            return Response({'status': 'success', 'intent': intent})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)