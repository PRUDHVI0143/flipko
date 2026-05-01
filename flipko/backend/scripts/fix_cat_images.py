import os
import requests
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product, Category

# High-quality, generic Unsplash fallbacks per category
CATEGORY_FALLBACKS = {
  "Mobiles": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop",
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000&auto=format&fit=crop",
  "Fashion": "https://images.unsplash.com/photo-1523381235212-d73f4138fc63?q=80&w=1000&auto=format&fit=crop",
  "Home & Furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop",
  "Appliances": "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1000&auto=format&fit=crop",
  "Books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1000&auto=format&fit=crop",
  "Toys & Baby": "https://images.unsplash.com/photo-1533512930330-4ac257c86793?q=80&w=1000&auto=format&fit=crop",
  "Food & Health": "https://images.unsplash.com/photo-1506617564039-2f3b650ad755?q=80&w=1000&auto=format&fit=crop",
  "Beauty": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
  "Comics & Manga": "https://images.unsplash.com/photo-1578632738981-4320f661fb50?q=80&w=1000&auto=format&fit=crop"
}

def download_image(url):
    try:
        response = requests.get(url, timeout=20, headers={'User-Agent': 'Mozilla/5.0'})
        if response.status_code == 200:
            return response.content
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def update_product_image(product):
    # Only update products that are still using placeholders or have "premium item" names
    # Actually, let's update EVERYTHING that isn't one of the Real/AI images we already fixed.
    
    # Check if we should skip this product (if it's one of the ones we manually fixed)
    # We can detect this by checking if the image name contains high-quality slugified bits
    # or just trust the CATEGORY_FALLBACKS for anything generic.
    
    if "Premium Item" in product.name:
        url = CATEGORY_FALLBACKS.get(product.category.name)
        if url:
            print(f"Updating generic product: {product.name} with {product.category.name} fallback")
            img_data = download_image(url)
            if img_data:
                if product.image:
                    product.image.delete(save=False)
                filename = f"{slugify(product.name)}_{product.id}.jpg"
                product.image.save(filename, ContentFile(img_data), save=True)
                return True
    return False

def main():
    products = Product.objects.all()
    print(f"Scanning {products.count()} products for dead/repetitive placeholders...")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(update_product_image, p) for p in products]
        count = 0
        for future in as_completed(futures):
            if future.result():
                count += 1
    
    print(f"Finished. Updated {count} generic products with high-quality category placeholders.")

if __name__ == '__main__':
    main()
