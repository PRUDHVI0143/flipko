import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product, Category

cats = Category.objects.all()
print("=== CATEGORIES ===")
for c in cats:
    print(f"  {c.id}: {c.name} ({c.slug})")

print(f"\n=== TOTAL PRODUCTS: {Product.objects.count()} ===")
for p in Product.objects.select_related('category').order_by('category__slug', 'name'):
    img_preview = (p.image[:90] + "...") if p.image and len(p.image) > 90 else (p.image or "NONE")
    print(f"  [{p.id}] {p.name} | ${p.price} | cat={p.category.slug} | img={img_preview}")
