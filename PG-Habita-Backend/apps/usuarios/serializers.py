from rest_framework import serializers
from .models import CustomUser
from apps.roles.models import Rol
from apps.suscripciones.models import Suscripciones
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']


class SuscripcionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscripciones
        fields = ['id', 'nombre', 'descripcion', 'precio_mensual', 'status', 'precio_semestral', 'precio_anual',
                  'precio_total']


class CustomUserSerializer(serializers.ModelSerializer):
    rol = RolSerializer(read_only=True)
    suscripcion = SuscripcionesSerializer(read_only=True)

    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        source='rol',
        write_only=True,
        required=True
    )

    suscripcion_id = serializers.PrimaryKeyRelatedField(
        queryset=Suscripciones.objects.all(),
        source='suscripcion',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'correo', 'first_name', 'last_name',
            'N_Cel', 'fecha_Nac', 'rol', 'rol_id', 'suscripcion', 'suscripcion_id',
            'is_active', 'is_staff', 'last_login', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        print("🔍 Datos recibidos en create:", validated_data)

        # Extraer campos relacionados
        rol = validated_data.pop('rol')
        suscripcion = validated_data.pop('suscripcion', None)

        user = CustomUser.objects.create_user(
            correo=validated_data['correo'],
            username=validated_data.get('username', validated_data['correo']),
            password=validated_data.get('password', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            N_Cel=validated_data.get('N_Cel', ''),
            fecha_Nac=validated_data.get('fecha_Nac', None),
            rol=rol,
            suscripcion=suscripcion,
        )
        print(f"✅ Usuario creado: {user.username}, Suscripción: {user.suscripcion}")
        return user

    def update(self, instance, validated_data):
        print("🔍 Datos recibidos en update:", validated_data)

        rol = validated_data.pop('rol', None)
        suscripcion = validated_data.pop('suscripcion', None)

        instance.username = validated_data.get('username', instance.username)
        instance.correo = validated_data.get('correo', instance.correo)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.N_Cel = validated_data.get('N_Cel', instance.N_Cel)
        instance.fecha_Nac = validated_data.get('fecha_Nac', instance.fecha_Nac)

        # Actualizar rol si se proporcionó
        if rol is not None:
            instance.rol = rol

        # Actualizar suscripción si se proporcionó
        if suscripcion is not None:
            instance.suscripcion = suscripcion
        elif 'suscripcion' in validated_data:  # Para limpiar la suscripción
            instance.suscripcion = None

        # SOLO ACTUALIZAR PASSWORD SI SE PROPORCIONA Y NO ESTÁ VACÍO
        password = validated_data.get('password')
        print(f"🔑 Password recibido: '{password}'")
        print(f"🔑 Tipo de password: {type(password)}")
        print(f"🔑 Password está vacío?: {not password or password.strip() == ''}")

        if password and password.strip() != '':
            print(f"🔄 Actualizando contraseña para usuario: {instance.username}")
            instance.set_password(password)
        else:
            print("⏭️  Manteniendo contraseña actual - NO se actualizará")

        instance.save()
        print(f"✅ Usuario actualizado: {instance.username}")
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    correo = serializers.EmailField(label=_("Correo electrónico"))
    password = serializers.CharField(
        label=_("Contraseña"),
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def validate(self, attrs):
        correo = attrs.get('correo')
        password = attrs.get('password')

        if correo and password:
            user = authenticate(request=self.context.get('request'), username=correo, password=password)
            if not user:
                raise serializers.ValidationError(
                    _("Credenciales inválidas. Verifique su correo y contraseña."),
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                _("Debe proporcionar un correo y una contraseña."),
                code='authorization'
            )

        attrs['user'] = user
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # ✅ AGREGAR INFORMACIÓN PERSONALIZADA AL TOKEN
        token['username'] = user.username
        token['email'] = user.correo
        token['first_name'] = user.first_name or ''
        token['last_name'] = user.last_name or ''
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser

        # ✅ INCLUIR PERMISOS EN EL TOKEN - ESTO ES LO MÁS IMPORTANTE
        if hasattr(user, 'rol') and user.rol:
            # Obtener todos los permisos del rol del usuario
            permisos = user.rol.permisos.all()
            token['permisos'] = [permiso.nombre for permiso in permisos]
            token['rol'] = user.rol.nombre
            print(f"✅ Token generado con permisos: {token['permisos']}")
        else:
            # Si no tiene rol, asignar permisos vacíos
            token['permisos'] = []
            token['rol'] = 'CLIENT'
            print("⚠️  Usuario sin rol asignado, permisos vacíos")

        return token

    username_field = 'correo'