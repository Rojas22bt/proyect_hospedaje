from django.urls import path
from . import views

urlpatterns = [
    path('favoritos/', views.listar_favoritos, name='listar_favoritos'),
    path('favoritos/toggle/', views.toggle_favorito, name='toggle_favorito'),
]