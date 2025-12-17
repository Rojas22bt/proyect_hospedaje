from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.usuarios.models import CustomUser as User
from apps.propiedades.models import Propiedades
from apps.servicios.models import Servicio  # 🔥 AGREGADO: Import para servicios

class Reservas(models.Model):
    ESTADOS_RESERVA = [
        ('pendiente', 'Pendiente'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    ]

    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('reembolsado', 'Reembolsado'),
        ('fallido', 'Fallido'),
    ]

    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    cant_huesp = models.PositiveIntegerField()
    cant_noches = models.PositiveIntegerField()
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comentario_huesp = models.CharField(max_length=120, blank=True, null=True)
    fecha_checkin = models.DateField()
    fecha_checkout = models.DateField()
    status = models.CharField(max_length=20, choices=ESTADOS_RESERVA, default='pendiente')
    pago_estado = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='pendiente')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    propiedad = models.ForeignKey(Propiedades, on_delete=models.CASCADE)
    servicios = models.ManyToManyField(Servicio, blank=True, related_name='reservas')  # 🔥 AGREGADO: Servicios opcionales
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reservas'
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-creado_en']

    def __str__(self):
        return f"Reserva #{self.id} - {self.user.username}"

    @property
    def host(self):
        return self.propiedad.user

    def clean(self):
        errors = {}

        # Validación de fechas básicas
        if self.fecha_checkin and self.fecha_checkout:
            if self.fecha_checkout <= self.fecha_checkin:
                errors['fecha_checkout'] = 'La fecha de checkout debe ser posterior al checkin'

            if self.fecha_checkin < timezone.now().date():
                errors['fecha_checkin'] = 'No se pueden crear reservas en fechas pasadas'

        # Validación de solapamiento MEJORADA
        if self.fecha_checkin and self.fecha_checkout and self.propiedad:
            reservas_solapadas = Reservas.objects.filter(
                propiedad=self.propiedad,
                fecha_checkin__lt=self.fecha_checkout,
                fecha_checkout__gt=self.fecha_checkin
            ).exclude(status__in=['cancelada', 'rechazada'])

            # Excluir la reserva actual si es una actualización
            if self.pk:
                reservas_solapadas = reservas_solapadas.exclude(pk=self.pk)

            if reservas_solapadas.exists():
                errors['__all__'] = 'Ya existe una reserva activa en estas fechas para esta propiedad'

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        es_nuevo = self._state.adding
        estado_anterior = None
        pago_estado_anterior = None

        if not es_nuevo:
            try:
                reserva_anterior = Reservas.objects.get(pk=self.pk)
                estado_anterior = reserva_anterior.status
                pago_estado_anterior = reserva_anterior.pago_estado
            except Reservas.DoesNotExist:
                pass

        self.clean()
        super().save(*args, **kwargs)

        try:
            from apps.notificaciones.services import NotificacionService

            if es_nuevo:
                self.notificar_nueva_reserva()
            else:
                # Notificar cambios de estado
                if estado_anterior and estado_anterior != self.status:
                    self.notificar_cambio_estado(estado_anterior)

                # Notificar cambios en estado de pago
                if pago_estado_anterior and pago_estado_anterior != self.pago_estado:
                    self.notificar_cambio_pago(pago_estado_anterior)

        except ImportError as e:
            print(f"⚠️ Error enviando notificaciones: {e}")

    # 🔥 AGREGADO: Método para calcular total con servicios
    def calcular_total(self):
        total = self.monto_total
        for servicio in self.servicios.all():
            total += servicio.precio
        return total

    def notificar_nueva_reserva(self):
        """Notificar creación de nueva reserva"""
        try:
            from apps.notificaciones.services import NotificacionService
            NotificacionService.notificar_reserva_creada(self)
            print(f"✅ Notificaciones enviadas para nueva reserva #{self.id}")
        except Exception as e:
            print(f"⚠️ Error enviando notificaciones de nueva reserva: {e}")

    def notificar_cambio_estado(self, estado_anterior):
        """Notificar cambios de estado importantes"""
        try:
            from apps.notificaciones.services import NotificacionService

            if self.status == 'confirmada' and estado_anterior != 'confirmada':
                NotificacionService.notificar_reserva_confirmada(self)

            elif self.status == 'aceptada' and estado_anterior != 'aceptada':
                NotificacionService.notificar_reserva_aceptada(self)

            elif self.status == 'cancelada' and estado_anterior != 'cancelada':
                # Determinar quién canceló (lógica simplificada)
                cancelado_por_anfitrion = True  # Aquí podrías agregar lógica más compleja
                NotificacionService.notificar_reserva_cancelada(self, cancelado_por_anfitrion)

            elif self.status == 'rechazada' and estado_anterior != 'rechazada':
                NotificacionService.notificar_reserva_rechazada(self)

            elif self.status == 'completada' and estado_anterior != 'completada':
                NotificacionService.notificar_reserva_completada(self)

            print(f"✅ Notificación de estado enviada para reserva #{self.id}: {estado_anterior} → {self.status}")

        except Exception as e:
            print(f"⚠️ Error enviando notificaciones de estado: {e}")

    def notificar_cambio_pago(self, pago_estado_anterior):
        """Notificar cambios en estado de pago"""
        try:
            from apps.notificaciones.services import NotificacionService

            if self.pago_estado == 'pagado' and pago_estado_anterior != 'pagado':
                NotificacionService.notificar_pago_recibido(self)

            elif self.pago_estado == 'fallido' and pago_estado_anterior != 'fallido':
                NotificacionService.notificar_pago_fallido(self)

            print(
                f"✅ Notificación de pago enviada para reserva #{self.id}: {pago_estado_anterior} → {self.pago_estado}")

        except Exception as e:
            print(f"⚠️ Error enviando notificaciones de pago: {e}")