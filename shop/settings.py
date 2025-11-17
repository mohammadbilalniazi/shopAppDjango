import os
from pathlib import Path
import django_heroku

# ---------------------------
# Base Directory
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# Security
# ---------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-default-key")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = [
    "domain.com",
    "domain.herokuapp.com",
    "sub.example.com",
    "localhost",
    "127.0.0.1",
]

# ---------------------------
# Media / Static
# ---------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / "static"]

# Whitenoise configuration - ignore missing source maps
WHITENOISE_MANIFEST_STRICT = False  # Don't fail on missing files like .map files

# ---------------------------
# Installed Apps
# ---------------------------
INSTALLED_APPS = [
    # Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Project apps
    'product', 'expenditure', 'bill', 'user', 'configuration','asset',

    # Third-party
    'rest_framework', 'corsheaders', 'jalali_date',
]

# ---------------------------
# Middleware
# ---------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'shop.urls'

# ---------------------------
# Templates
# ---------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',  # needed for serializers
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'common.context_processors.organizations_processor',  # Global organizations
            ],
        },
    },
]

WSGI_APPLICATION = 'shop.wsgi.application'

# ---------------------------
# Database
# ---------------------------
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': os.getenv('MYSQL_DB', 'shirkat_original_test'),
#         'USER': os.getenv('MYSQL_USER', 'root'),
#         'PASSWORD': os.getenv('MYSQL_PASSWORD', ''),
#         'HOST': os.getenv('MYSQL_HOST', 'localhost'),
#         'PORT': os.getenv('MYSQL_PORT', '3306'),
#     }
# }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'supermarket',
        'USER': 'postgres',
        'PASSWORD': 'Allahisone',
        'HOST': 'localhost',    # or IP if remote
        'PORT': '5432',         # default port
    }
}
# ---------------------------
# Password Validators
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# Internationalization
# ---------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kabul'
USE_I18N = True
USE_TZ = True

# ---------------------------
# CORS
# ---------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:8000",
]

# ---------------------------
# Email
# ---------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "app280201596@heroku.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "nimhauur0474")

# ---------------------------
# Jalali Date Defaults
# ---------------------------
JALALI_DATE_DEFAULTS = {
    'Strftime': {'date': '%y-%m-%d', 'datetime': '%H:%M:%S _ %y-%m-%d'},
    'Static': {
        'js': ['admin/js/django_jalali.min.js'],
        'css': {'all': ['admin/jquery.ui.datepicker.jalali/themes/base/jquery-ui.min.css']},
    },
}

# ---------------------------
# Default Auto Field
# ---------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------------------------
# Heroku
# ---------------------------
# Configure django-heroku but override staticfiles storage
django_heroku.settings(locals())

# Override the staticfiles storage set by django_heroku to avoid missing .map file errors
# Use CompressedStaticFilesStorage instead of CompressedManifestStaticFilesStorage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# OR if you want to keep manifest but ignore missing files:
# WHITENOISE_MANIFEST_STRICT = False
