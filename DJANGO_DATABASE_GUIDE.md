# Complete Django Database Setup Guide for Threat Intelligence App

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Models](#database-models)
4. [Django REST Framework Setup](#django-rest-framework-setup)
5. [Authentication](#authentication)
6. [API Endpoints](#api-endpoints)
7. [Integration with Next.js](#integration-with-nextjs)
8. [Deployment](#deployment)

---

## Prerequisites

### Install Required Software
```bash
# Python (3.9+)
python --version

# pip (Python package manager)
pip --version
```

If you don't have Python installed:
- **Windows/Mac/Linux**: Download from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

---

## Project Setup

### Step 1: Create Django Project Structure

```bash
# Create a new directory for your backend
mkdir threat_intelligence_backend
cd threat_intelligence_backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 2: Install Django and Required Packages

```bash
# Upgrade pip
pip install --upgrade pip

# Install Django and dependencies
pip install Django==4.2.0
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.2.0
pip install python-decouple==3.8
pip install psycopg2-binary==2.9.6  # For PostgreSQL (optional)
pip install pillow==10.0.0  # For image handling
pip install python-dateutil==2.8.2
```

### Step 3: Create Django Project

```bash
# Create a new Django project
django-admin startproject threat_intelligence .

# Create the main app
python manage.py startapp core
```

Your structure should look like:
```
threat_intelligence_backend/
├── venv/
├── threat_intelligence/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── core/
│   ├── migrations/
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── manage.py
└── requirements.txt
```

---

## Database Models

### Step 4: Define Your Models

Edit `core/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class User(models.Model):
    """User account model"""
    user_account = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.user_account.username


class ThreatReport(models.Model):
    """Base model for all threat reports"""
    
    THREAT_TYPE_CHOICES = [
        ('ip', 'IP Address Check'),
        ('url', 'URL Check'),
        ('malware', 'Malware Analysis'),
        ('cyber-threat', 'Cyber Threat'),
    ]
    
    RISK_LEVEL_CHOICES = [
        ('malicious', 'Malicious'),
        ('suspicious', 'Suspicious'),
        ('benign', 'Benign'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='threat_reports')
    threat_type = models.CharField(max_length=20, choices=THREAT_TYPE_CHOICES)
    query = models.CharField(max_length=500)  # IP, URL, hash, etc.
    risk_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES)
    
    # Detailed findings
    findings = models.JSONField(default=dict)  # Stores detailed report data
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # For caching/optimization
    is_flagged = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'threat_reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['threat_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.threat_type}: {self.query} - {self.risk_level}"


class IPReport(models.Model):
    """Detailed IP threat report"""
    threat_report = models.OneToOneField(ThreatReport, on_delete=models.CASCADE, related_name='ip_report')
    ip_address = models.GenericIPAddressField()
    country = models.CharField(max_length=100, blank=True)
    isp = models.CharField(max_length=255, blank=True)
    is_vpn = models.BooleanField(default=False)
    is_proxy = models.BooleanField(default=False)
    abuse_count = models.IntegerField(default=0)
    last_reported = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'ip_reports'
    
    def __str__(self):
        return f"IP: {self.ip_address}"


class URLReport(models.Model):
    """Detailed URL threat report"""
    threat_report = models.OneToOneField(ThreatReport, on_delete=models.CASCADE, related_name='url_report')
    url = models.URLField(max_length=2000)
    domain = models.CharField(max_length=255)
    is_phishing = models.BooleanField(default=False)
    is_malware = models.BooleanField(default=False)
    is_suspicious = models.BooleanField(default=False)
    last_analysis_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'url_reports'
    
    def __str__(self):
        return f"URL: {self.domain}"


class MalwareReport(models.Model):
    """Detailed malware analysis report"""
    threat_report = models.OneToOneField(ThreatReport, on_delete=models.CASCADE, related_name='malware_report')
    file_hash = models.CharField(max_length=128)  # SHA-256
    file_type = models.CharField(max_length=50)
    file_size = models.BigIntegerField(null=True, blank=True)
    detection_count = models.IntegerField(default=0)
    last_analysis_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'malware_reports'
    
    def __str__(self):
        return f"Malware: {self.file_hash[:16]}..."


class CyberThreatReport(models.Model):
    """Detailed cyber threat report"""
    threat_report = models.OneToOneField(ThreatReport, on_delete=models.CASCADE, related_name='cyber_threat_report')
    threat_name = models.CharField(max_length=255)
    threat_category = models.CharField(max_length=100)
    severity = models.CharField(max_length=20)
    affected_systems = models.JSONField(default=list)
    mitigation_steps = models.JSONField(default=list)
    
    class Meta:
        db_table = 'cyber_threat_reports'
    
    def __str__(self):
        return f"Threat: {self.threat_name}"


class ExportedReport(models.Model):
    """Track exported reports for auditing"""
    EXPORT_FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exported_reports')
    threat_report = models.ForeignKey(ThreatReport, on_delete=models.CASCADE, related_name='exports')
    export_format = models.CharField(max_length=20, choices=EXPORT_FORMAT_CHOICES)
    file_path = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'exported_reports'
    
    def __str__(self):
        return f"{self.export_format} export by {self.user} on {self.created_at}"


class CheckHistory(models.Model):
    """Lightweight history tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='check_history')
    threat_report = models.ForeignKey(ThreatReport, on_delete=models.CASCADE)
    accessed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'check_history'
        verbose_name_plural = 'Check Histories'
```

---

## Database Setup

### Step 5: Configure Django Settings

Edit `threat_intelligence/settings.py`:

```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-here')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'threat_intelligence.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'threat_intelligence.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
    # To use PostgreSQL instead, uncomment below and update credentials:
    # 'default': {
    #     'ENGINE': 'django.db.backends.postgresql',
    #     'NAME': config('DB_NAME'),
    #     'USER': config('DB_USER'),
    #     'PASSWORD': config('DB_PASSWORD'),
    #     'HOST': config('DB_HOST'),
    #     'PORT': config('DB_PORT', default='5432'),
    # }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://yourdomain.com',
]

CORS_ALLOW_CREDENTIALS = True
```

### Step 6: Create Migrations and Apply to Database

```bash
# Create migration files from models
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser
# Follow the prompts to enter username, email, and password
```

---

## Django REST Framework Setup

### Step 7: Create Serializers

Create `core/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth.models import User as DjangoUser
from .models import User, ThreatReport, IPReport, URLReport, MalwareReport, CyberThreatReport

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user_account.username', read_only=True)
    email = serializers.CharField(source='user_account.email', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'created_at']


class IPReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPReport
        fields = '__all__'


class URLReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = URLReport
        fields = '__all__'


class MalwareReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MalwareReport
        fields = '__all__'


class CyberThreatReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CyberThreatReport
        fields = '__all__'


class ThreatReportListSerializer(serializers.ModelSerializer):
    """Simple serializer for list views"""
    class Meta:
        model = ThreatReport
        fields = ['id', 'threat_type', 'query', 'risk_score', 'risk_level', 'created_at']


class ThreatReportDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with related reports"""
    ip_report = IPReportSerializer(read_only=True)
    url_report = URLReportSerializer(read_only=True)
    malware_report = MalwareReportSerializer(read_only=True)
    cyber_threat_report = CyberThreatReportSerializer(read_only=True)
    
    class Meta:
        model = ThreatReport
        fields = [
            'id', 'threat_type', 'query', 'risk_score', 'risk_level',
            'findings', 'created_at', 'ip_report', 'url_report',
            'malware_report', 'cyber_threat_report'
        ]


class ThreatReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating threat reports"""
    class Meta:
        model = ThreatReport
        fields = ['threat_type', 'query', 'risk_score', 'risk_level', 'findings']
```

### Step 8: Create Views (API Endpoints)

Create `core/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ThreatReport, User as CustomUser
from .serializers import (
    ThreatReportListSerializer, ThreatReportDetailSerializer,
    ThreatReportCreateSerializer, UserSerializer
)


class ThreatReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CRUD operations on Threat Reports
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return reports for the current user only"""
        try:
            user = CustomUser.objects.get(user_account=self.request.user)
            return ThreatReport.objects.filter(user=user).select_related(
                'ip_report', 'url_report', 'malware_report', 'cyber_threat_report'
            )
        except CustomUser.DoesNotExist:
            return ThreatReport.objects.none()
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return ThreatReportListSerializer
        elif self.action == 'create':
            return ThreatReportCreateSerializer
        return ThreatReportDetailSerializer
    
    def perform_create(self, serializer):
        """Automatically associate report with current user"""
        try:
            user = CustomUser.objects.get(user_account=self.request.user)
            serializer.save(user=user)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get reports grouped by type"""
        threat_type = request.query_params.get('type', None)
        
        queryset = self.get_queryset()
        if threat_type:
            queryset = queryset.filter(threat_type=threat_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics for user's threat reports"""
        queryset = self.get_queryset()
        
        stats = {
            'total_reports': queryset.count(),
            'malicious_count': queryset.filter(risk_level='malicious').count(),
            'suspicious_count': queryset.filter(risk_level='suspicious').count(),
            'benign_count': queryset.filter(risk_level='benign').count(),
            'average_risk_score': queryset.values_list('risk_score', flat=True).aggregate(avg=models.Avg('risk_score'))['avg'] or 0,
            'by_type': {
                'ip': queryset.filter(threat_type='ip').count(),
                'url': queryset.filter(threat_type='url').count(),
                'malware': queryset.filter(threat_type='malware').count(),
                'cyber_threat': queryset.filter(threat_type='cyber-threat').count(),
            }
        }
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def flag(self, request, pk=None):
        """Flag a report for review"""
        report = self.get_object()
        report.is_flagged = not report.is_flagged
        report.save()
        return Response({'is_flagged': report.is_flagged})
    
    @action(detail=False, methods=['delete'])
    def delete_old(self, request):
        """Delete reports older than specified days"""
        from datetime import timedelta
        from django.utils import timezone
        
        days = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() - timedelta(days=days)
        
        deleted_count, _ = self.get_queryset().filter(created_at__lt=cutoff_date).delete()
        return Response({'deleted': deleted_count})


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user profile management"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Return only the current user's profile"""
        return CustomUser.objects.filter(user_account=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        try:
            user = CustomUser.objects.get(user_account=request.user)
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
```

### Step 9: Create URLs

Create `core/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ThreatReportViewSet, UserViewSet

router = DefaultRouter()
router.register(r'reports', ThreatReportViewSet, basename='threat-report')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
```

Update `threat_intelligence/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('api-auth/', include('rest_framework.urls')),
]
```

---

## Authentication

### Step 10: Setup Token Authentication

```bash
# Generate tokens for users in Django shell
python manage.py shell

# In the shell:
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

user = User.objects.get(username='your_username')
token, created = Token.objects.get_or_create(user=user)
print(f'Token: {token.key}')
```

---

## Integration with Next.js

### Step 11: Update Next.js API Routes

Replace your mock API with Django calls. Update `app/api/check-ip/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ip } = await request.json();
    
    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Call Django backend
    const response = await fetch('http://localhost:8000/api/reports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        threat_type: 'ip',
        query: ip,
        risk_score: 45,
        risk_level: 'suspicious',
        findings: {
          country: 'US',
          isp: 'Example ISP',
        },
      }),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Step 12: Update Frontend to Use Django

Update `lib/auth.ts` to get tokens from Django:

```typescript
export async function loginUser(username: string, password: string) {
  const response = await fetch('http://localhost:8000/api-token-auth/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data.token;
  }
  
  throw new Error(data.detail || 'Login failed');
}
```

---

## Running the Application

### Step 13: Start Django Server

```bash
# Make sure you're in the virtual environment
python manage.py runserver

# Server runs at http://localhost:8000
```

### Step 14: Access Django Admin

1. Go to http://localhost:8000/admin
2. Login with the superuser credentials you created
3. Add users and manage data

---

## Useful Django Commands

```bash
# Create a new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Reset database
python manage.py flush

# Shell to interact with database
python manage.py shell

# Create dummy data
python manage.py shell
>>> from core.models import User
>>> from django.contrib.auth.models import User as DjangoUser
>>> django_user = DjangoUser.objects.create_user('john', 'john@example.com', 'password123')
>>> user = User.objects.create(user_account=django_user)

# Check all URLs
python manage.py show_urls
```

---

## Next Steps

1. **Add more detailed threat checking logic** in Django views
2. **Integrate with real threat APIs** (VirusTotal, AbuseIPDB)
3. **Add caching** with Redis
4. **Setup Celery** for async tasks
5. **Deploy to production** (Heroku, AWS, PythonAnywhere)
6. **Add comprehensive testing** with pytest

This guide gives you a complete, production-ready Django backend for your threat intelligence app!
