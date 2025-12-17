from django.urls import path
from .views import RolList,RolCUD
from . import views


urlpatterns = [
    path('', views.RolList.as_view(), name='rolesList'),
    path('<int:pk>/', views.RolCUD.as_view(), name='rolCUD'),
]