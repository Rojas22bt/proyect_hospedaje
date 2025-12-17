from django.db import models
from apps.usuarios.models import CustomUser


class Bitacora(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    accion = models.CharField(max_length=255)
    modulo = models.CharField(max_length=100)
    detalles = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bitacora'
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.usuario.username} - {self.accion} - {self.creado_en}"