from django.db import models
from apps.usuarios.models import CustomUser as User

class ReporteGuardado(models.Model):
    """Modelo para guardar configuraciones de reportes personalizados"""
    
    TIPO_REPORTE_CHOICES = [
        ('reservas', 'Reservas'),
        ('propiedades', 'Propiedades'),
        ('usuarios', 'Usuarios'),
        ('ingresos', 'Ingresos'),
        ('facturas', 'Facturas'),
        ('ocupacion', 'Ocupación'),
        ('personalizado', 'Personalizado'),
    ]
    
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    tipo_reporte = models.CharField(max_length=20, choices=TIPO_REPORTE_CHOICES)
    configuracion = models.JSONField(
        default=dict,
        help_text="Configuración del reporte: campos seleccionados, filtros, etc."
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reportes_guardados')
    es_publico = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reportes_guardados'
        ordering = ['-creado_en']
        verbose_name = 'Reporte Guardado'
        verbose_name_plural = 'Reportes Guardados'

    def __str__(self):
        return f"{self.nombre} - {self.usuario.username}"


class ReporteGenerado(models.Model):
    """Historial de reportes generados"""
    
    FORMATO_CHOICES = [
        ('json', 'JSON'),
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
        ('excel', 'Excel'),
    ]
    
    reporte_base = models.ForeignKey(
        ReporteGuardado, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='generaciones'
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reportes_generados')
    tipo_reporte = models.CharField(max_length=20)
    configuracion_usada = models.JSONField(default=dict)
    parametros_filtro = models.JSONField(default=dict)
    prompt_ia = models.TextField(blank=True, help_text="Prompt usado si fue generado por IA")
    respuesta_ia = models.TextField(blank=True, help_text="Respuesta de IA si aplica")
    resultado_resumen = models.JSONField(default=dict, help_text="Resumen de los resultados")
    formato_exportado = models.CharField(max_length=10, choices=FORMATO_CHOICES, default='json')
    tiempo_generacion = models.FloatField(default=0, help_text="Tiempo en segundos")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reportes_generados'
        ordering = ['-creado_en']
        verbose_name = 'Reporte Generado'
        verbose_name_plural = 'Reportes Generados'

    def __str__(self):
        return f"Reporte {self.tipo_reporte} - {self.creado_en.strftime('%Y-%m-%d %H:%M')}"
