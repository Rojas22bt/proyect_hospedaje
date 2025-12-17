from rest_framework import serializers
from .models import Factura

class FacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Factura
        fields = ['id', 'reserva', 'nit_ci', 'nombre', 'total', 'enviada', 'creado_en']
        read_only_fields = ['creado_en']