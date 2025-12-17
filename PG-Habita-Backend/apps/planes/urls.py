from django.urls import path
from .views import PlanCUD,PlanList


urlpatterns = [
    path('',PlanList.as_view(),name='planList'),
    path('planes/<int:pk>/', PlanCUD.as_view(), name='planCUD')
]