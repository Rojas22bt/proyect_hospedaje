from rest_framework import serializers
from .models import Publicidad

class PublicidadSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    creado_por_username = serializers.CharField(source='creado_por.username', read_only=True)

    class Meta:
        model = Publicidad
        fields = [
            'id', 'titulo', 'descripcion', 'imagen_url', 'tipo', 'tipo_display',
            'fecha_inicio', 'fecha_fin', 'activa', 'creado_por', 'creado_por_username', 'creado_en'
        ]
        read_only_fields = ['creado_por', 'creado_en']

class PublicidadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicidad
        fields = ['titulo', 'descripcion', 'imagen_url', 'tipo', 'fecha_inicio', 'fecha_fin', 'activa']

class PublicidadActivaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Publicidad
        fields = ['id', 'titulo', 'descripcion', 'imagen_url', 'tipo', 'tipo_display', 'fecha_inicio', 'fecha_fin']