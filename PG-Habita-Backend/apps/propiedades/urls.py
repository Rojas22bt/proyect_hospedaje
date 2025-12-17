from django.urls import path
from .views import PropiedadesList, PropiedadesCUD, PropiedadesPublicList
from . import views

urlpatterns = [
    path('',PropiedadesList.as_view(), name='propiedadesList'),
    path('<int:pk>/',PropiedadesCUD.as_view(), name='propiedadesCUD'),
    path('public/', PropiedadesPublicList.as_view(), name='propiedades_public'),
    path('<int:pk>/dar-baja/', views.dar_baja_propiedad, name='propiedades_dar_baja'),
    path('<int:pk>/reactivar/', views.reactivar_propiedad, name='propiedades_reactivar'),
    path('geocodificar/', views.geocodificar_direccion, name='geocodificar_direccion'),
    path('<int:pk>/actualizar-ubicacion/', views.actualizar_ubicacion_propiedad, name='actualizar_ubicacion'),
    path('<int:pk>/obtener-ubicacion/', views.obtener_ubicacion_propiedad, name='obtener_ubicacion'),

]