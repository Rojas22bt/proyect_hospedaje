from django.db import models
from apps.usuarios.models import CustomUser as User
from apps.propiedades.models import Propiedades

class Favoritos(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    propiedad = models.ForeignKey(Propiedades, on_delete=models.CASCADE)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'propiedad']
        verbose_name_plural = 'Favoritos'

    def __str__(self):
        return f"{self.usuario.username} - {self.propiedad.nombre}"