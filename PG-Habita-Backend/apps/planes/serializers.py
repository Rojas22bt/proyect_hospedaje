from rest_framework import serializers
from .models import Plan
from apps.suscripciones.serializers import SuscripcionesSerializer
from apps.usuarios.serializers import CustomUserSerializer
from apps.usuarios.models import CustomUser
from apps.suscripciones.models import Suscripciones


class PlanSerializer(serializers.ModelSerializer):
    usuario = CustomUserSerializer(read_only=True)
    suscripcion = SuscripcionesSerializer(read_only=True)


    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        write_only=True,
        source='usuario'
    )
    suscripcion_id = serializers.PrimaryKeyRelatedField(
        queryset=Suscripciones.objects.all(),
        write_only=True,
        source='suscripcion'
    )


    fecha_final = serializers.DateField(read_only=True)

    class Meta:
        model = Plan
        fields = [
            'id',
            'usuario', 'suscripcion',
            'usuario_id', 'suscripcion_id',
            'fecha_inicio', 'duracion', 'fecha_final'
        ]