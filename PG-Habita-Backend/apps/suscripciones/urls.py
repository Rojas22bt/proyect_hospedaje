from django.urls import path
from .views import SuscripcionesList,SuscripcionesCUD


urlpatterns = [
    path('',SuscripcionesList.as_view(),name='suscripcionesList'),
    path('suscripciones/<int:pk>/',SuscripcionesCUD.as_view(),name='suscripcionesCUD'),
]