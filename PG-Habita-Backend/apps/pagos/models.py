from django.db import models
from apps.usuarios.models import CustomUser as User

class MetodoPago(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=[('tarjeta', 'Tarjeta'), ('qr', 'QR')])
    stripe_id = models.CharField(max_length=100, blank=True)  # Para Stripe
    qr_imagen = models.ImageField(upload_to='qrs/', blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.tipo}"