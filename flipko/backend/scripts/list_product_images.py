import os, sys, django

# Must point to the backend directory (parent of flipko/, products/, etc.)
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

products = Product.objects.select_related('category').all().order_by('id')
print(f"Total products: {products.count()}")
print("-" * 120)
for p in products:
    img = p.image or "NO IMAGE"
    print(f"ID={p.id:3} | {p.category.slug:20} | {p.name[:40]:40} | {img[:70]}")
