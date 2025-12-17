from django.urls import path
from .views import PuntosList, PuntosCUD

urlpatterns = [
    path('', PuntosList.as_view(), name='puntos_list'),
    path('<int:pk>/', PuntosCUD.as_view(), name='puntos_detail'),
]