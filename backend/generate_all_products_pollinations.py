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

def download_image(prompt):
    encoded_prompt = urllib.parse.quote(prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=400&height=400&nologo=true"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to generate for '{prompt}': {e}")
        return None

def update_product_image(product):
    try:
        # Prompt for pollinations.ai
        prompt = f"Normal style product photo of {product.name} against a clean neutral background. High quality, clear, ecommerce photography."
        img_data = download_image(prompt)
        
        if img_data:
            # remove old image if exists
            if product.image:
                product.image.delete(save=False)
            file_name = f"ai_gen_{slugify(product.name)}_{product.id}.jpg"
            product.image.save(file_name, ContentFile(img_data), save=True)
            print(f"Generated & Updated: {product.name}")
        else:
            print(f"Failed to fetch generated image for {product.name}")
    except Exception as e:
        print(f"Error updating {product.name}: {e}")

def main():
    products = Product.objects.all()
    print(f"Found {products.count()} products to update with dynamically generated unique AI images.")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for p in products:
            futures.append(executor.submit(update_product_image, p))
        
        for future in as_completed(futures):
            future.result()
            
    print("All products uniquely generated successfully!")

if __name__ == '__main__':
    main()
