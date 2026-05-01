import os
import django
import requests
from concurrent.futures import ThreadPoolExecutor

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# TOP VERIFIED UNSPLASH CATEGORY FALLBACKS
UNSPLASH_MAP = {
    "mobiles": "1511707171634-5f897ff02aa9",
    "electronics": "1498049794561-7780e7231661",
    "fashion": "1445205174239-1739707bc8b0",
    "home-kitchen": "1527011046414-4781f1f94f8c",
    "grocery": "1542838132-92c53300491e",
    "books": "1495446815901-a7297e633e8d",
    "beauty-grooming": "1522338242992-e1a54906a8da",
    "toys-games": "1531279554141-1da1747854e1",
    "sports-outdoor": "1461896836934-ffe607ba8211",
    "stationery": "1456735190827-d1262f71b39a",
}

def get_u(pid):
    return f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w=800&q=80"

def check_and_fix(product):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    try:
        # Use GET instead of HEAD for Amazon compatibility
        response = requests.get(product.image, timeout=5, headers=headers, stream=True)
        if response.status_code == 200:
            return product.name, "OK"
        else:
            # Fix with Unsplash
            fallback_id = UNSPLASH_MAP.get(product.category.slug, "1505740420928-5e560c06d30e")
            product.image = get_u(fallback_id)
            product.save()
            return product.name, f"FIXED ({response.status_code})"
    except Exception as e:
        fallback_id = UNSPLASH_MAP.get(product.category.slug, "1505740420928-5e560c06d30e")
        product.image = get_u(fallback_id)
        product.save()
        return product.name, f"FIXED (Error: {str(e)})"

def master_audit_and_fix():
    products = Product.objects.all()
    print(f"Auditing and Fixing {products.count()} products...")
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = list(executor.map(check_and_fix, products))
    
    for name, status in results:
        if "FIXED" in status:
            print(f"- {name}: {status}")
            
    fixed_count = len([r for r in results if "FIXED" in r[1]])
    print(f"\nAudit Complete. Total: {len(results)}, Fixed: {fixed_count}")

if __name__ == "__main__":
    master_audit_and_fix()
