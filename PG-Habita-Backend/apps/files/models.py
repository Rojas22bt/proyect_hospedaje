from django.db import models
from apps.usuarios.models import CustomUser as User
from apps.propiedades.models import Propiedades

class File(models.Model):
    propiedad = models.ForeignKey(
        Propiedades,
        on_delete=models.CASCADE,
        related_name='files'
    )
    archivo = models.ImageField(
        upload_to='propiedades/%Y/%m/%d/',
        max_length=255
    )
    nombre_archivo = models.CharField(max_length=255, blank=True)
    tipo_archivo = models.CharField(max_length=50, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    es_principal = models.BooleanField(default=False)

    class Meta:
        db_table = 'files'
        ordering = ['-es_principal', '-fecha_subida']

    def save(self, *args, **kwargs):
        if not self.nombre_archivo:
            self.nombre_archivo = self.archivo.name
        if not self.tipo_archivo:
            self.tipo_archivo = self.archivo.name.split('.')[-1].lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.propiedad.nombre} - {self.nombre_archivo}"

    @property
    def archivo_url(self):
        if self.archivo:
            return self.archivo.url
        return None