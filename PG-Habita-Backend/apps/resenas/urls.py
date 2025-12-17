from django.urls import path
from .views import ResenaList, ResenaCUD

urlpatterns = [
    path('', ResenaList.as_view(), name='resena_list'),
    path('<int:pk>/', ResenaCUD.as_view(), name='resena_detail'),
]