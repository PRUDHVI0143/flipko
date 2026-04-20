import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

products = Product.objects.all()
for p in products:
    if "Premium Item" not in p.name:
        print(f"{p.id}: {p.name}")
