from django.db import models
from apps.usuarios.models import CustomUser as User

class Publicidad(models.Model):
    TIPOS_PUBLICIDAD = [
        ('promocion', 'Promoción'),
        ('anuncio', 'Anuncio'),
        ('aviso', 'Aviso'),
        ('funcionalidad', 'Nueva Funcionalidad'),
    ]

    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    imagen_url = models.CharField(max_length=500, blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPOS_PUBLICIDAD)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    activa = models.BooleanField(default=True)
    creado_por = models.ForeignKey(User, on_delete=models.CASCADE)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'publicidad'
        ordering = ['-creado_en']

    def __str__(self):
        return self.titulo