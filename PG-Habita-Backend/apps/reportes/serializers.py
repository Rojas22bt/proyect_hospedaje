from rest_framework import serializers
from .models import ReporteGuardado, ReporteGenerado


class ReporteGuardadoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = ReporteGuardado
        fields = [
            'id', 'nombre', 'descripcion', 'tipo_reporte', 
            'configuracion', 'usuario', 'usuario_nombre',
            'es_publico', 'creado_en', 'actualizado_en'
        ]
        read_only_fields = ['usuario', 'creado_en', 'actualizado_en']


class ReporteGeneradoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    reporte_base_nombre = serializers.CharField(source='reporte_base.nombre', read_only=True)
    
    class Meta:
        model = ReporteGenerado
        fields = [
            'id', 'reporte_base', 'reporte_base_nombre', 'usuario', 
            'usuario_nombre', 'tipo_reporte', 'configuracion_usada',
            'parametros_filtro', 'prompt_ia', 'respuesta_ia',
            'resultado_resumen', 'formato_exportado', 'tiempo_generacion',
            'creado_en'
        ]
        read_only_fields = ['usuario', 'creado_en']


class GenerarReporteDinamicoSerializer(serializers.Serializer):
    """Serializer para generar reportes dinámicos"""
    tipo_reporte = serializers.ChoiceField(choices=[
        ('reservas', 'Reservas'),
        ('propiedades', 'Propiedades'),
        ('usuarios', 'Usuarios'),
        ('ingresos', 'Ingresos'),
        ('facturas', 'Facturas'),
        ('ocupacion', 'Ocupación'),
    ])
    campos_seleccionados = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Lista de campos a incluir en el reporte"
    )
    filtros = serializers.DictField(
        required=False,
        help_text="Filtros a aplicar (fecha_inicio, fecha_fin, estado, etc.)"
    )
    agrupacion = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="Campo por el cual agrupar (mes, semana, propiedad, usuario, etc.)"
    )
    ordenamiento = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text="Campo por el cual ordenar"
    )
    limite = serializers.IntegerField(
        required=False,
        default=100,
        help_text="Límite de registros"
    )
    incluir_estadisticas = serializers.BooleanField(
        required=False,
        default=True,
        help_text="Incluir estadísticas calculadas"
    )
    incluir_graficos = serializers.BooleanField(
        required=False,
        default=True,
        help_text="Incluir datos para gráficos"
    )


class ReporteIASerializer(serializers.Serializer):
    """Serializer para generar reportes mediante IA"""
    prompt = serializers.CharField(
        help_text="Descripción en lenguaje natural del reporte deseado"
    )
    contexto_adicional = serializers.CharField(
        required=False,
        help_text="Información adicional para el contexto"
    )
