import os
import urllib.request
import urllib.parse
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Stopwords to filter out when building image search keyword
STOPWORDS = {
    'a', 'an', 'the', 'and', 'or', 'of', 'in', 'for', 'to', 'with', 'by',
    'on', 'at', 'is', 'it', 'pack', 'set', 'nos', 'ml', 'gm', 'kg', 'ltr',
    'inch', 'cm', 'mm', 'gb', 'tb', 'mb', 'item', 'premium', 'lite', 'pro',
    'plus', 'mini', 'max', 'ultra', 'series', 'edition', 'vol', 'volume',
    'original', 'new', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '12', '15', '16', '24', '32', '64', '128', '256', '500', 'w', 'hd',
    'classic', 'basic', 'standard', 'black', 'white', 'blue', 'red', 'green',
    'grey', 'gray', 'silver', 'gold',
}

# Curated keyword map per category for fallback
CATEGORY_KEYWORDS = {
    "Electronics":    "electronics gadget",
    "Mobiles":        "smartphone mobile",
    "Fashion":        "fashion clothing",
    "Home & Furniture": "furniture home",
    "Books":          "book reading",
    "Appliances":     "kitchen appliance",
    "Comics & Manga": "comic manga book",
    "Food & Health":  "food healthy",
    "Toys & Baby":    "toy children",
    "Beauty":         "beauty cosmetics",
}

def extract_keywords(product_name):
    """Extract 1-2 meaningful words from product name for image search."""
    words = product_name.replace('&', ' ').replace('-', ' ').replace('/', ' ').split()
    # Filter short words, numbers, stopwords
    keywords = [w.lower() for w in words
                if len(w) > 2 and w.lower() not in STOPWORDS and not w.isdigit()]
    return ','.join(keywords[:2]) if keywords else None

def fetch_image(keyword, product_id):
    """Download image from loremflickr using keyword."""
    url = f"https://loremflickr.com/400/400/{urllib.parse.quote(keyword)}?random={product_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()

def update_product_image(product):
    try:
        keyword = extract_keywords(product.name)
        if not keyword or 'item' in keyword:
            # Use category fallback
            keyword = CATEGORY_KEYWORDS.get(product.category.name, "product")

        img_data = fetch_image(keyword, product.id)

        if img_data and len(img_data) > 5000:  # Verify it's a real image (>5KB)
            if product.image:
                product.image.delete(save=False)
            file_name = f"smart_{slugify(product.name)}_{product.id}.jpg"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"[OK] {product.name}  →  '{keyword}'")
        else:
            print(f"[TINY/FAIL] {product.name} – image too small or empty")

    except Exception as e:
        print(f"[ERROR] {product.name}: {e}")

def main():
    products = list(Product.objects.select_related('category').all())
    print(f"Fetching smart images for {len(products)} products...")

    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = [executor.submit(update_product_image, p) for p in products]
        for future in as_completed(futures):
            future.result()

    print("\nDone! All products now have keyword-matched images.")

if __name__ == '__main__':
    main()
