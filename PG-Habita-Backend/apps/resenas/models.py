from django.db import models
from apps.usuarios.models import CustomUser as User
from apps.propiedades.models import Propiedades
from apps.reservas.models import Reservas

class Resena(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    propiedad = models.ForeignKey(Propiedades, on_delete=models.CASCADE)
    reserva = models.OneToOneField(Reservas, on_delete=models.CASCADE, null=True)
    estrellas = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 estrellas
    comentario = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['usuario', 'propiedad']

    def __str__(self):
        return f"Reseña de {self.usuario.username} - {self.estrellas} estrellas"