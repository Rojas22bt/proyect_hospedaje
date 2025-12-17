from django.db import models
from decimal import Decimal

class Suscripciones(models.Model):
    STATUS_OPCIONES = [
        ('Activa', 'Activa'),
        ('Inactiva', 'Inactiva'),
    ]
    DURACION_OPCIONES = [
        ('Mensual', 'Mensual'),
        ('Semestral', 'Semestral'),
        ('Anual', 'Anual'),
    ]


    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    precio_mensual = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_OPCIONES, default='Activa')
    duracion = models.CharField(max_length=10, choices=DURACION_OPCIONES, default='Mensual')

    def __str__(self):
        return self.nombre

    @property
    def precio_semestral(self):
        """Calcula el precio semestral con un 15% de descuento."""
        return (self.precio_mensual * Decimal('6')) * Decimal('0.85')

    @property
    def precio_anual(self):
        """Calcula el precio anual con un 30% de descuento."""
        return (self.precio_mensual * Decimal('12')) * Decimal('0.70')

    @property
    def precio_total(self):
        """Devuelve el precio final dependiendo de la duración elegida."""
        if self.duracion == 'Mensual':
            return self.precio_mensual
        elif self.duracion == 'Semestral':
            return self.precio_semestral
        elif self.duracion == 'Anual':
            return self.precio_anual
        return self.precio_mensual