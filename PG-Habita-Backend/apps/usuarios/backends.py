from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

CustomUser = get_user_model()

class EmailOrUsernameOrPhoneBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        try:
            # Intenta autenticar con correo (username_field)
            user = CustomUser.objects.get(Q(correo__iexact=username))
            if user.check_password(password):
                return user
        except CustomUser.DoesNotExist:
            pass

        # Fallback a username o N_Cel si lo necesitas (opcional)
        try:
            user = CustomUser.objects.get(Q(username__iexact=username) | Q(N_Cel__iexact=username))
            if user.check_password(password):
                return user
        except CustomUser.DoesNotExist:
            return None

        return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None