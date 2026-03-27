# Django Database Setup - Complete Step-by-Step Guide

## Overview
This guide will walk you through building a Django backend with a PostgreSQL database to replace localStorage in your threat intelligence app.

---

## STEP 1: Prerequisites & Installation

### 1.1 Install Python
First, check if Python is installed:
```bash
python --version  # or python3 --version
```

If not installed, download from [python.org](https://www.python.org/downloads/)

### 1.2 Create a Project Directory
```bash
mkdir threat-intel-backend
cd threat-intel-backend
```

### 1.3 Create Virtual Environment
A virtual environment isolates your project dependencies from your system Python.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Your terminal should now show `(venv)` at the beginning, indicating the virtual environment is active.

### 1.4 Install Required Packages
```bash
pip install django
pip install djangorestframework
pip install django-cors-headers
pip install psycopg2-binary
pip install python-decouple
pip install gunicorn
```

**What each package does:**
- `django` - The main framework
- `djangorestframework` - Builds REST APIs easily
- `django-cors-headers` - Allows requests from your Next.js frontend
- `psycopg2-binary` - PostgreSQL database driver
- `python-decouple` - Manages environment variables safely
- `gunicorn` - Production server

---

## STEP 2: Create Django Project Structure

### 2.1 Create Django Project
```bash
django-admin startproject threat_intel_api .
```

This creates:
```
threat_intel_api/
├── manage.py              # Main management script
├── threat_intel_api/
│   ├── __init__.py
│   ├── settings.py        # Project configuration
│   ├── urls.py            # Main URL routing
│   ├── asgi.py
│   └── wsgi.py
└── venv/
```

### 2.2 Create Django App
```bash
python manage.py startapp threats
```

This creates:
```
threats/
├── migrations/
├── __init__.py
├── admin.py
├── apps.py
├── models.py              # Database models go here
├── tests.py
├── views.py               # API logic goes here
└── serializers.py         # (you'll create this)
```

---

## STEP 3: Configure Database

### 3.1 Install PostgreSQL
Download from [postgresql.org](https://www.postgresql.org/download/)

After installation, verify:
```bash
psql --version
```

### 3.2 Create Database
Open PostgreSQL command line:
```bash
psql -U postgres
```

Create the database:
```sql
CREATE DATABASE threat_intel_db;
\q
```

### 3.3 Update Django Settings
Edit `threat_intel_api/settings.py`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'threats',  # Add your app here
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'threat_intel_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',  # Change to your PostgreSQL password
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# CORS Settings - Allow Next.js frontend to access API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",  # Add production domain later
]

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}
```

---

## STEP 4: Define Database Models

Create/Edit `threats/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User

