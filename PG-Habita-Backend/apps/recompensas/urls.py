from django.urls import path
from .views import RecompensaList, RecompensaCUD, CanjearRecompensa

urlpatterns = [
    path('', RecompensaList.as_view(), name='recompensa_list'),
    path('<int:pk>/', RecompensaCUD.as_view(), name='recompensa_detail'),
    path('<int:recompensa_id>/canjear/', CanjearRecompensa.as_view(), name='canjear_recompensa'),
]