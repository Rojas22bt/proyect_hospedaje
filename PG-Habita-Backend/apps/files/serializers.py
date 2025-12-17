# apps/files/serializers.py
from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id', 'propiedad', 'archivo', 'archivo_url',
            'nombre_archivo', 'tipo_archivo', 'fecha_subida', 'es_principal'
        ]
        read_only_fields = ['nombre_archivo', 'tipo_archivo', 'fecha_subida']

    def get_archivo_url(self, obj):
        request = self.context.get('request')
        if obj.archivo and request:
            return request.build_absolute_uri(obj.archivo.url)
        return obj.archivo_url


class FileUploadSerializer(serializers.Serializer):
    archivos = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False),
        max_length=10  # Máximo 10 archivos por lote
    )
    propiedad_id = serializers.IntegerField()
    es_principal = serializers.BooleanField(default=False)