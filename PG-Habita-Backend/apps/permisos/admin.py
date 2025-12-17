from django.contrib import admin
from .models import Permisos
@admin.register(Permisos)
class PermisosAdmin(admin.ModelAdmin):
    list_display = ['id', 'descripcion', 'nombre']