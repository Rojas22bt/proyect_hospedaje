from rest_framework import serializers
from .models import Puntos

class PuntosSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Puntos
        fields = ['id', 'usuario', 'saldo', 'total_acumulado', 'usuario_username', 'creado_en', 'actualizado_en']
        read_only_fields = ['usuario', 'creado_en', 'actualizado_en']