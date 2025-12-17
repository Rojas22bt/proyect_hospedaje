from django.urls import path
from .views import DevolucionList, DevolucionCUD

urlpatterns = [
    path('', DevolucionList.as_view(), name='devolucion_list'),
    path('<int:pk>/', DevolucionCUD.as_view(), name='devolucion_detail'),
]