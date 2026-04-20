import os
import urllib.request
import urllib.parse
import re
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify
from concurrent.futures import ThreadPoolExecutor, as_completed

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def fetch_image_from_bing(query):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        
        # Bing images usually store the image URL in murl inside a JSON block or directly in a tag.
        # Format often looks like: murl&quot;:&quot;https://exampl.com/image.jpg&quot;
        match = re.search(r'murl&quot;:&quot;(http[^&]*?)&quot;', html)
        if not match:
            match = re.search(r'murl":"(http[^"]*?)"', html)
            
        if match:
            img_url = match.group(1)
            # Fetch the actual image
            img_req = urllib.request.Request(img_url, headers=headers)
            img_resp = urllib.request.urlopen(img_req, timeout=10)
            return img_resp.read(), img_url.split('.')[-1][:4].split('?')[0] # get decent extension
    except Exception as e:
        print(f"[{query}] Bing error: {e}")
    return None, None

def update_product_image(product):
    try:
        query = f"{product.name} product photo"
        if "Item" in product.name:
            query = f"{product.category.name} {product.name}"
            
        img_data, ext = fetch_image_from_bing(query)
        
        if img_data:
            if product.image:
                product.image.delete(save=False)
            ext = ext if ext and ext.isalpha() and len(ext)<=4 else 'jpg'
            file_name = f"verified_{slugify(product.name)}_{product.id}.{ext}"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"[SUCCESS] Scraped verified image for: {product.name}")
        else:
            print(f"[FAIL] Could not verify image for: {product.name}")
    except Exception as e:
        print(f"[ERROR] updating {product.name}: {e}")

def main():
    products = Product.objects.all()
    print(f"Starting actual image search for {products.count()} products via Bing Images...")
    
    # 5 workers max to avoid IP bans
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for p in products:
            futures.append(executor.submit(update_product_image, p))
        
        for future in as_completed(futures):
            future.result()
            
    print("Verification search complete.")

if __name__ == '__main__':
    main()
