from rest_framework import serializers
from .models import Devolucion

class DevolucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devolucion
        fields = ['id', 'reserva', 'motivo', 'aprobado', 'creado_en']
        read_only_fields = ['creado_en']