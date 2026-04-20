import os
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Category, Product

ARTIFACT_DIR = r"C:\Users\prudh\.gemini\antigravity\brain\9f4a8889-df11-4fe0-9e05-e342c64dfa73"

category_images = {
    "Electronics": "electronics_cat_1776270746238.png",
    "Mobiles": "mobiles_cat_1776270769689.png",
    "Fashion": "fashion_cat_1776270798155.png",
    "Home & Furniture": "furniture_cat_1776270825735.png",
    "Books": "books_cat_1776270858567.png",
    "Appliances": "appliances_cat_1776270883634.png",
    "Comics & Manga": "comics_cat_1776270920802.png",
    "Food & Health": "food_cat_1776270945809.png",
    "Toys & Baby": "toys_cat_1776270972230.png",
    "Beauty": "beauty_cat_1776270995090.png",
}

def main():
    print("Applying AI-generated images to products...")
    
    for cat_name, file_name in category_images.items():
        image_path = os.path.join(ARTIFACT_DIR, file_name)
        if not os.path.exists(image_path):
            print(f"Warning: could not find {image_path}")
            continue
            
        with open(image_path, "rb") as f:
            img_data = f.read()
            
        products = Product.objects.filter(category__name=cat_name)
        print(f"Found {products.count()} products for category {cat_name}")
        
        for p in products:
            if p.image:
                p.image.delete(save=False)
            unique_name = f"gen_{slugify(cat_name)}_{p.id}.png"
            p.image.save(unique_name, ContentFile(img_data), save=True)
            
        print(f"Successfully applied {file_name} to {cat_name}")

if __name__ == '__main__':
    main()
