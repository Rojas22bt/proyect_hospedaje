from django.urls import path
from . import views

urlpatterns = [
    path('reservas/', views.reportes_reservas, name='reportes_reservas'),
]