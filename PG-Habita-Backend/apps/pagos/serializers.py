from rest_framework import serializers
from .models import MetodoPago

class MetodoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoPago
        fields = ['id', 'usuario', 'tipo', 'stripe_id', 'qr_imagen', 'activo']
        read_only_fields = ['usuario']