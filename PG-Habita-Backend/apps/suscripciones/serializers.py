from rest_framework import serializers
from .models import Suscripciones

class SuscripcionesSerializer(serializers.ModelSerializer):
    # Campos calculados (read-only)
    precio_semestral = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    precio_anual = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    precio_total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Suscripciones
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio_mensual',
            'status',
            'precio_semestral',
            'precio_anual',
            'precio_total',
        ]
        read_only_fields = ['precio_semestral', 'precio_anual', 'precio_total']