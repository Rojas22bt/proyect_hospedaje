from django.db import models
from apps.usuarios.models import CustomUser as User
from apps.reservas.models import Reservas

class Factura(models.Model):
    reserva = models.OneToOneField(Reservas, on_delete=models.CASCADE)
    nit_ci = models.CharField(max_length=20)  # NIT o CI
    nombre = models.CharField(max_length=100)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    enviada = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Factura #{self.id} - {self.reserva}"