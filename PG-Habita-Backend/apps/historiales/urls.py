from django.urls import path
from .views import HistorialPagos, HistorialDepositos

urlpatterns = [
    path('pagos/', HistorialPagos.as_view(), name='historial_pagos'),
    path('depositos/', HistorialDepositos.as_view(), name='historial_depositos'),
]