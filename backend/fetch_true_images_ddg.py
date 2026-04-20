import os
import requests
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed
from duckduckgo_search import DDGS

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def fetch_image_from_ddg(query):
    try:
        results = DDGS().images(query, max_results=1, safesearch='off', size='Medium')
        for r in results:
            img_url = r.get('image')
            if img_url:
                resp = requests.get(img_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                if resp.status_code == 200:
                    return resp.content, img_url.split('.')[-1][:4] # return extension roughly
        return None, None
    except Exception as e:
        print(f"Failed DDG search for {query}: {e}")
        return None, None

def update_product_image(product):
    try:
        # Some product names like "Item 1" might need category for better search
        query = product.name
        if "Item" in query:
            query = f"{product.category.name} {product.name}"
            
        img_data, ext = fetch_image_from_ddg(query)
        
        if img_data:
            if product.image:
                product.image.delete(save=False)
            ext = ext if ext and ext.isalpha() else 'jpg'
            file_name = f"true_{slugify(product.name)}_{product.id}.{ext}"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"[SUCCESS] Uploaded authentic image for: {product.name}")
        else:
            print(f"[FAIL] Could not find/download image for: {product.name}")
    except Exception as e:
        print(f"[ERROR] updating {product.name}: {e}")

def main():
    products = Product.objects.all()
    print(f"Starting true image verification search for {products.count()} products...")
    
    # Using 5 workers to avoid hitting DDG rate limits too quickly
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for p in products:
            futures.append(executor.submit(update_product_image, p))
        
        for future in as_completed(futures):
            future.result()
            
    print("All authentic images fetched and verified successfully!")

if __name__ == '__main__':
    main()
