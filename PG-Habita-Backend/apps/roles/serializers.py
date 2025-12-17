from rest_framework import serializers
from .models import Rol
from apps.permisos.serializers import permisosSerializer


class RolSerializer(serializers.ModelSerializer):
    permisos = permisosSerializer(many=True, read_only=True)
    permisos_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion', 'permisos', 'permisos_ids']

    def create(self, validated_data):
        permisos_ids = validated_data.pop('permisos_ids', [])
        rol = Rol.objects.create(**validated_data)

        if permisos_ids:
            rol.permisos.set(permisos_ids)

        return rol

    def update(self, instance, validated_data):
        permisos_ids = validated_data.pop('permisos_ids', None)

        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()


        if permisos_ids is not None:
            instance.permisos.set(permisos_ids)

        return instance