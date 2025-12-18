from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar .env
if os.path.exists(os.path.join(BASE_DIR, '.env')):
    load_dotenv()

# Configuración principal
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')

# Configurar cache para geocodificación
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'apps.roles',
    'apps.usuarios',
    'apps.permisos',
    'apps.suscripciones',
    'apps.planes',
    'apps.propiedades',
    'apps.reservas',
    'apps.servicios',
    'apps.notificaciones',
    'apps.favoritos',
    'apps.backup',
    'apps.reportes',
    'apps.bitacora',
    'apps.ads',
    'apps.files',
    'apps.resenas',
    'apps.facturas',
    'apps.pagos',
    'apps.historiales',
    'apps.devoluciones',
    'apps.puntos',
    'apps.recompensas',
    'apps.test',  # Para el script de pruebas
]

AUTH_USER_MODEL = 'usuarios.CustomUser'
AUTHENTICATION_BACKENDS = [
    'apps.usuarios.backends.EmailOrUsernameOrPhoneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.bitacora.middleware.BitacoraMiddleware',
]

ROOT_URLCONF = 'Habita_Backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Habita_Backend.wsgi.application'

# Configuración de base de datos
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            engine='django.db.backends.postgresql'
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'SERP'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

CORS_ALLOWED_ORIGINS = [
    "https://projectshost.netlify.app",
    "https://habita.up.railway.app",
    "https://habitaback-production.up.railway.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_ALL_ORIGINS = True  # ✅ Solo en desarrollo

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configuración para archivos subidos
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

ALLOWED_HOSTS = [
    'habitaback-production.up.railway.app',
    'localhost',
    '127.0.0.1',
    '.railway.app'
]

CSRF_TRUSTED_ORIGINS = [
    'https://projectshost.netlify.app',
    'https://*.railway.app',
    'https://habitaback-production.up.railway.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

#  CONFIGURACIÓN DE STRIPE
STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY', 'pk_test_51SCRdLIaylyQlFPb6KTL67pwkELRwFVlsGAeCBTewpnZcK9vJ6GN8FsUSwWmRxb8DvpWMCMz0KDkaOFWMICmH5be00nFuxpq7K')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'pk_test_51SCRdLIaylyQlFPb6KTL67pwkELRwFVlsGAeCBTewpnZcK9vJ6GN8FsUSwWmRxb8DvpWMCMz0KDkaOFWMICmH5be00nFuxpq7K')
