import os

from django.http import JsonResponse, HttpResponse, Http404
from django.urls import path, include, re_path
from django.conf import settings


def health_check(request):
    return JsonResponse({'status': 'ok'})


def serve_react(request):
    try:
        index_path = os.path.join(settings.FRONTEND_DIR, 'index.html')
        with open(index_path) as f:
            return HttpResponse(f.read(), content_type='text/html')
    except FileNotFoundError:
        raise Http404("Frontend not built.")


urlpatterns = [
    path('api/health/', health_check),
    path('api/', include('tickets.urls')),
]

# Catch-all for React Router (must be last)
urlpatterns += [
    re_path(r'^(?!api/).*$', serve_react, name='react_app'),
]
