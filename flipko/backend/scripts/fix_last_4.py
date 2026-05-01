"""Fix the last 4 broken images."""
import os, django, requests
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()
from products.models import Product

def test(url):
    try:
        r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'}, stream=True)
        ct = r.headers.get('content-type', '')
        return r.status_code == 200 and ('image' in ct or 'octet' in ct)
    except:
        return False

# Try multiple URLs for each broken product
CANDIDATES = {
    "Biba Women's Embroidered Kurta": [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    ],
    "Hot Wheels 20 Car Pack": [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d0aeb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581235707941-1e1cb5f2b088?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1559535332-db9971090158?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    ],
    "Soft Teddy Bear 30cm": [
        "https://images.unsplash.com/photo-1562040506-a9b32cb51b94?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563396983906-b3795482a59a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1559715541-5630c2009af4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1535572290543-960a8046f5af?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?auto=format&fit=crop&w=800&q=80",
    ],
    "Pokemon Trading Cards Box": [
        "https://images.unsplash.com/photo-1613771404721-1f92148fc5f7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606503153255-59d5e417c4ed?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1612404730960-5c71577fca11?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606503153255-59d5e417c4ed?auto=format&fit=crop&w=800&q=80",
    ],
}

for name, urls in CANDIDATES.items():
    p = Product.objects.filter(name=name).first()
    if not p:
        print(f"Product not found: {name}")
        continue
    
    fixed = False
    for url in urls:
        if test(url):
            p.image = url
            p.save()
            print(f"[FIXED] {name} -> {url[:60]}...")
            fixed = True
            break
    
    if not fixed:
        # Ultimate fallback - use a well-known working Unsplash image
        fallback_map = {
            "Biba Women's Embroidered Kurta": "https://images.unsplash.com/photo-1445205174239-1739707bc8b0?auto=format&fit=crop&w=800&q=80",
            "Hot Wheels 20 Car Pack": "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80",
            "Soft Teddy Bear 30cm": "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80",
            "Pokemon Trading Cards Box": "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80",
        }
        p.image = fallback_map[name]
        p.save()
        print(f"[FALLBACK] {name}")

# Final check
print("\nFinal check:")
for name in CANDIDATES.keys():
    p = Product.objects.filter(name=name).first()
    if p:
        ok = test(p.image)
        print(f"  {name}: {'OK' if ok else 'BROKEN'}")
