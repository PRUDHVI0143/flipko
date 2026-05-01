import os
import urllib.request
import urllib.parse
from io import BytesIO
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def download_image(product):
    # Extract important keywords from product name, ignoring generic words
    words = product.name.replace('&', '').replace('-', '').split()
    # Take first two significant words
    valid_words = [w for w in words if len(w) > 2][:2]
    keyword = ",".join(valid_words).lower() if valid_words else "product"
    
    url = f"https://loremflickr.com/400/400/{urllib.parse.quote(keyword)}?random={product.id}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except Exception as e:
        # Fallback
        return None

def update_product_image(product):
    try:
        img_data = download_image(product)
        if img_data:
            # remove old image if exists
            if product.image:
                product.image.delete(save=False)
            file_name = f"norm_{slugify(product.name)}_{product.id}.jpg"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"Generated & Updated: {product.name}")
        else:
            print(f"Failed to fetch image for {product.name}")
    except Exception as e:
        print(f"Error updating {product.name}: {e}")

def main():
    products = Product.objects.all()
    print(f"Found {products.count()} products to update with normal style images based on product name.")
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        for p in products:
            futures.append(executor.submit(update_product_image, p))
        
        for future in as_completed(futures):
            future.result()
            
    print("All products uniquely updated successfully!")

if __name__ == '__main__':
    main()
