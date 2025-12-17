from rest_framework import permissions, status
from rest_framework.decorators import permission_classes, api_view
from rest_framework.response import Response
from .models import Favoritos
from .serializers import MarcarFavoritoSerializer, FavoritoSerializer
from apps.propiedades.models import Propiedades

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorito(request):
    serializer = MarcarFavoritoSerializer(data=request.data)
    if serializer.is_valid():
        propiedad_id = serializer.validated_data['propiedad_id']
        try:
            propiedad = Propiedades.objects.get(id=propiedad_id, status=True)
        except Propiedades.DoesNotExist:
            return Response({'error': 'Propiedad no encontrada'}, status=404)
        favorito_existente = Favoritos.objects.filter(usuario=request.user, propiedad=propiedad).first()
        if favorito_existente:
            favorito_existente.delete()
            return Response({'accion': 'eliminado', 'es_favorito': False})
        else:
            Favoritos.objects.create(usuario=request.user, propiedad=propiedad)
            return Response({'accion': 'agregado', 'es_favorito': True})
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def listar_favoritos(request):
    favoritos = Favoritos.objects.filter(usuario=request.user).select_related('propiedad')
    serializer = FavoritoSerializer(favoritos, many=True)
    return Response(serializer.data)