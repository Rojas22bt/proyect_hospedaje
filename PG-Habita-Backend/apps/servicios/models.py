from django.db import models

class Servicio(models.Model):
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=200)
    fecha_Creacion = models.DateField(auto_now_add=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.BooleanField()
    descuento = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nombre

