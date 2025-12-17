# apps/plan/models.py
from django.db import models
from django.utils import timezone
from apps.suscripciones.models import Suscripciones
from apps.usuarios.models import CustomUser
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta

class Plan(models.Model):
    DURACION_OPCIONES = [
        ('Mensual', 'Mensual'),
        ('Semestral', 'Semestral'),
        ('Anual', 'Anual'),
    ]

    usuario = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='planes'
    )
    suscripcion = models.ForeignKey(
        Suscripciones,
        on_delete=models.CASCADE,
        related_name='planes'
    )

    fecha_inicio = models.DateField(default=date.today)
    duracion = models.CharField(max_length=10, choices=DURACION_OPCIONES)

    def __str__(self):
        return f'{self.usuario.username} - {self.suscripcion.nombre}'

    @property
    def fecha_final(self):
        """Calcula la fecha de finalización basada en la duración."""
        if self.fecha_inicio and self.duracion:
            if self.duracion == 'Mensual':
                return self.fecha_inicio + relativedelta(months=1)
            elif self.duracion == 'Semestral':
                return self.fecha_inicio + relativedelta(months=6)
            elif self.duracion == 'Anual':
                return self.fecha_inicio + relativedelta(years=1)
        return None