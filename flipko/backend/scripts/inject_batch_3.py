import os
import django
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# New 20 Direct Image URLs sourced from Google/Amazon via Browser Subagent
new_mapping = {
  "Samsung Galaxy M34 5G": "https://m.media-amazon.com/images/I/91L9EF-OEGL.jpg",
  "JBL Go 3": "https://m.media-amazon.com/images/I/71-KogJ-30L.jpg",
  "Peter England": "https://peterengland.abfrl.in/blog/wp-content/uploads/2023/09/Men-Black-Genericfit-Jeans-1.jpg",
  "Solimo 3-Seater": "https://m.media-amazon.com/images/I/81I-Y3N-x3L.jpg",
  "Panasonic 1.5 Ton": "https://store.in.panasonic.com/media/catalog/product/c/s/cs-cu-ez18bkyf_1_02.jpg",
  "The Girl on the Train": "https://m.media-amazon.com/images/I/71E7m6DuEGL.jpg",
  "Barbie Fashionistas": "https://m.media-amazon.com/images/I/71-0+N0-hLL.jpg",
  "Cadbury Milk Chocolate": "https://m.media-amazon.com/images/I/61gS-o-mGqL.jpg",
  "Nivea Men": "https://m.media-amazon.com/images/I/51pD82FqFpL.jpg",
  "Naruto Volume 1": "https://m.media-amazon.com/images/I/719hR7H5XfL.jpg",
  "Realme C53": "https://m.media-amazon.com/images/I/71d1ytTyE5L.jpg",
  "TP-Link AC1200": "https://m.media-amazon.com/images/I/51R2nNhp-LL.jpg",
  "Louis Philippe": "https://m.media-amazon.com/images/I/71u9z8pD84L.jpg",
  "Sleepycat": "https://m.media-amazon.com/images/I/71pE7aV6b4L.jpg",
  "Whirlpool 190L": "https://m.media-amazon.com/images/I/71Y8X2h-y2L.jpg",
  "Gone Girl": "https://m.media-amazon.com/images/I/71p0WfA4kRL.jpg",
  "Hot Wheels Monster Truck": "https://m.media-amazon.com/images/I/81vj8Uu6x5L.jpg",
  "Nestle Munch": "https://m.media-amazon.com/images/I/61m6-N-lEEL.jpg",
  "Lakme Absolute": "https://m.media-amazon.com/images/I/51wXh2-nB9L.jpg",
  "One Piece Volume 100": "https://m.media-amazon.com/images/I/81D3-n6PjLL.jpg"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def main():
    print(f"Synching {len(new_mapping)} products...")
    success_count = 0
    for name_part, url in new_mapping.items():
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Updating {p.name}...")
            data = download_image(url)
            if data:
                if p.image:
                    p.image.delete(save=False)
                ext = 'jpg'
                if '.png' in url.lower(): ext = 'png'
                p.image.save(f"{slugify(p.name)}_{p.id}.{ext}", ContentFile(data), save=True)
                print(f"SUCCESS updated {p.name}")
                success_count += 1
            else:
                print(f"FAILED download for {p.name}")
        else:
            print(f"NOT FOUND: {name_part}")
            
    print(f"Done. Successfully updated {success_count} products.")

if __name__ == '__main__':
    main()
