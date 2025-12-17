from django.db import transaction
from django.utils import timezone
from .models import Notificacion
from apps.reservas.models import Reservas

class NotificacionService:

    @staticmethod
    def notificar_reserva_creada(reserva: Reservas):
        """Notificar al anfitrión y huésped sobre nueva reserva"""
        with transaction.atomic():
            # Notificar al ANFITRIÓN
            titulo_anfitrion = "🎉 ¡Nueva Reserva Recibida!"
            mensaje_anfitrion = (
                f"Tienes una nueva reserva para tu propiedad '{reserva.propiedad.nombre}'. "
                f"El huésped {reserva.user.get_full_name() or reserva.user.username} "
                f"ha reservado desde {reserva.fecha_checkin} hasta {reserva.fecha_checkout}. "
                f"Total: ${reserva.monto_total}. "
                f"Por favor, confirma o rechaza la reserva pronto."
            )

            Notificacion.objects.create(
                usuario=reserva.propiedad.user,  # Anfitrión
                titulo=titulo_anfitrion,
                mensaje=mensaje_anfitrion,
                tipo='reserva_creada',
                reserva=reserva
            )

            # Notificar al HUÉSPED
            titulo_huesped = "✅ Reserva Solicitada"
            mensaje_huesped = (
                f"Tu solicitud de reserva en '{reserva.propiedad.nombre}' ha sido enviada. "
                f"Fechas: {reserva.fecha_checkin} a {reserva.fecha_checkout}. "
                f"Total: ${reserva.monto_total}. "
                f"El anfitrión ha sido notificado y confirmará tu reserva pronto."
            )

            Notificacion.objects.create(
                usuario=reserva.user,  # Huésped
                titulo=titulo_huesped,
                mensaje=mensaje_huesped,
                tipo='reserva_creada',
                reserva=reserva
            )

        print(f"📧 NOTIFICACIONES ENVIADAS: Reserva #{reserva.id}")
        print(f"   → Anfitrión: {reserva.propiedad.user.username}")
        print(f"   → Huésped: {reserva.user.username}")

    @staticmethod
    def notificar_reserva_confirmada(reserva: Reservas):
        """Notificar confirmación de reserva"""
        with transaction.atomic():
            # Notificar al HUÉSPED
            titulo_huesped = "🎊 ¡Reserva Confirmada!"
            mensaje_huesped = (
                f"¡Buenas noticias! Tu reserva en '{reserva.propiedad.nombre}' "
                f"ha sido confirmada por el anfitrión. "
                f"Prepárate para tu estadía del {reserva.fecha_checkin} al {reserva.fecha_checkout}. "
                f"Contacta al anfitrión si necesitas información adicional."
            )

            Notificacion.objects.create(
                usuario=reserva.user,
                titulo=titulo_huesped,
                mensaje=mensaje_huesped,
                tipo='reserva_confirmada',
                reserva=reserva
            )

            # Notificar al ANFITRIÓN
            titulo_anfitrion = "✅ Reserva Confirmada"
            mensaje_anfitrion = (
                f"Has confirmado la reserva de {reserva.user.get_full_name() or reserva.user.username} "
                f"en '{reserva.propiedad.nombre}'. "
                f"Fechas: {reserva.fecha_checkin} a {reserva.fecha_checkout}. "
                f"El huésped ha sido notificado."
            )

            Notificacion.objects.create(
                usuario=reserva.propiedad.user,
                titulo=titulo_anfitrion,
                mensaje=mensaje_anfitrion,
                tipo='reserva_confirmada',
                reserva=reserva
            )

    @staticmethod
    def notificar_reserva_aceptada(reserva: Reservas):
        """Notificar aceptación de reserva (similar a confirmada)"""
        NotificacionService.notificar_reserva_confirmada(reserva)

    @staticmethod
    def notificar_reserva_cancelada(reserva: Reservas, cancelado_por_anfitrion: bool = False):
        """Notificar cancelación de reserva"""
        if cancelado_por_anfitrion:
            # Anfitrión canceló - notificar HUÉSPED
            titulo = "⚠️ Reserva Cancelada por Anfitrión"
            mensaje = (
                f"El anfitrión ha cancelado tu reserva en '{reserva.propiedad.nombre}'. "
                f"Fechas afectadas: {reserva.fecha_checkin} a {reserva.fecha_checkout}. "
                f"Si ya realizaste el pago, recibirás un reembolso según las políticas de cancelación."
            )
            usuario = reserva.user
        else:
            # Huésped canceló - notificar ANFITRIÓN
            titulo = "❌ Reserva Cancelada por Huésped"
            mensaje = (
                f"El huésped {reserva.user.get_full_name() or reserva.user.username} "
                f"ha cancelado la reserva en '{reserva.propiedad.nombre}'. "
                f"Fechas liberadas: {reserva.fecha_checkin} a {reserva.fecha_checkout}."
            )
            usuario = reserva.propiedad.user

        Notificacion.objects.create(
            usuario=usuario,
            titulo=titulo,
            mensaje=mensaje,
            tipo='reserva_cancelada',
            reserva=reserva
        )

    @staticmethod
    def notificar_reserva_rechazada(reserva: Reservas):
        """Notificar rechazo de reserva"""
        titulo_huesped = "❌ Reserva Rechazada"
        mensaje_huesped = (
            f"Lamentablemente, tu reserva en '{reserva.propiedad.nombre}' "
            f"para las fechas {reserva.fecha_checkin} a {reserva.fecha_checkout} "
            f"ha sido rechazada por el anfitrión. "
            f"Puedes buscar otras propiedades disponibles."
        )

        Notificacion.objects.create(
            usuario=reserva.user,
            titulo=titulo_huesped,
            mensaje=mensaje_huesped,
            tipo='reserva_rechazada',  # 🔥 NUEVO TIPO ESPECÍFICO
            reserva=reserva
        )

    @staticmethod
    def notificar_pago_recibido(reserva: Reservas):
        """Notificar pago recibido a ambos"""
        with transaction.atomic():
            # Notificar ANFITRIÓN
            titulo_anfitrion = "💰 Pago Recibido"
            mensaje_anfitrion = (
                f"Se ha recibido el pago de ${reserva.monto_total} por la reserva "
                f"de {reserva.user.get_full_name() or reserva.user.username} "
                f"en '{reserva.propiedad.nombre}'. "
                f"La reserva está completamente confirmada."
            )

            Notificacion.objects.create(
                usuario=reserva.propiedad.user,
                titulo=titulo_anfitrion,
                mensaje=mensaje_anfitrion,
                tipo='pago_recibido',
                reserva=reserva
            )

            # Notificar HUÉSPED
            titulo_huesped = "✅ Pago Confirmado"
            mensaje_huesped = (
                f"Tu pago de ${reserva.monto_total} para la reserva en "
                f"'{reserva.propiedad.nombre}' ha sido confirmado. "
                f"¡Todo listo para tu estadía!"
            )

            Notificacion.objects.create(
                usuario=reserva.user,
                titulo=titulo_huesped,
                mensaje=mensaje_huesped,
                tipo='pago_recibido',
                reserva=reserva
            )

    @staticmethod
    def notificar_pago_fallido(reserva: Reservas):
        """Notificar pago fallido al huésped"""
        titulo_huesped = "❌ Pago Fallido"
        mensaje_huesped = (
            f"El pago para tu reserva en '{reserva.propiedad.nombre}' ha fallado. "
            f"Por favor, verifica tu método de pago e inténtalo nuevamente. "
            f"Tu reserva permanecerá pendiente hasta que se complete el pago."
        )

        Notificacion.objects.create(
            usuario=reserva.user,
            titulo=titulo_huesped,
            mensaje=mensaje_huesped,
            tipo='pago_fallido',
            reserva=reserva
        )

    @staticmethod
    def notificar_recordatorio_checkin(reserva: Reservas):
        """Notificar recordatorio de check-in"""
        titulo_huesped = "🔔 Recordatorio: Check-in Mañana"
        mensaje_huesped = (
            f"¡Tu check-in en '{reserva.propiedad.nombre}' es mañana! "
            f"Recuerda que tu reserva comienza el {reserva.fecha_checkin}. "
            f"Prepárate para una excelente estadía."
        )

        Notificacion.objects.create(
            usuario=reserva.user,
            titulo=titulo_huesped,
            mensaje=mensaje_huesped,
            tipo='recordatorio_checkin',
            reserva=reserva
        )

    @staticmethod
    def notificar_reserva_completada(reserva: Reservas):
        """Notificar finalización de reserva"""
        with transaction.atomic():
            # Notificar ANFITRIÓN
            titulo_anfitrion = "🏠 Reserva Completada"
            mensaje_anfitrion = (
                f"La reserva de {reserva.user.get_full_name() or reserva.user.username} "
                f"en '{reserva.propiedad.nombre}' ha finalizado. "
                f"Fechas: {reserva.fecha_checkin} a {reserva.fecha_checkout}. "
                f"¡Esperamos que haya sido una buena experiencia!"
            )

            Notificacion.objects.create(
                usuario=reserva.propiedad.user,
                titulo=titulo_anfitrion,
                mensaje=mensaje_anfitrion,
                tipo='sistema',
                reserva=reserva
            )

            # Notificar HUÉSPED
            titulo_huesped = "🌟 Estadía Completada"
            mensaje_huesped = (
                f"¡Esperamos que hayas disfrutado tu estadía en '{reserva.propiedad.nombre}'! "
                f"Tu reserva del {reserva.fecha_checkin} al {reserva.fecha_checkout} ha finalizado. "
                f"¿Te gustaría dejar una reseña sobre tu experiencia?"
            )

            Notificacion.objects.create(
                usuario=reserva.user,
                titulo=titulo_huesped,
                mensaje=mensaje_huesped,
                tipo='recordatorio_resena',
                reserva=reserva
            )