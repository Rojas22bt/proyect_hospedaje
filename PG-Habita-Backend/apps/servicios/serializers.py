from rest_framework import serializers
from .models import *

class ServiciosSerializer(serializers.ModelSerializer):
    class Meta: model = Servicio
    fields = '__all__'