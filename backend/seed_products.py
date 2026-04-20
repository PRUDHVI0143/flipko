import os
import sys
import urllib.request
from io import BytesIO

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
import django
django.setup()

from django.core.files.base import ContentFile
from django.utils.text import slugify
from products.models import Category, Product
import decimal
import random

categories_data = [
    "Electronics", "Mobiles", "Fashion", "Home & Furniture",
    "Books", "Appliances", "Comics & Manga", "Food & Health",
    "Toys & Baby", "Beauty"
]

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return b""

def seed():
    for cat_idx, cat_name in enumerate(categories_data):
        cat, created = Category.objects.get_or_create(name=cat_name, slug=slugify(cat_name))
        print(f"Seeding category: {cat.name}")
        
        # Download one base image per category to save time and network requests
        url = f"https://picsum.photos/seed/{cat.slug}/400/400"
        img_data = download_image(url)
        
        for i in range(1, 16):
            name = f"{cat.name} Premium Item {i}"
            if Product.objects.filter(name=name).exists():
                print(f"  -> Skipping {name}, already exists")
                continue
                
            description = f"High quality {cat.name} product for everyday use. Designed with aesthetics and functionality in mind."
            price = decimal.Decimal(random.randint(499, 15000)) + decimal.Decimal('0.99')
            stock = random.randint(10, 100)
            
            p = Product(category=cat, name=name, description=description, price=price, stock=stock)
            
            if img_data:
                # Use a unique name for the file, but same content
                file_name = f"{slugify(name)}.jpg"
                p.image.save(file_name, ContentFile(img_data), save=False)
                
            p.save()
            print(f"  -> Created {name}")

if __name__ == '__main__':
    seed()
    print("Database seeding complete!")
