import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Category, Product

categories = Category.objects.all()
for cat in categories:
    products = Product.objects.filter(category=cat)[:5]
    print(f"Category: {cat.name}")
    for p in products:
        print(f"  - {p.name}")
