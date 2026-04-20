"""
Fix: update only products that still have the old generic 'gen_*' or 'ai_gen_*' image names,
and any "Premium Item" named products which failed due to encoding errors.
Uses ASCII-safe print to avoid charmap issues on Windows.
"""
import os
import sys
import urllib.request
import urllib.parse
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Force UTF-8 stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

CATEGORY_KEYWORDS = {
    "Electronics":      "electronics gadget",
    "Mobiles":          "smartphone mobile",
    "Fashion":          "fashion clothing",
    "Home & Furniture": "furniture home decor",
    "Books":            "book reading library",
    "Appliances":       "kitchen appliance",
    "Comics & Manga":   "comic manga",
    "Food & Health":    "food healthy nutrition",
    "Toys & Baby":      "toy children baby",
    "Beauty":           "beauty cosmetics makeup",
}

def fetch_image(keyword, product_id):
    url = f"https://loremflickr.com/400/400/{urllib.parse.quote(keyword)}?random={product_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

def needs_update(product):
    """Return True if this product has a generic/broken image."""
    if not product.image:
        return True
    name = os.path.basename(product.image.name)
    # Old generic images all start with gen_ or ai_gen_
    if name.startswith('gen_') or name.startswith('ai_gen_'):
        return True
    # Products whose names that couldn't print before
    if 'Premium Item' in product.name:
        return True
    return False

def main():
    products = list(Product.objects.select_related('category').all())
    to_fix = [p for p in products if needs_update(p)]
    print(f"Fixing {len(to_fix)} products that need updated images...")

    for p in to_fix:
        try:
            keyword = CATEGORY_KEYWORDS.get(p.category.name, "product")
            img_data = fetch_image(keyword, p.id)

            if img_data and len(img_data) > 5000:
                if p.image:
                    p.image.delete(save=False)
                file_name = f"fixed_{slugify(p.category.name)}_{p.id}.jpg"
                p.image.save(file_name, ContentFile(img_data), save=True)
                print(f"[OK] Fixed: {p.name} ({p.category.name})")
            else:
                print(f"[SKIP] Too small for: {p.name}")
        except Exception as e:
            print(f"[ERROR] {p.id}: {e}")

    print("Fix complete.")

if __name__ == '__main__':
    main()