class ThreatCheck(models.Model):
    """Stores individual threat checks"""
    RISK_LEVELS = [
        ('safe', 'Safe'),
        ('suspicious', 'Suspicious'),
        ('malicious', 'Malicious'),
    ]
    
    CHECK_TYPES = [
        ('ip', 'IP Address'),
        ('url', 'URL'),
        ('malware', 'Malware'),
        ('cyber_threat', 'Cyber Threat'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    check_type = models.CharField(max_length=20, choices=CHECK_TYPES)
    query = models.CharField(max_length=500)  # IP, URL, hash, or indicator
    risk_score = models.IntegerField(default=0)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Raw API response storage
    api_response = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['check_type', '-timestamp']),
            models.Index(fields=['user', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.check_type.upper()} - {self.query}"


class ThreatSource(models.Model):
    """Stores results from individual threat intelligence sources"""
    check = models.ForeignKey(ThreatCheck, on_delete=models.CASCADE, related_name='sources')
    source_name = models.CharField(max_length=100)
    source_id = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=[('success', 'Success'), ('error', 'Error')])
    data = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['source_name']
    
    def __str__(self):
        return f"{self.check.query} - {self.source_name}"


class UserProfile(models.Model):
    """Extends Django User with additional fields"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    api_key = models.CharField(max_length=100, unique=True, null=True, blank=True)
    requests_count = models.IntegerField(default=0)
    requests_limit = models.IntegerField(default=5000)
    last_reset = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} Profile"


class ExportedReport(models.Model):
    """Stores exported reports"""
    EXPORT_FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    threat_check = models.ForeignKey(ThreatCheck, on_delete=models.CASCADE, null=True, blank=True)
    format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    file_path = models.FileField(upload_to='exports/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Export - {self.format} - {self.created_at}"
```

---

## STEP 5: Create Serializers

Create `threats/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ThreatCheck, ThreatSource, UserProfile, ExportedReport

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ThreatSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatSource
        fields = ['id', 'source_name', 'source_id', 'status', 'data', 'error_message', 'source_url', 'timestamp']


class ThreatCheckSerializer(serializers.ModelSerializer):
    sources = ThreatSourceSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ThreatCheck
        fields = ['id', 'check_type', 'query', 'risk_score', 'risk_level', 'timestamp', 'api_response', 'sources', 'user_username']


class ThreatCheckCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatCheck
        fields = ['check_type', 'query', 'risk_score', 'risk_level', 'api_response']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'api_key', 'requests_count', 'requests_limit', 'last_reset']


class ExportedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportedReport
        fields = ['id', 'format', 'file_path', 'created_at']
```

---

## STEP 6: Create API Views

Create/Edit `threats/views.py`:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ThreatCheck, ThreatSource, UserProfile
from .serializers import ThreatCheckSerializer, ThreatCheckCreateSerializer, ThreatSourceSerializer

class ThreatCheckViewSet(viewsets.ModelViewSet):
    """
    API endpoints for threat checks.
    GET /api/threats/ - List all checks
    POST /api/threats/ - Create new check
    GET /api/threats/{id}/ - Get specific check
    DELETE /api/threats/{id}/ - Delete check
    GET /api/threats/statistics/ - Get statistics
    """
    
    def get_queryset(self):
        # Filter by logged-in user
        return ThreatCheck.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ThreatCheckCreateSerializer
        return ThreatCheckSerializer
    
    def perform_create(self, serializer):
        # Automatically assign current user
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get user's threat check statistics"""
        total_checks = ThreatCheck.objects.filter(user=request.user).count()
        malicious_count = ThreatCheck.objects.filter(
            user=request.user, 
            risk_level='malicious'
        ).count()
        suspicious_count = ThreatCheck.objects.filter(
            user=request.user, 
            risk_level='suspicious'
        ).count()
        
        # By type
        by_type = {}
        for check_type, _ in ThreatCheck.CHECK_TYPES:
            count = ThreatCheck.objects.filter(
                user=request.user, 
                check_type=check_type
            ).count()
            by_type[check_type] = count
        
        return Response({
            'total_checks': total_checks,
            'malicious': malicious_count,
            'suspicious': suspicious_count,
            'safe': total_checks - malicious_count - suspicious_count,
            'by_type': by_type,
        })
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filter checks by type"""
        check_type = request.query_params.get('type')
        if not check_type:
            return Response({'error': 'type parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        checks = ThreatCheck.objects.filter(user=request.user, check_type=check_type)
        serializer = self.get_serializer(checks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search checks by query"""
        query = request.query_params.get('q')
        if not query:
            return Response({'error': 'q parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        checks = ThreatCheck.objects.filter(
            user=request.user,
            query__icontains=query
        )
        serializer = self.get_serializer(checks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def delete_check(self, request, pk=None):
        """Delete a specific check"""
        check = self.get_object()
        check.delete()
        return Response({'status': 'Check deleted'}, status=status.HTTP_204_NO_CONTENT)


class ThreatSourceViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only API for threat sources from individual checks"""
    serializer_class = ThreatSourceSerializer
    
    def get_queryset(self):
        check_id = self.request.query_params.get('check_id')
        if check_id:
            return ThreatSource.objects.filter(check_id=check_id)
        return ThreatSource.objects.none()
```

---

## STEP 7: Create URL Routing

Create `threats/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'checks', views.ThreatCheckViewSet, basename='threat-check')
router.register(r'sources', views.ThreatSourceViewSet, basename='threat-source')

urlpatterns = [
    path('', include(router.urls)),
]
```

Edit `threat_intel_api/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('threats.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
```

---

## STEP 8: Create and Apply Migrations

Migrations are how Django manages database schema changes.

### 8.1 Create Migrations
```bash
python manage.py makemigrations
```

This creates migration files describing your model changes.

### 8.2 Apply Migrations
```bash
python manage.py migrate
```

This actually creates the tables in PostgreSQL.

### 8.3 Verify Tables Created
```bash
psql -U postgres -d threat_intel_db
\dt
\q
```

You should see tables like:
- `threats_threatcheck`
- `threats_threatsource`
- `threats_userprofile`
- `threats_exportedreport`

---

## STEP 9: Create Superuser

Create an admin account to manage data:

```bash
python manage.py createsuperuser
```

Answer the prompts:
- Username: `admin`
- Email: `admin@example.com`
- Password: (your secure password)

---

## STEP 10: Register Models in Admin

Edit `threats/admin.py`:

```python
from django.contrib import admin
from .models import ThreatCheck, ThreatSource, UserProfile, ExportedReport

@admin.register(ThreatCheck)
class ThreatCheckAdmin(admin.ModelAdmin):
    list_display = ['query', 'check_type', 'risk_level', 'timestamp', 'user']
    list_filter = ['check_type', 'risk_level', 'timestamp']
    search_fields = ['query']
    readonly_fields = ['timestamp']

@admin.register(ThreatSource)
class ThreatSourceAdmin(admin.ModelAdmin):
    list_display = ['source_name', 'status', 'timestamp']
    list_filter = ['status', 'source_name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'requests_count', 'requests_limit']

@admin.register(ExportedReport)
class ExportedReportAdmin(admin.ModelAdmin):
    list_display = ['format', 'created_at', 'user']
    list_filter = ['format', 'created_at']
```

---

## STEP 11: Run Development Server

```bash
python manage.py runserver
```

Visit:
- **API**: http://localhost:8000/api/checks/
- **Admin**: http://localhost:8000/admin/

---

## STEP 12: How It Works - Data Flow Diagram

```
Next.js Frontend (localhost:3000)
            ↓
            ↓ HTTP Request (fetch)
            ↓
Django REST API (localhost:8000/api/)
            ↓
        Views.py (handles request logic)
            ↓
        Models.py (defines database schema)
            ↓
PostgreSQL Database (threat_intel_db)
            ↓
        ThreatCheck table
        ThreatSource table
        UserProfile table
            ↓
        Returns JSON Response
            ↓
Next.js Frontend (displays data)
```

### Example Request Flow:

1. User enters IP in Next.js frontend
2. Frontend sends: `POST /api/checks/ { check_type: 'ip', query: '192.168.1.1' }`
3. Django receives request → calls ThreatCheckViewSet.create()
4. Creates ThreatCheck record in PostgreSQL
5. Returns JSON: `{ id: 1, query: '192.168.1.1', risk_score: 45, ... }`
6. Frontend receives response and displays data

---

## STEP 13: Connect to Next.js Frontend

In your Next.js component (`components/ip-checker.tsx`):

```typescript
'use client';

import { useState } from 'react';

export function IPChecker() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleCheck() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/checks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // If using auth
        },
        body: JSON.stringify({
          check_type: 'ip',
          query: query,
          risk_score: 0,
          risk_level: 'safe',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter IP address"
      />
      <button onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking...' : 'Check IP'}
      </button>
      {result && <div>{JSON.stringify(result)}</div>}
    </div>
  );
}
```

---

## STEP 14: Get Historical Data

Fetch all previous checks:

```typescript
async function fetchHistory() {
  const response = await fetch('http://localhost:8000/api/checks/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await response.json();
  console.log(data); // Array of all checks
}
```

---

## Common Django Commands

```bash
# Start development server
python manage.py runserver

# Create migrations for model changes
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# Open Django shell for testing
python manage.py shell

# Export data to JSON
python manage.py dumpdata threats > backup.json

# Import data from JSON
python manage.py loaddata backup.json

# Run tests
python manage.py test
```

---

## Environment Variables (.env)

Create `.env` file in project root:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=threat_intel_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Update `settings.py` to use these:

```python
from decouple import config

DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY')
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}
```

---

## Troubleshooting

**Error: "psycopg2: could not translate host name"**
- PostgreSQL not running. Start it with: `postgres -D /usr/local/var/postgres`

**Error: "Database threat_intel_db does not exist"**
- Create it manually: `createdb threat_intel_db`

**Error: "CORS origin not allowed"**
- Add your frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py

**Error: "No such table"**
- Run migrations: `python manage.py migrate`

---

## Next Steps

1. Start the Django server: `python manage.py runserver`
2. Visit http://localhost:8000/admin/ to create test data
3. Update Next.js components to fetch from `http://localhost:8000/api/checks/`
4. Implement authentication with JWT tokens
5. Integrate real API keys and call actual threat intelligence services

