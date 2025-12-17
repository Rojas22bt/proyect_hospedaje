from django.db import models
from apps.usuarios.models import CustomUser as User

class Recompensa(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    puntos_requeridos = models.PositiveIntegerField()  # Puntos para canjear
    activa = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)  # Cantidad disponible
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recompensa: {self.nombre} ({self.puntos_requeridos} puntos)"

class Canje(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    recompensa = models.ForeignKey(Recompensa, on_delete=models.CASCADE)
    puntos_usados = models.PositiveIntegerField()
    fecha_canje = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Canje de {self.usuario.username}: {self.recompensa.nombre}"