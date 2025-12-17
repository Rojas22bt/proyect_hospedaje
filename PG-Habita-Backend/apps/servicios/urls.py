from django.urls import path

from apps.servicios.views import ServicioList, ServicioCUD

urlpatterns = [
    path('',ServicioList.as_view(),name = 'list_reservas'),
    path('<int:pk>',ServicioCUD.as_view(),name='cud_reservas'),
]