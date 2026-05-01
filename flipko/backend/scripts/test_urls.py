import os
import django
from django.conf import settings
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

def list_urls(lis, acc=None):
    if acc is None:
        acc = []
    if not lis:
        return
    l = lis[0]
    if hasattr(l, 'url_patterns'):
        yield from list_urls(l.url_patterns, acc + [str(l.pattern)])
    else:
        yield ''.join(acc) + str(l.pattern)
    yield from list_urls(lis[1:], acc)

for url in list_urls(get_resolver().url_patterns):
    print(url)
