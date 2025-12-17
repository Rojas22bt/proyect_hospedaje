from django.db import models
from apps.usuarios.models import CustomUser as User

class Notificacion(models.Model):
    TIPOS_NOTIFICACION = [
        ('reserva_creada', 'Nueva Reserva'),
        ('reserva_confirmada', 'Reserva Confirmada'),
        ('reserva_aceptada', 'Reserva Aceptada'),
        ('reserva_cancelada', 'Reserva Cancelada'),
        ('reserva_rechazada', 'Reserva Rechazada'),
        ('reserva_completada', 'Reserva Completada'),
        ('recordatorio_checkin', 'Recordatorio de Check-in'),
        ('recordatorio_checkout', 'Recordatorio de Check-out'),
        ('recordatorio_resena', 'Recordatorio de Reseña'),
        ('pago_recibido', 'Pago Recibido'),
        ('pago_fallido', 'Pago Fallido'),
        ('pago_reembolsado', 'Pago Reembolsado'),
        ('sistema', 'Mensaje del Sistema'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=50, choices=TIPOS_NOTIFICACION)
    reserva = models.ForeignKey(
        'reservas.Reservas',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    leida = models.BooleanField(default=False)
    enviada = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notificaciones'
        ordering = ['-creado_en']

    def __str__(self):
        return f"Notificación para {self.usuario.username}: {self.titulo}"