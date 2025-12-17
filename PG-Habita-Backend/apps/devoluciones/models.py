from django.db import models
from apps.usuarios.models import CustomUser as User
from apps.reservas.models import Reservas

class Devolucion(models.Model):
    reserva = models.OneToOneField(Reservas, on_delete=models.CASCADE)
    motivo = models.TextField()
    aprobado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Devolución para {self.reserva}"