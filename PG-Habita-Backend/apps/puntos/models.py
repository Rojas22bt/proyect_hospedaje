from django.db import models
from apps.usuarios.models import CustomUser as User

class Puntos(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    saldo = models.PositiveIntegerField(default=0)  # Saldo actual de puntos
    total_acumulado = models.PositiveIntegerField(default=0)  # Total histórico
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Puntos de {self.usuario.username}: {self.saldo}"

    def agregar_puntos(self, cantidad):
        self.saldo += cantidad
        self.total_acumulado += cantidad
        self.save()

    def restar_puntos(self, cantidad):
        if self.saldo >= cantidad:
            self.saldo -= cantidad
            self.save()
            return True
        return False