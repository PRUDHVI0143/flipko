import requests, sys, os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
import django; django.setup()

from products.models import Product
from concurrent.futures import ThreadPoolExecutor, as_completed

def check(p):
    if not p.image:
        return p.name, "NO_IMAGE", ""
    try:
        r = requests.head(p.image, timeout=10, allow_redirects=True,
                         headers={'User-Agent': 'Mozilla/5.0'})
        ct = r.headers.get('Content-Type', '')
        if r.status_code == 200 and 'image' in ct:
            return p.name, "OK", p.image
        else:
            return p.name, f"FAIL({r.status_code})", p.image
    except Exception as e:
        return p.name, f"ERR({str(e)[:30]})", p.image

products = list(Product.objects.all().order_by('id'))
print(f"Checking {len(products)} product image URLs...\n")

ok, broken = [], []
with ThreadPoolExecutor(max_workers=20) as ex:
    futures = {ex.submit(check, p): p for p in products}
    for f in as_completed(futures):
        name, status, url = f.result()
        if status == "OK":
            ok.append(name)
        else:
            broken.append((name, status, url))
        print(f"  [{status}] {name[:50]}")

print(f"\n{'='*60}")
print(f"RESULT: {len(ok)} OK, {len(broken)} broken")
if broken:
    print("\nBroken:")
    for name, status, url in broken:
        print(f"  {name}: {status}")
        print(f"    {url[:80]}")
