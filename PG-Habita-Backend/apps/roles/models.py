from django.db import models
from ..permisos.models import Permisos


class Rol(models.Model):
    nombre = models.CharField(max_length=20,unique=True)
    descripcion = models.TextField(blank=True)
    permisos = models.ManyToManyField(Permisos,related_name='roles')

    def __str__(self):
        return self.nombre
