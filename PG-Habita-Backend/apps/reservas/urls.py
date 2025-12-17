from django.urls import path
from .views import (
    ReservaListCreate,
    ReservaRetrieveUpdateDestroy,
    FechasOcupadasView
)

urlpatterns = [
    # Listar y crear reservas
    path('', ReservaListCreate.as_view(), name='reserva_list_create'),

    # Obtener, actualizar y eliminar reserva específica
    path('<int:pk>/', ReservaRetrieveUpdateDestroy.as_view(), name='reserva_detail'),

    # Obtener fechas ocupadas de una propiedad
    path('fechas-ocupadas/<int:propiedad_id>/', FechasOcupadasView.as_view(), name='fechas_ocupadas'),
]