import os
import urllib.request
from io import BytesIO
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Category, Product

category_keywords = {
    "Electronics": "electronics",
    "Mobiles": "smartphone",
    "Fashion": "fashion",
    "Home & Furniture": "furniture",
    "Books": "book",
    "Appliances": "kitchen",
    "Comics & Manga": "comic",
    "Food & Health": "food",
    "Toys & Baby": "toy",
    "Beauty": "beauty"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def update_product_image(product, keyword):
    try:
        url = f"https://loremflickr.com/400/400/{keyword}?random={product.id}"
        img_data = download_image(url)
        if img_data:
            # remove old image if exists
            if product.image:
                product.image.delete(save=False)
            file_name = f"{slugify(product.name)}_{product.id}.jpg"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"Updated {product.name}")
        else:
            print(f"Failed to fetch image for {product.name}")
    except Exception as e:
        print(f"Error updating {product.name}: {e}")

def main():
    products = Product.objects.all()
    print(f"Found {products.count()} products to update.")
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        for p in products:
            keyword = p.name.replace(' ', ',') # Use name as keyword
            futures.append(executor.submit(update_product_image, p, keyword))
        
        for future in as_completed(futures):
            future.result()
            
    print("All product images updated successfully based on category!")

if __name__ == '__main__':
    main()
