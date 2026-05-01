import os
import django
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# 20 Diverse Mobile URLs from Browser Subagent
mobile_mapping = {
  "Samsung Galaxy M34 5G": "https://img.global.news.samsung.com/in/wp-content/uploads/2023/07/16268_SM-M346_Galaxy-M34-5G_Dark-Blue_3000x3000_Front_ai2.jpg",
  "Realme C53": "https://www.1p.sg/cdn/shop/files/RealmeC53Gold_accbbee6-3534-44c7-b42e-fa364bcd9937.jpg?v=1703915260&width=1024",
  "Vivo T2x 5G": "https://m.media-amazon.com/images/I/71XmGv-+4eL.jpg",
  "POCO M6 Pro 5G": "https://m.media-amazon.com/images/I/51id6PLeG9L.jpg",
  "Redmi 12 5G": "https://m.media-amazon.com/images/I/71S8S6Z-Z8L.jpg",
  "Infinix Note 30 5G": "https://m.media-amazon.com/images/I/61lyfsIvnRL.jpg",
  "Samsung Galaxy F34 5G": "https://m.media-amazon.com/images/I/91L9EF-OEGL.jpg",
  "Moto G54 5G": "https://m.media-amazon.com/images/I/618m17r9mFL.jpg",
  "iQOO Z7S 5G": "https://m.media-amazon.com/images/I/71k3g62CLwL.jpg",
  "Oppo A78 5G": "https://m.media-amazon.com/images/I/81S6-FscXvL.jpg",
  "Tecno Pova 5 Pro": "https://m.media-amazon.com/images/I/71NnU-GfSGL.jpg",
  "Lava Agni 2 5G": "https://m.media-amazon.com/images/I/71id6PLeG9L.jpg",
  "Samsung Galaxy F14 5G": "https://m.media-amazon.com/images/I/81McSNo7InL.jpg",
  "Realme 11x 5G": "https://m.media-amazon.com/images/I/71d79yGuYWL.jpg",
  "Nokia G42 5G": "https://m.media-amazon.com/images/I/715t+a0K06L.jpg",
  "OnePlus Nord": "https://m.media-amazon.com/images/I/61LB+OCU0uL.jpg",
  "realme 12 Pro 5G": "https://m.media-amazon.com/images/I/71S9w8i6-8L.jpg",
  "POCO F5 5G": "https://m.media-amazon.com/images/I/619v-4g-OFL.jpg",
  "Nothing Phone (2)": "https://m.media-amazon.com/images/I/71m94b+o8sL.jpg",
  "Vivo V29 5G": "https://bhatiamobile.com/wp-content/uploads/2023/10/Vivo-V29-5G.jpg"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.read()
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def main():
    print(f"Applying {len(mobile_mapping)} unique mobile images...")
    
    for name_query, url in mobile_mapping.items():
        # Match by name
        p = Product.objects.filter(name__icontains=name_query).first()
        if p:
            print(f"Updating {p.name}...")
            data = download_image(url)
            if data:
                if p.image: p.image.delete(save=False)
                ext = 'jpg'
                if '.png' in url.lower(): ext = 'png'
                p.image.save(f"{slugify(p.name)}_{p.id}.{ext}", ContentFile(data), save=True)
                print(f"SUCCESS: {p.name}")
            else:
                print(f"FAILED download for {p.name}")
        else:
            print(f"NOT FOUND: {name_query}")

    # FORCE DIVERSITY for all others using random IDs in Loremflickr (better than Picsum for products)
    all_products = Product.objects.all()
    print(f"Ensuring 100% diversity for remaining products...")
    for p in all_products:
        # If it doesn't look like a real image (size check or name check)
        # Actually, let's just FORCE update all and use a unique seed for everyone.
        # This is the ONLY way to be sure.
        if "Premium Item" in p.name or "(" in p.name:
            # Skip the ones we just updated
            if any(key in p.name for key in mobile_mapping.keys()):
                continue
                
            # Use LoremFlickr with a unique seed and category tag
            tag = p.category.name.lower().replace(' & ', ',')
            url = f"https://loremflickr.com/400/400/{tag},product/all?lock={p.id}"
            print(f"Seeding {p.name} with unique visual...")
            data = download_image(url)
            if data:
                if p.image: p.image.delete(save=False)
                p.image.save(f"{slugify(p.name)}_{p.id}.jpg", ContentFile(data), save=True)

    print("Diversity Sync Complete.")

if __name__ == '__main__':
    main()
