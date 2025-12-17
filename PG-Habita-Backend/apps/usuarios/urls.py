from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView  # 🔥 IMPORTAR

from .views import CustomUserList, CustomUserCUD, UserProfileView, CustomTokenObtainPairView, \
    register_user  # 🔥 CORREGIDO

urlpatterns = [
    # Rutas de usuarios
    path('', CustomUserList.as_view(), name='userList'),
    path('<int:pk>/', CustomUserCUD.as_view(), name='userCUD'),
    path('me/', UserProfileView.as_view(), name='user_profile'),

    # Autenticación
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register_user')
]