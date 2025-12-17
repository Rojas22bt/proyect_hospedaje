from django.urls import path
from .views import PermisosList,PermisosCUD


urlpatterns = [
    path('',PermisosList.as_view(),name='permisosList'),
    path('permisos/<int:pk>/',PermisosCUD.as_view(),name='permisosCUD'),
]