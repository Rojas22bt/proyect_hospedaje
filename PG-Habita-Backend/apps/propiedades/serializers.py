from rest_framework import serializers
from .models import Propiedades


class PropiedadesSerializer(serializers.ModelSerializer):
    caracteristicas = serializers.ListField(
        child=serializers.ChoiceField(choices=Propiedades.CARACTERISTICAS),
        required=False,
        default=list,
        allow_empty=True
    )

    esta_disponible = serializers.ReadOnlyField()
    tiene_ubicacion = serializers.SerializerMethodField()

    class Meta:
        model = Propiedades
        fields = [
            'id', 'nombre', 'descripcion', 'precio_noche', 'status',
            'descuento', 'tipo', 'caracteristicas',
            'cant_bath', 'cant_hab', 'max_huespedes', 'pets',
            'estado_baja', 'fecha_baja_inicio', 'fecha_baja_fin', 'motivo_baja',
            'esta_disponible', 'user', 'creado_en', 'actualizado_en',
            'latitud', 'longitud', 'direccion_completa', 'ciudad', 'provincia', 'pais',
            'es_destino_turistico', 'tiene_ubicacion', 'departamento'
        ]
        read_only_fields = ['user', 'creado_en', 'actualizado_en', 'esta_disponible']
        extra_kwargs = {
            'direccion_completa': {'required': True},
            'nombre': {'required': True},
            'descripcion': {'required': True},
            'tipo': {'required': True},
            # Campos opcionales
            'latitud': {'required': False, 'allow_null': True},
            'longitud': {'required': False, 'allow_null': True},
            'ciudad': {'required': False, 'allow_blank': True},
            'provincia': {'required': False, 'allow_blank': True},
            'departamento': {'required': False, 'allow_blank': True},
            'pais': {'required': False, 'allow_blank': True},
            'es_destino_turistico': {'required': False},
        }

    def get_tiene_ubicacion(self, obj):
        return obj.latitud is not None and obj.longitud is not None

    def validate_caracteristicas(self, value):
        """Validar que las características sean válidas"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Las características deben ser una lista")

        # Validar que cada característica esté en las opciones permitidas
        valid_caracteristicas = [choice[0] for choice in Propiedades.CARACTERISTICAS]
        for caracteristica in value:
            if caracteristica not in valid_caracteristicas:
                raise serializers.ValidationError(
                    f"Característica '{caracteristica}' no es válida. "
                    f"Opciones válidas: {valid_caracteristicas}"
                )
        return value

    def validate_latitud(self, value):
        if value is not None:
            if not (-90 <= float(value) <= 90):
                raise serializers.ValidationError("La latitud debe estar entre -90 y 90")
        return value

    def validate_longitud(self, value):
        if value is not None:
            if not (-180 <= float(value) <= 180):
                raise serializers.ValidationError("La longitud debe estar entre -180 y 180")
        return value

    def create(self, validated_data):
        print("🔨 CREANDO PROPIEDAD CON DATOS:")
        print(f"   Nombre: {validated_data.get('nombre')}")
        print(f"   Tipo: {validated_data.get('tipo')}")
        print(f"   Características: {validated_data.get('caracteristicas', [])}")
        print(f"   Latitud: {validated_data.get('latitud')}")
        print(f"   Longitud: {validated_data.get('longitud')}")
        print(f"   Dirección: {validated_data.get('direccion_completa')}")

        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DarBajaPropiedadSerializer(serializers.Serializer):
    tipo_baja = serializers.ChoiceField(
        choices=[('temporal', 'Baja Temporal'), ('indefinida', 'Baja Indefinida')]
    )
    fecha_baja_fin = serializers.DateField(required=False)
    motivo_baja = serializers.CharField(max_length=200, required=False)