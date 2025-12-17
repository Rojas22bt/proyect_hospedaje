from django.urls import path
from . import views

urlpatterns = [
    path('reservas/', views.reportes_reservas, name='reportes_reservas'),
    path('meta/', views.reportes_meta, name='reportes_meta'),
    path('dinamico/generar/', views.generar_reporte_dinamico, name='generar_reporte_dinamico'),
    path('dinamico/exportar/', views.exportar_reporte, name='exportar_reporte'),
    path('ia/', views.generar_reporte_por_ia, name='generar_reporte_por_ia'),
]