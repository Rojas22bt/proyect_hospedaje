from django.urls import path
from . import views

urlpatterns = [
    # Listar y crear archivos para una propiedad
    path('propiedades/<int:propiedad_id>/', views.FileListCreateView.as_view(), name='file_list_create'),

    # Obtener archivos de una propiedad específica
    path('propiedades/<int:propiedad_id>/archivos/', views.get_files_by_propiedad, name='files_by_propiedad'),

    # Obtener todos los archivos (solo admin)
    path('', views.get_all_files, name='all_files'),

    # Subida múltiple de archivos
    path('upload-multiple/', views.upload_multiple_files, name='upload_multiple'),

    # Establecer imagen como principal
    path('<int:file_id>/set-principal/', views.set_principal_image, name='set_principal'),

    # Eliminar archivo
    path('<int:file_id>/', views.delete_file, name='delete_file'),

    # Detalle de archivo (opcional)
    path('<int:file_id>/detail/', views.FileDetailView.as_view(), name='file-detail'),
]