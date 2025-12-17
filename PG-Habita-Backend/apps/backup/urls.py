from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.backup_database, name='create_backup'),
    path('list/', views.list_backups, name='list_backups'),
    path('download/<str:filename>/', views.download_backup, name='download_backup'),
    path('delete/<str:filename>/', views.delete_backup, name='delete_backup'),
    path('status/', views.backup_status, name='backup_status'),
    path('restore/', views.restore_backup, name='restore_backup'),
]