import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def main():
    print("MOBILES NAMES:")
    for p in Product.objects.filter(category__name="Mobiles"):
        print(f"- {p.name}")

if __name__ == '__main__':
    main()
