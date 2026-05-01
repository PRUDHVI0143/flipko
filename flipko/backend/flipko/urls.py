from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('flipko.api_urls')),  # API routes
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static('/assets/', document_root=settings.BASE_DIR.parent / 'frontend-reaction' / 'dist' / 'assets')

# All other routes should serve the React app - MUST BE LAST
urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name='index.html'))]
