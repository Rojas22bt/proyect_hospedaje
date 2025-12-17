from rest_framework import serializers
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Notificacion
        fields = [
            'id', 'usuario', 'titulo', 'mensaje', 'tipo', 'tipo_display',
            'reserva', 'leida', 'enviada', 'creado_en'
        ]
        read_only_fields = ['usuario', 'creado_en']

class NotificacionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['titulo', 'mensaje', 'tipo', 'reserva']

class MarcarLeidaSerializer(serializers.Serializer):
    leida = serializers.BooleanField(default=True)