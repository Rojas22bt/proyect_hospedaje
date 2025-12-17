from django.urls import path
from .views import MetodoPagoList, MetodoPagoCUD, ProcesarPago

urlpatterns = [
    path('', MetodoPagoList.as_view(), name='metodo_pago_list'),
    path('<int:pk>/', MetodoPagoCUD.as_view(), name='metodo_pago_detail'),
    path('procesar/', ProcesarPago.as_view(), name='procesar_pago'),
]