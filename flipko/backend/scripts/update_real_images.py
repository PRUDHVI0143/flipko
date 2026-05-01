import os
import django
import json
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def download_image(url):
    try:
        # User-Agent is critical for some sites
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def main():
    mapping_file = 'product_image_mapping.json'
    if not os.path.exists(mapping_file):
        print(f"Error: {mapping_file} not found.")
        return

    with open(mapping_file, 'r') as f:
        mapping = json.load(f)

    print(f"Loaded {len(mapping)} image mappings.")

    for name, url in mapping.items():
        try:
            # 1. Try Exact Case-Insensitive Match
            p = Product.objects.filter(name__iexact=name).first()
            
            # 2. Try Substring Match (e.g. "ASUS Vivobook 15" matches "ASUS Vivobook 15 Intel...")
            if not p:
                p = Product.objects.filter(name__icontains=name).first()
            
            # 3. Try partial name match (first 10 chars)
            if not p and len(name) > 10:
                p = Product.objects.filter(name__icontains=name[:10]).first()

            if p:
                print(f"Updating: {p.name} with {url}")
                img_data = download_image(url)
                if img_data:
                    # Remove old image
                    if p.image:
                        p.image.delete(save=False)
                    
                    # Determine extension
                    ext = 'jpg'
                    if '.png' in url.lower(): ext = 'png'
                    elif '.webp' in url.lower(): ext = 'webp'
                    
                    file_name = f"{slugify(p.name)}_{p.id}.{ext}"
                    p.image.save(file_name, ContentFile(img_data), save=True)
                    print(f"SUCCESS: {p.name}")
                else:
                    print(f"FAILED: Download error for {p.name}")
            else:
                print(f"NOT FOUND: {name}")
        except Exception as e:
            print(f"ERROR: {name} -> {e}")

if __name__ == '__main__':
    main()
