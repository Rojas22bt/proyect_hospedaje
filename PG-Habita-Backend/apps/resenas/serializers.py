from rest_framework import serializers
from .models import Resena

class ResenaSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    propiedad_nombre = serializers.CharField(source='propiedad.nombre', read_only=True)

    class Meta:
        model = Resena
        fields = ['id', 'usuario', 'propiedad', 'reserva', 'estrellas', 'comentario', 'usuario_username', 'propiedad_nombre', 'creado_en']
        read_only_fields = ['usuario', 'creado_en']