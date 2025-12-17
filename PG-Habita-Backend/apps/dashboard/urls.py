from django.urls import path
from .views import DashboardEstadisticasView

urlpatterns = [
    path('estadisticas/', DashboardEstadisticasView.as_view(), name='dashboard_estadisticas'),
]