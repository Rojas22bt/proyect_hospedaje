from django.urls import path
from .views import FacturaList, FacturaCUD, GenerarFactura

urlpatterns = [
    path('', FacturaList.as_view(), name='factura_list'),
    path('<int:pk>/', FacturaCUD.as_view(), name='factura_detail'),
    path('generar/<int:reserva_id>/', GenerarFactura.as_view(), name='generar_factura'),
]