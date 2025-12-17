from rest_framework import serializers
from apps.propiedades.serializers import PropiedadesSerializer
from .models import Favoritos

class FavoritoSerializer(serializers.ModelSerializer):
    propiedad_info = PropiedadesSerializer(source='propiedad', read_only=True)

    class Meta:
        model = Favoritos
        fields = ['id', 'usuario', 'propiedad', 'propiedad_info', 'creado_en']
        read_only_fields = ['usuario', 'creado_en']

class MarcarFavoritoSerializer(serializers.Serializer):
    propiedad_id = serializers.IntegerField()