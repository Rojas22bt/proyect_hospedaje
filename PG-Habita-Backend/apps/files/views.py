from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer, FileUploadSerializer
from apps.propiedades.models import Propiedades

class FileListCreateView(generics.ListCreateAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        propiedad_id = self.kwargs.get('propiedad_id')
        return File.objects.filter(propiedad_id=propiedad_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        propiedad_id = self.kwargs.get('propiedad_id')
        propiedad = get_object_or_404(Propiedades, id=propiedad_id)
        if propiedad.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("No tienes permisos para esta propiedad")
        serializer.save(propiedad=propiedad)

class FileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = File.objects.all()

    def get_object(self):
        file_id = self.kwargs.get('file_id')
        return get_object_or_404(File, id=file_id)

    def perform_update(self, serializer):
        file_obj = self.get_object()
        if file_obj.propiedad.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("No tienes permisos para esta imagen")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.propiedad.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("No tienes permisos para esta imagen")
        instance.delete()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_all_files(request):
    if not request.user.is_staff:
        return Response({'error': 'No tienes permisos para ver todos los archivos'}, status=status.HTTP_403_FORBIDDEN)
    files = File.objects.all()
    serializer = FileSerializer(files, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_files_by_propiedad(request, propiedad_id):
    try:
        propiedad = Propiedades.objects.get(id=propiedad_id)
        if propiedad.user != request.user and not request.user.is_staff:
            return Response({'error': 'No tienes permisos para ver los archivos de esta propiedad'}, status=status.HTTP_403_FORBIDDEN)
        files = File.objects.filter(propiedad_id=propiedad_id)
        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)
    except Propiedades.DoesNotExist:
        return Response({'error': 'Propiedad no encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_multiple_files(request):
    serializer = FileUploadSerializer(data=request.data)
    if serializer.is_valid():
        try:
            propiedad_id = serializer.validated_data['propiedad_id']
            archivos = request.FILES.getlist('archivos')
            es_principal = serializer.validated_data.get('es_principal', False)
            propiedad = get_object_or_404(Propiedades, id=propiedad_id)
            if propiedad.user != request.user and not request.user.is_staff:
                return Response({'error': 'No tienes permisos para esta propiedad'}, status=status.HTTP_403_FORBIDDEN)
            files_created = []
            with transaction.atomic():
                if es_principal:
                    File.objects.filter(propiedad=propiedad).update(es_principal=False)
                for archivo in archivos:
                    file_obj = File.objects.create(propiedad=propiedad, archivo=archivo, es_principal=es_principal)
                    files_created.append(file_obj)
                    es_principal = False
            response_serializer = FileSerializer(files_created, many=True, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Propiedades.DoesNotExist:
            return Response({'error': 'Propiedad no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Error al subir archivos: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_principal_image(request, file_id):
    try:
        file_obj = File.objects.get(id=file_id)
        if file_obj.propiedad.user != request.user and not request.user.is_staff:
            return Response({'error': 'No tienes permisos para esta imagen'}, status=status.HTTP_403_FORBIDDEN)
        File.objects.filter(propiedad=file_obj.propiedad).update(es_principal=False)
        file_obj.es_principal = True
        file_obj.save()
        serializer = FileSerializer(file_obj, context={'request': request})
        return Response(serializer.data)
    except File.DoesNotExist:
        return Response({'error': 'Archivo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_file(request, file_id):
    try:
        file_obj = File.objects.get(id=file_id)
        if file_obj.propiedad.user != request.user and not request.user.is_staff:
            raise permissions.PermissionDenied("No tienes permisos para eliminar esta imagen")
        file_obj.delete()
        return Response({'message': 'Archivo eliminado correctamente'}, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        return Response({'error': 'Archivo no encontrado'}, status=status.HTTP_404_NOT_FOUND)