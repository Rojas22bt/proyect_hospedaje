from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.roles.models import Rol
from apps.suscripciones.models import Suscripciones


class CustomUser(AbstractUser):

    correo = models.EmailField(unique=True, blank=True)
    N_Cel = models.CharField(max_length=15, unique=True,  blank=True)
    fecha_Nac = models.DateField(null=True, blank=True)
    rol = models.ForeignKey(
        'roles.Rol',
        on_delete=models.CASCADE,
        related_name='usuarios'
    )
    suscripcion = models.ForeignKey(
        Suscripciones,  
        on_delete=models.SET_NULL,  # O models.CASCADE
        related_name='usuarios',
        null=True,
        blank=True
    )
    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = [ 'username']

    def __str__(self):
        return self.username or self.correo or "Usuario sin nombre"
