from django.contrib import admin
from .models import Rol, CustomUser
from apps.permisos.models import Permisos  # Puedes eliminar esta importación si no la usas en otro lado


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    filter_horizontal = ('permisos',)  # Permite gestionar la relación muchos a muchos




@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'correo', 'rol')
    # Opcional: para permitir editar el rol directamente en el admin
    fieldsets = (
        (None, {'fields': ('username', 'correo', 'password', 'rol')}),
    )
