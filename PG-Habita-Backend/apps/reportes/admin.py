from django.contrib import admin

from .models import ReporteGuardado, ReporteGenerado


@admin.register(ReporteGuardado)
class ReporteGuardadoAdmin(admin.ModelAdmin):
	list_display = ('id', 'nombre', 'tipo_reporte', 'usuario', 'es_publico', 'creado_en')
	list_filter = ('tipo_reporte', 'es_publico', 'creado_en')
	search_fields = ('nombre', 'descripcion', 'usuario__username', 'usuario__correo')


@admin.register(ReporteGenerado)
class ReporteGeneradoAdmin(admin.ModelAdmin):
	list_display = ('id', 'tipo_reporte', 'usuario', 'formato_exportado', 'tiempo_generacion', 'creado_en')
	list_filter = ('tipo_reporte', 'formato_exportado', 'creado_en')
	search_fields = ('usuario__username', 'usuario__correo', 'prompt_ia')
