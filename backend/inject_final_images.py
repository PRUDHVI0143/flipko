import os
import shutil
import django
import json
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Path to the generated images (NEW BATCH)
generated_images = {
    "Vivobook": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\asus_vivobook_real_1776419257045.png",
    "Sony Alpha": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\sony_a6100_real_1776419273844.png",
    "GoPro": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\gopro_hero12_real_1776419292687.png",
    "LEGO": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\lego_classic_real_1776419309772.png",
    "Barbie": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\barbie_dreamhouse_real_1776419327535.png"
}

# New Food URLs sourced from subagent
food_urls = {
  "Maggi 2-Minute Masala Noodles": "https://rukmini1.flixcart.com/image/1500/1500/xif0q/noodle/h/2/u/-original-imahhffghpczfh7y.jpeg?q=70",
  "Amul Butter 500g": "https://www.bbassets.com/media/uploads/p/xl/104864_8-amul-butter-pasteurised.jpg",
  "Bournvita Health Drink": "https://m.media-amazon.com/images/I/61k2avH7GOL.jpg",
  "Lay's Classic Salted Chips": "https://m.media-amazon.com/images/I/71uR4fXmX+L.jpg",
  "Red Bull Energy Drink": "https://m.media-amazon.com/images/I/61qSUpD7LPL.jpg"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def main():
    # 1. Inject Generated Images
    for name_part, img_path in generated_images.items():
        if not os.path.exists(img_path):
            print(f"File not found: {img_path}")
            continue
            
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Injecting AI image for {p.name}...")
            with open(img_path, 'rb') as f:
                img_data = f.read()
            if p.image: p.image.delete(save=False)
            file_name = f"{slugify(p.name)}_{p.id}.png"
            p.image.save(file_name, ContentFile(img_data), save=True)
            print(f"Successfully updated {p.name}")

    # 2. Inject Food URLs
    for name_part, url in food_urls.items():
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Downloading real image for {p.name}...")
            img_data = download_image(url)
            if img_data:
                if p.image: p.image.delete(save=False)
                file_name = f"{slugify(p.name)}_{p.id}.jpg"
                p.image.save(file_name, ContentFile(img_data), save=True)
                print(f"Successfully updated {p.name}")
            else:
                print(f"Failed to download image for {p.name}")

if __name__ == '__main__':
    main()
