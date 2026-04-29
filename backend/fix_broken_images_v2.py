"""
Fix all broken product images using a reliable approach.
Uses a combination of verified Unsplash IDs and Pexels/Pixabay CDN URLs.
"""
import os
import django
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def test_url(url, timeout=10):
    """Test if a URL returns a valid image."""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        r = requests.get(url, timeout=timeout, headers=headers, stream=True)
        ct = r.headers.get('content-type', '')
        return r.status_code == 200 and ('image' in ct or 'octet' in ct)
    except:
        return False


# Step 1: Find all currently broken products
products = Product.objects.select_related('category').all()
broken = []
ok_count = 0

print("Scanning all 150 products for broken images...")
def check(p):
    if not p.image:
        return (p, False)
    return (p, test_url(p.image))

with ThreadPoolExecutor(max_workers=20) as ex:
    results = list(ex.map(check, products))

for p, is_ok in results:
    if is_ok:
        ok_count += 1
    else:
        broken.append(p)

print(f"  OK: {ok_count}, Broken: {len(broken)}")
print(f"\nBroken products:")
for p in broken:
    print(f"  - [{p.id}] {p.name} ({p.category.slug})")

# Step 2: Fix broken products with reliable image URLs
# Using images.pexels.com which has very reliable CDN URLs
# Also using picsum.photos as a last resort

# Map broken products to reliable image URLs
FIXES = {}

for p in broken:
    cat = p.category.slug
    name_lower = p.name.lower()
    
    # Category-specific reliable image mapping
    if cat == "mobiles":
        if "oppo" in name_lower or "reno" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80"
        elif "infinix" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"
        elif "realme" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "electronics":
        if "marshall" in name_lower or "speaker" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"
        elif "razer" in name_lower or "mouse" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "fashion":
        if "kurta" in name_lower or "biba" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80"
        elif "skechers" in name_lower or "walk" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80"
        elif "zara" in name_lower or "shirt" in name_lower or "linen" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1445205174239-1739707bc8b0?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "home-kitchen":
        if "air fryer" in name_lower or "philips" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80"
        elif "cookware" in name_lower or "pigeon" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1556909114-44e3e70034e4?auto=format&fit=crop&w=800&q=80"
        elif "mixer" in name_lower or "grinder" in name_lower or "bajaj" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1570222094714-4acbf9067988?auto=format&fit=crop&w=800&q=80"
        elif "chimney" in name_lower or "elica" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80"
        elif "vacuum" in name_lower or "eureka" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
        elif "dyson" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
        elif "otg" in name_lower or "oven" in name_lower or "morphy" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "grocery":
        if "oil" in name_lower or "fortune" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80"
        elif "salt" in name_lower or "tata" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
        elif "ghee" in name_lower or "amul" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80"
        elif "baby" in name_lower or "pampers" in name_lower or "wipes" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "books":
        if "naruto" in name_lower or "manga" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=80"
        elif "harry potter" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80"
        elif "rich dad" in name_lower or "money" in name_lower or "finance" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "beauty-grooming":
        if "cleanser" in name_lower or "forest" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80"
        elif "sunscreen" in name_lower or "neutrogena" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80"
        elif "tea tree" in name_lower or "body shop" in name_lower or "oil" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1608571423902-90fbf73b98e7?auto=format&fit=crop&w=800&q=80"
        elif "aftershave" in name_lower or "old spice" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "toys-games":
        if "lego" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80"
        elif "barbie" in name_lower or "dreamhouse" in name_lower or "doll" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
        elif "hot wheels" in name_lower or "car" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1581235707941-1e1cb5f2b088?auto=format&fit=crop&w=800&q=80"
        elif "jenga" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80"
        elif "teddy" in name_lower or "bear" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80"
        elif "remote control" in name_lower or "rc" in name_lower or "crawler" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        elif "pokemon" in name_lower or "trading card" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "sports-outdoor":
        if "table tennis" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80"
        elif "pump" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
    
    elif cat == "stationery":
        if "pen" in name_lower or "parker" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"
        elif "marker" in name_lower or "white board" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?auto=format&fit=crop&w=800&q=80"
        elif "correction" in name_lower or "tape" in name_lower:
            FIXES[p.name] = "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&w=800&q=80"
        else:
            FIXES[p.name] = "https://images.unsplash.com/photo-1456735190827-d1262f71b39a?auto=format&fit=crop&w=800&q=80"
    
    else:
        # Generic fallback
        FIXES[p.name] = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"


# Step 3: Verify all fix URLs work before applying
print(f"\nVerifying {len(FIXES)} replacement URLs...")
verified_fixes = {}
failed_fixes = []

def verify_fix(item):
    name, url = item
    ok = test_url(url)
    return (name, url, ok)

with ThreadPoolExecutor(max_workers=15) as ex:
    results = list(ex.map(verify_fix, FIXES.items()))

for name, url, ok in results:
    if ok:
        verified_fixes[name] = url
    else:
        failed_fixes.append((name, url))

print(f"  Verified OK: {len(verified_fixes)}, Still broken: {len(failed_fixes)}")

if failed_fixes:
    print(f"\n  Still-broken fix URLs:")
    for name, url in failed_fixes:
        print(f"    - {name}")

# Step 4: Apply verified fixes
print(f"\nApplying {len(verified_fixes)} fixes...")
applied = 0
for p in broken:
    if p.name in verified_fixes:
        p.image = verified_fixes[p.name]
        p.save()
        applied += 1
        print(f"  [FIXED] {p.name}")

# For any still-broken products, use a guaranteed fallback based on category
CATEGORY_FALLBACKS = {
    "mobiles": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
    "fashion": "https://images.unsplash.com/photo-1445205174239-1739707bc8b0?auto=format&fit=crop&w=800&q=80",
    "home-kitchen": "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80",
    "grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    "books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    "beauty-grooming": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
    "toys-games": "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80",
    "sports-outdoor": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    "stationery": "https://images.unsplash.com/photo-1456735190827-d1262f71b39a?auto=format&fit=crop&w=800&q=80",
}

for p in broken:
    if p.name not in verified_fixes:
        fallback = CATEGORY_FALLBACKS.get(p.category.slug, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80")
        p.image = fallback
        p.save()
        applied += 1
        print(f"  [FALLBACK] {p.name} -> category fallback")

print(f"\n{'='*60}")
print(f"  Fix complete: {applied} products updated")

# Final verification
print(f"\n{'='*60}")
print("Final verification of ALL products...")
all_products = Product.objects.all()
final_ok = 0
final_broken = []

def final_check(p):
    return (p.name, test_url(p.image) if p.image else False)

with ThreadPoolExecutor(max_workers=20) as ex:
    final_results = list(ex.map(final_check, all_products))

for name, ok in final_results:
    if ok:
        final_ok += 1
    else:
        final_broken.append(name)

print(f"  Final: {final_ok}/{all_products.count()} OK")
if final_broken:
    print(f"  Still broken: {final_broken}")
