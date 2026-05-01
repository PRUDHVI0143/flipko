import os
import django
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Manual fixes for failures
fixes = {
    "SAMSUNG Galaxy S23 5G (Green, 256 GB)": "https://m.media-amazon.com/images/I/61VfL-3stJL._AC_UF1000%2C1000_QL80_.jpg",
    "TRESemme": "https://m.media-amazon.com/images/I/51pSg9W9LSL.jpg"
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
    for name_part, url in fixes.items():
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Fixing: {p.name}")
            img_data = download_image(url)
            if img_data:
                if p.image: p.image.delete(save=False)
                file_name = f"{slugify(p.name)}_{p.id}.jpg"
                p.image.save(file_name, ContentFile(img_data), save=True)
                print(f"FIXED: {p.name}")

if __name__ == '__main__':
    main()
