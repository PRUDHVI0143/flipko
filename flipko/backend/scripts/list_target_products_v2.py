import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product, Category

def list_targets(cats):
    for cat_name in cats:
        try:
            cat = Category.objects.get(name=cat_name)
            ps = Product.objects.filter(category=cat)
            print(f"\n=== {cat_name} ({ps.count()} items) ===")
            for p in ps:
                print(f"ID: {p.id} | {p.name}")
        except Category.DoesNotExist:
            print(f"Category {cat_name} not found")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        list_targets(sys.argv[1:])
    else:
        print("Please provide category names as arguments.")
