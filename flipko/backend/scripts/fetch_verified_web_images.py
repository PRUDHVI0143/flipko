import os
import sys
import json
import urllib.parse
import urllib.request
import django
import requests

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product
from scripts.master_image_sync import IMAGE_MAP, unsplash_url

# Branded items we want to enrich with actual Wikimedia Commons photos
WIKIMEDIA_QUERIES = {
    "Apple iPhone 15 Pro": "iPhone 15 Pro",
    "Samsung Galaxy S24 Ultra": "Samsung Galaxy S24 Ultra",
    "Google Pixel 8 Pro": "Google Pixel 8",
    "Apple MacBook Air M2": "MacBook Air M2",
    "iPad Air 5th Gen": "iPad Air",
    "Sony Alpha 7 IV": "Sony Alpha 7",
    "Canon EOS R6 Mark II": "Canon EOS",
    "GoPro Hero 12": "GoPro",
    "Nike Air Jordan 1": "Air Jordan 1",
    "Vans Old Skool": "Vans Old Skool",
    "Adidas Originals Superstar": "Adidas Superstar",
    "Casio G-Shock Military": "G-Shock",
    "LEGO Classic Bricks Set": "LEGO bricks",
    "Rubik's Cube 3x3": "Rubik's Cube",
    "Monopoly Deluxe Board Game": "Monopoly board game",
    "Funskool Chess Set": "chess board",
}

def verify_url(url, timeout=5):
    """Verify that the URL returns 200 OK and is an image."""
    headers = {
        'User-Agent': 'FlipkoStore/1.0 (contact@flipko.com)',
        'Accept': 'image/*'
    }
    try:
        response = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
        if response.status_code == 200 and response.headers.get('Content-Type', '').startswith('image/'):
            return True
    except Exception:
        pass
    try:
        response = requests.get(url, timeout=timeout, headers=headers, stream=True, allow_redirects=True)
        if response.status_code == 200 and response.headers.get('Content-Type', '').startswith('image/'):
            return True
    except Exception:
        pass
    return False

def get_wikimedia_image(query):
    """Retrieve direct image URL from Wikimedia Commons."""
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json"
    headers = {
        'User-Agent': 'FlipkoStore/1.0 (contact@flipko.com) MediaWiki-API-Client'
    }
    try:
        req = urllib.request.Request(search_url, headers=headers)
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read().decode('utf-8'))
        
        search_results = data.get('query', {}).get('search', [])
        if not search_results:
            return None
            
        title = search_results[0].get('title')
        if not title:
            return None
            
        info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
        req2 = urllib.request.Request(info_url, headers=headers)
        resp2 = urllib.request.urlopen(req2, timeout=10)
        data2 = json.loads(resp2.read().decode('utf-8'))
        
        pages = data2.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            imageinfo = page_info.get('imageinfo', [])
            if imageinfo:
                url = imageinfo[0].get('url')
                # Filter out SVGs as they don't always render well in all browsers compared to PNG/JPG
                if url and not url.lower().endswith('.svg'):
                    return url
    except Exception as e:
        print(f"  [WIKIMEDIA ERROR] for '{query}': {e}")
    return None

def main():
    products = Product.objects.select_related('category').all().order_by('id')
    total = products.count()
    print(f"Synchronizing {total} product images with clean fallbacks and Wikimedia enrichment...")
    sys.stdout.flush()
    
    updated = 0
    
    for i, p in enumerate(products, 1):
        # Default fallback to clean curated Unsplash image
        fallback_photo_id = IMAGE_MAP.get(p.name, "1523275335684-37898b6baf30")
        target_url = unsplash_url(fallback_photo_id)
        image_source = "UNSPLASH"
        
        # Check if we should enrich with Wikimedia Commons photo
        wm_query = WIKIMEDIA_QUERIES.get(p.name)
        if wm_query:
            print(f"[{i}/{total}] Querying Wikimedia Commons for: '{p.name}'")
            sys.stdout.flush()
            wm_url = get_wikimedia_image(wm_query)
            if wm_url and verify_url(wm_url):
                target_url = wm_url
                image_source = "WIKIMEDIA"
                
        if p.image != target_url:
            p.image = target_url
            p.save(update_fields=['image'])
            updated += 1
            print(f"  -> [{image_source}] Updated: {p.name} -> {target_url[:80]}...")
        else:
            print(f"  -> [KEEP] {p.name}")
        sys.stdout.flush()
            
    print(f"\nDone! Image synchronization complete. Updated {updated} products.")
    sys.stdout.flush()

if __name__ == '__main__':
    main()
