from rest_framework import serializers
from django.utils import timezone
from apps.propiedades.serializers import PropiedadesSerializer
from apps.usuarios.serializers import CustomUserSerializer
from apps.servicios.serializers import ServiciosSerializer
from .models import Reservas
from apps.servicios.models import Servicio

class ReservaDetalleSerializer(serializers.ModelSerializer):
    usuario_info = CustomUserSerializer(source='user', read_only=True)
    propiedad_info = PropiedadesSerializer(source='propiedad', read_only=True)
    servicios_info = ServiciosSerializer(source='servicios', many=True, read_only=True)
    total_noches = serializers.SerializerMethodField()
    esta_activa = serializers.SerializerMethodField()

    class Meta:
        model = Reservas
        fields = [
            'id', 'monto_total', 'cant_huesp', 'cant_noches', 'descuento',
            'comentario_huesp', 'fecha_checkin', 'fecha_checkout', 'status',
            'pago_estado', 'creado_en', 'actualizado_en',
            'usuario_info', 'propiedad_info', 'servicios_info', 'total_noches', 'esta_activa'
        ]
        read_only_fields = ['creado_en', 'actualizado_en']

    def get_total_noches(self, obj):
        if obj.fecha_checkin and obj.fecha_checkout:
            return (obj.fecha_checkout - obj.fecha_checkin).days
        return 0

    def get_esta_activa(self, obj):
        return obj.status in ['pendiente', 'aceptada', 'confirmada']

class ReservasSerializer(serializers.ModelSerializer):
    propiedad_nombre = serializers.CharField(source='propiedad.nombre', read_only=True)
    propiedad_direccion = serializers.CharField(source='propiedad.direccion_completa', read_only=True)
    propiedad_tipo = serializers.CharField(source='propiedad.tipo', read_only=True)
    propiedad_precio_noche = serializers.DecimalField(
        source='propiedad.precio_noche',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    usuario_nombre = serializers.CharField(source='user.get_full_name', read_only=True)
    usuario_correo = serializers.CharField(source='user.correo', read_only=True)
    usuario_telefono = serializers.CharField(source='user.N_Cel', read_only=True)

    host_nombre = serializers.CharField(source='host.get_full_name', read_only=True)
    host_correo = serializers.CharField(source='host.correo', read_only=True)
    host_telefono = serializers.CharField(source='host.N_Cel', read_only=True)

    usuario_info = CustomUserSerializer(source='user', read_only=True)
    propiedad_info = PropiedadesSerializer(source='propiedad', read_only=True)
    servicios = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(),
        many=True,
        required=False,
        allow_empty=True
    )


    class Meta:
        model = Reservas
        fields = [
            'id', 'monto_total', 'cant_huesp', 'cant_noches', 'descuento',
            'comentario_huesp', 'fecha_checkin', 'fecha_checkout', 'status',
            'pago_estado', 'user', 'propiedad', 'servicios', 'creado_en', 'actualizado_en',
            'propiedad_nombre', 'propiedad_direccion', 'propiedad_tipo', 'propiedad_precio_noche',
            'usuario_nombre', 'usuario_correo', 'usuario_telefono',
            'host_nombre', 'host_correo', 'host_telefono',
            'usuario_info', 'propiedad_info'
        ]
        read_only_fields = ['creado_en', 'actualizado_en', 'user','monto_total']

    def validate(self, data):
        fecha_checkin = data.get('fecha_checkin')
        fecha_checkout = data.get('fecha_checkout')
        propiedad = data.get('propiedad')
        instance = getattr(self, 'instance', None)

        if fecha_checkin and fecha_checkout:
            if fecha_checkout <= fecha_checkin:
                raise serializers.ValidationError({"fecha_checkout": "La fecha de checkout debe ser posterior al checkin"})
            if fecha_checkin < timezone.now().date():
                raise serializers.ValidationError({"fecha_checkin": "No se pueden crear reservas en fechas pasadas"})
            if propiedad:
                reservas_solapadas = Reservas.objects.filter(
                    propiedad=propiedad,
                    fecha_checkin__lt=fecha_checkout,
                    fecha_checkout__gt=fecha_checkin
                ).exclude(status__in=['cancelada', 'rechazada'])
                if instance:
                    reservas_solapadas = reservas_solapadas.exclude(pk=instance.pk)
                if reservas_solapadas.exists():
                    raise serializers.ValidationError({"fechas": "Ya existe una reserva activa en estas fechas para esta propiedad"})
        return data

    def create(self, validated_data):
        servicios = validated_data.pop('servicios', [])
        cant_noches = validated_data.get('cant_noches', 0)
        propiedad = validated_data.get('propiedad')
        precio_noche = propiedad.precio_noche if propiedad else 0
        costo_servicios = sum(servicio.precio for servicio in servicios)
        validated_data['monto_total'] = (cant_noches * precio_noche) + costo_servicios

        reserva = super().create(validated_data)
        reserva.servicios.set(servicios)
        # No necesitas recalcular aquí, ya está en validated_data
        return reserva

    def update(self, instance, validated_data):
        servicios = validated_data.pop('servicios', None)
        reserva = super().update(instance, validated_data)
        if servicios is not None:
            reserva.servicios.set(servicios)
            reserva.monto_total = reserva.calcular_total()
            reserva.save()
        return reserva