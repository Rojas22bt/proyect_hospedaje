from rest_framework import serializers
from .models import Recompensa, Canje

class RecompensaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recompensa
        fields = ['id', 'nombre', 'descripcion', 'puntos_requeridos', 'activa', 'stock', 'creado_en']

class CanjeSerializer(serializers.ModelSerializer):
    recompensa_nombre = serializers.CharField(source='recompensa.nombre', read_only=True)

    class Meta:
        model = Canje
        fields = ['id', 'usuario', 'recompensa', 'puntos_usados', 'recompensa_nombre', 'fecha_canje']
        read_only_fields = ['usuario', 'fecha_canje']