import os
import django
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# New 5 AI Images
ai_images = {
    "Barbie Fashionistas": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\barbie_doll_diverse_1776437769503.png",
    "Hot Wheels Monster Truck": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\hot_wheels_truck_diverse_1776437787126.png",
    "Cadbury Milk Chocolate": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\cadbury_silk_diverse_1776437803658.png",
    "Nivea Men": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\nivea_bodywash_diverse_1776437824602.png",
    "TP-Link AC1200": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\tp_link_router_diverse_1776437845629.png"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read()
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def main():
    # 1. Inject AI Images
    for name_part, img_path in ai_images.items():
        if not os.path.exists(img_path): continue
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Injecting AI image for {p.name}...")
            if p.image: p.image.delete(save=False)
            with open(img_path, 'rb') as f:
                p.image.save(f"{slugify(p.name)}_{p.id}.png", ContentFile(f.read()), save=True)
            print(f"DONE: {p.name}")

    # 2. Inject Diverse Placeholders for everything else to fix the "Same Image" issue
    products = Product.objects.all()
    print(f"Ensuring diversity for all {products.count()} products...")
    
    # We will only update ones that are currently "generic" or didn't get an AI image
    updated_placeholder_count = 0
    for p in products:
        # If it's still using the old repetitive image (we can check by size or just force update all generics)
        if "Premium Item" in p.name or "(" in p.name:
            # Check if it was updated by AI already (by checking file extension or mapping)
            is_ai = any(part in p.name for part in ai_images.keys())
            if not is_ai:
                # Use Picsum with a unique seed based on ID
                url = f"https://picsum.photos/seed/{p.id}/400/400"
                print(f"Updating {p.name} with unique seeded placeholder...")
                data = download_image(url)
                if data:
                    if p.image: p.image.delete(save=False)
                    p.image.save(f"{slugify(p.name)}_{p.id}.jpg", ContentFile(data), save=True)
                    updated_placeholder_count += 1
                    
    print(f"Finished. Updated {updated_placeholder_count} products with unique seeded visuals.")

if __name__ == '__main__':
    main()
