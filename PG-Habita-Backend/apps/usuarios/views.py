from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes, api_view

from .models import CustomUser
from .serializers import CustomUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from apps.permisos.permissions import HasPermission


class CustomUserList(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [HasPermission]
    permission_codename = 'ver_usuarios'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.exclude(is_superuser=True)


class CustomUserCUD(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [HasPermission]
    permission_codename = 'cud_usuario'

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.exclude(is_superuser=True)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Vista pública para registro de nuevos usuarios
    """
    try:
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            # Crear el usuario
            user = serializer.save()

            # Puedes agregar lógica adicional aquí:
            # - Asignar rol por defecto (Client)
            # - Asignar suscripción básica
            # - Enviar email de confirmación

            return Response({
                'message': 'Usuario registrado exitosamente',
                'user_id': user.id,
                'username': user.username,
                'correo': user.correo
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': 'Error en el registro',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)