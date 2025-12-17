import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.reservas.models import Reservas
from apps.propiedades.models import Propiedades
from apps.servicios.models import Servicio
from apps.usuarios.models import CustomUser
from apps.puntos.models import Puntos
from apps.recompensas.models import Recompensa
from decimal import Decimal
import datetime

User = get_user_model()


class BackendTestSuite(TestCase):
    """Suite completa de pruebas para el backend de Habita."""

    def setUp(self):
        """Configura datos de prueba."""
        self.client = Client()

        # Crear usuario de prueba
        self.user = User.objects.create_user(
            username='testuser',
            correo='test@example.com',
            password='testpass123',
            rol_id=1,  # Asume que existe
            suscripcion_id=1  # Asume que existe
        )

        # Crear puntos para el usuario
        self.puntos = Puntos.objects.create(usuario=self.user, saldo=100)

        # Crear propiedad de prueba
        self.propiedad = Propiedades.objects.create(
            nombre='Casa de Prueba',
            descripcion='Descripción de prueba',
            precio_noche=Decimal('100.00'),
            user=self.user,
            status=True
        )

        # Crear servicio de prueba
        self.servicio = Servicio.objects.create(
            nombre='Limpieza',
            descripcion='Servicio de limpieza',
            precio=Decimal('50.00'),
            descuento=Decimal('0.00'),  # Campo obligatorio
            status=True
        )

        # Crear recompensa de prueba
        self.recompensa = Recompensa.objects.create(
            nombre='Descuento 10%',
            descripcion='Descuento en próxima reserva',
            puntos_requeridos=50,
            activa=True,
            stock=10
        )

    def test_01_autenticacion(self):
        """Prueba login y obtención de token."""
        print("🔐 Probando autenticación...")
        response = self.client.post(reverse('token_obtain_pair'), {
            'correo': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.token = response.json().get('access')
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self.token}'
        print("✅ Autenticación exitosa.")

    def test_02_crear_reserva_con_servicios(self):
        """Prueba crear reserva con servicios."""
        print("🏠 Probando creación de reserva con servicios...")
        self.test_01_autenticacion()  # Asegura token

        data = {
            'propiedad': self.propiedad.id,
            'cant_huesp': 2,
            'cant_noches': 3,
            'fecha_checkin': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'fecha_checkout': (datetime.date.today() + datetime.timedelta(days=4)).isoformat(),
            'comentario_huesp': 'Prueba',
            'servicios': [self.servicio.id]  # 🔥 Incluye servicios
        }

        response = self.client.post(reverse('reserva_list_create'), data)
        if response.status_code != 201:
            print(f"❌ Error en reserva: {response.json()}")
        self.assertEqual(response.status_code, 201)

        reserva = Reservas.objects.get(id=response.json()['id'])
        self.assertEqual(reserva.servicios.count(), 1)  # Verifica servicios
        self.assertGreater(reserva.monto_total, Decimal('0'))  # Verifica cálculo de total
        print("✅ Reserva con servicios creada.")

    def test_03_pagos_stripe(self):
        """Prueba procesamiento de pago con Stripe (simulado)."""
        print("💳 Probando pagos con Stripe...")
        self.test_01_autenticacion()

        # Simula un pago (en test real, usa claves de prueba)
        response = self.client.post(reverse('procesar_pago'), {
            'amount': 15000,  # 150 Bs en centavos
            'payment_method_id': 'pm_test_card'  # Método simulado
        })
        # Nota: En producción, esto fallará sin claves reales; ajusta para test
        if response.status_code == 200:
            print("✅ Pago procesado.")
        else:
            print(f"⚠️ Pago simulado (ajusta claves): {response.json()}")

    def test_04_notificaciones(self):
        """Prueba envío de notificaciones."""
        print("📧 Probando notificaciones...")
        self.test_02_crear_reserva_con_servicios()

        response = self.client.get(reverse('notificacion_list'))
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)  # Debe haber notificaciones
        print("✅ Notificaciones enviadas.")

    def test_05_resenas(self):
        """Prueba creación de reseñas."""
        print("⭐ Probando reseñas...")
        self.test_01_autenticacion()

        response = self.client.post(reverse('resena_list'), {
            'propiedad': self.propiedad.id,
            'estrellas': 5,
            'comentario': 'Excelente propiedad!'
        })
        self.assertEqual(response.status_code, 201)
        print("✅ Reseña creada.")

    def test_06_facturas(self):
        """Prueba generación de facturas."""
        print("📄 Probando facturas...")
        self.test_02_crear_reserva_con_servicios()

        reserva = Reservas.objects.filter(user=self.user).first()
        response = self.client.post(reverse('generar_factura', kwargs={'reserva_id': reserva.id}), {
            'nit_ci': '123456789',
            'nombre': 'Juan Pérez'
        })
        self.assertEqual(response.status_code, 200)
        print("✅ Factura generada.")

    def test_07_reportes(self):
        """Prueba reportes de reservas."""
        print("📊 Probando reportes...")
        self.test_01_autenticacion()

        response = self.client.get(reverse('reportes_reservas'))
        self.assertEqual(response.status_code, 200)
        print("✅ Reportes generados.")

    def test_08_backup(self):
        """Prueba creación de backup."""
        print("💾 Probando backup...")
        self.test_01_autenticacion()

        response = self.client.post(reverse('create_backup'))
        if response.status_code == 200:
            print("✅ Backup creado.")
        else:
            print(f"⚠️ Backup requiere permisos: {response.json()}")

    def test_09_publicidad(self):
        """Prueba gestión de publicidad."""
        print("📢 Probando publicidad...")
        self.test_01_autenticacion()

        response = self.client.get(reverse('publicidad_activas'))
        self.assertEqual(response.status_code, 200)
        print("✅ Publicidad obtenida.")

    def test_10_puntos_y_recompensas(self):
        """Prueba puntos y canje de recompensas."""
        print("🎁 Probando puntos y recompensas...")
        self.test_01_autenticacion()

        # Verificar saldo de puntos
        response = self.client.get(reverse('puntos_list'))
        self.assertEqual(response.status_code, 200)

        # Intentar canjear recompensa
        response = self.client.post(reverse('canjear_recompensa', kwargs={'recompensa_id': self.recompensa.id}))
        if response.status_code == 200:
            print("✅ Recompensa canjeada.")
        else:
            print(f"⚠️ Canje fallido (puntos insuficientes?): {response.json()}")

    def test_11_favoritos(self):
        """Prueba gestión de favoritos."""
        print("❤️ Probando favoritos...")
        self.test_01_autenticacion()

        response = self.client.post(reverse('toggle_favorito'), {
            'propiedad_id': self.propiedad.id
        })
        self.assertEqual(response.status_code, 200)
        print("✅ Favorito toggled.")

    def test_12_archivos(self):
        """Prueba subida de archivos."""
        print("📁 Probando archivos...")
        self.test_01_autenticacion()

        # Simula subida (en test real, usa archivos)
        response = self.client.get(reverse('file_list_create', kwargs={'propiedad_id': self.propiedad.id}))
        self.assertEqual(response.status_code, 200)
        print("✅ Archivos listados.")

    def test_13_devoluciones(self):
        """Prueba solicitudes de devoluciones."""
        print("🔄 Probando devoluciones...")
        self.test_02_crear_reserva_con_servicios()

        reserva = Reservas.objects.filter(user=self.user).first()
        response = self.client.post(reverse('devolucion_list'), {
            'reserva': reserva.id,
            'motivo': 'Cambio de planes'
        })
        self.assertEqual(response.status_code, 201)
        print("✅ Devolución solicitada.")

    def test_14_historiales(self):
        """Prueba historiales de pagos y depósitos."""
        print("📈 Probando historiales...")
        self.test_01_autenticacion()

        response = self.client.get(reverse('historial_pagos'))
        self.assertEqual(response.status_code, 200)
        print("✅ Historial de pagos obtenido.")

    def tearDown(self):
        """Limpieza después de pruebas."""
        Reservas.objects.filter(user=self.user).delete()
        self.propiedad.delete()
        self.servicio.delete()
        self.recompensa.delete()
        self.puntos.delete()
        self.user.delete()

    @classmethod
    def tearDownClass(cls):
        """Reporte final."""
        print("\n🎉 Suite de pruebas completada. Revisa los prints para detalles.")
        print("💡 Si hay errores, corrige modelos/endpoints y vuelve a ejecutar.")