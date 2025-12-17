from django.db import models
from ..usuarios.models import CustomUser as User


class Propiedades(models.Model):
    nombre = models.CharField(max_length=20)
    descripcion = models.TextField(max_length=200)

    TIPO = [
        ('Departamento', 'Departamento'),
        ('Casa', 'Casa'),
        ('Cabaña','Cabaña')
    ]

    CARACTERISTICAS = [
        # Comodidades Básicas
        ('wifi', 'WiFi'),
        ('aire_acondicionado', 'Aire Acondicionado'),
        ('calefaccion', 'Calefacción'),
        ('cocina', 'Cocina Equipada'),
        ('tv', 'Televisión'),
        ('lavadora', 'Lavadora'),

        # Espacios Exteriores
        ('piscina', 'Piscina'),
        ('jardin', 'Jardín'),
        ('terraza', 'Terraza'),
        ('parrilla', 'Parrilla/Barbacoa'),
        ('estacionamiento', 'Estacionamiento Gratuito'),


        # Seguridad
        ('caja_fuerte', 'Caja Fuerte'),
        ('vigilancia', 'Vigilancia 24h'),
        ('extintor', 'Extintor'),

        # Accesibilidad
        ('accesible_silla_ruedas', 'Accesible Silla de Ruedas'),
        ('ascensor', 'Ascensor'),
    ]

    ESTADO_BAJA = [
        ('activa', 'Activa'),
        ('baja_temporal', 'Baja Temporal'),
        ('baja_indefinida', 'Baja Indefinida'),
    ]

    tipo = models.CharField(max_length=20, choices=TIPO, default='Casa')
    caracteristicas = models.JSONField(
        default=list,
        help_text="Lista de características de la propiedad"
    )
    status = models.BooleanField(default=True)
    precio_noche = models.FloatField(default=0)
    cant_bath = models.IntegerField(default=0)
    cant_hab = models.IntegerField(default=0)
    descuento = models.FloatField(default=0)
    max_huespedes = models.PositiveIntegerField(default=1)
    pets = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    latitud = models.FloatField(
        null=True,
        blank=True,
        help_text="Latitud de la propiedad"
    )
    longitud = models.FloatField(
        null=True,
        blank=True,
        help_text="Longitud de la propiedad"
    )
    direccion_completa = models.TextField(
        max_length=200,
        blank=False,
        help_text="Dirección completa formateada"
    )
    ciudad = models.CharField(max_length=50, blank=True)
    provincia = models.CharField(max_length=50, blank=True)
    pais = models.CharField(max_length=50, default='Bolivia')
    departamento = models.CharField(max_length=50, blank=True)
    es_destino_turistico = models.BooleanField(default=False)

    estado_baja = models.CharField(
        max_length=20,
        choices=ESTADO_BAJA,
        default='activa'
    )
    fecha_baja_inicio = models.DateField(null=True, blank=True)
    fecha_baja_fin = models.DateField(null=True, blank=True)
    motivo_baja = models.TextField(max_length=200, blank=True)

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def esta_disponible(self):
        """Propiedad computada que considera tanto status como estado_baja"""
        return self.status and self.estado_baja == 'activa'


    @property
    def imagen_principal(self):
        try:
            return self.files.filter(es_principal=True).first()
        except:
            return None

    @property
    def todas_imagenes(self):
        return self.files.all()

    def __str__(self):
        return self.nombre