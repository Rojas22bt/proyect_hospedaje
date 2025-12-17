from rest_framework import serializers

from apps.permisos.models import Permisos


class permisosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permisos
        fields = ['id','nombre','descripcion']
