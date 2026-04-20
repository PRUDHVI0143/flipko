import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

ids = [1001, 1000, 999, 998]
print({p.id: p.name for p in Product.objects.filter(id__in=ids)})
