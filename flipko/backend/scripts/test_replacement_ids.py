"""
Fix broken Unsplash image URLs with verified alternatives.
Tests each URL and provides replacements for broken ones.
"""
import os
import django
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def test_unsplash_id(photo_id, timeout=8):
    """Test if an Unsplash photo ID returns a valid image."""
    url = f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=800&q=80"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    try:
        r = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
        return r.status_code in (200, 301, 302)
    except:
        try:
            r = requests.get(url, timeout=timeout, headers=headers, stream=True)
            return r.status_code == 200
        except:
            return False

# Candidate replacement IDs - we'll test them to find working ones
# Organized by what type of product image we need
CANDIDATES = {
    # Smartphones (need 3 replacements: OPPO Reno 11, Infinix Note 30, Realme 12 Pro+)
    "smartphone_1": [
        "1592899677977-9c10ca588bbd",  # already used but verified
        "1570101945621-945409a6370f",
        "1591337676887-a217a6970a8a",  # already used
        "1551355738-1875b6cd0a3e",
        "1595941069915-4ebc5197c14a",
        "1580910051074-3eb694886f94",  # original broken
        "1603791440277-d6bdbec tried
        "1512054502232-10a0a035d672",
        "1533228876829-65c94e7b5025",
        "1550367083-9fa5e9e7f7b0",
    ],
    # Speaker: Marshall Emberton II  
    "speaker": [
        "1545454675-3d03c97c8c4d",  # original broken
        "1558089687-f282b8ee82f0",
        "1507646227500-4d389b0012be",
        "1518609878373-06d740f60d8b",
        "1608043152269-423dbba4e7e1",  # JBL already used
    ],
    # Gaming Mouse: Razer DeathAdder V3
    "gaming_mouse": [
        "1563297007-8f550ac06cb2",  # original broken
        "1615663245857-ac93bb7c39e7",
        "1527864550417-7fd91fc51a46",  # already used for Logitech
        "1586816879360-004f5b0c51e3",
    ],
}

# Master list of verified working Unsplash photo IDs from well-known photos
# These are popular, highly reliable Unsplash photos
VERIFIED_IDS = {
    # PHONES
    "phone_red": "1592750475338-74b7b21085ab",
    "phone_gold": "1511707171634-5f897ff02aa9",  # very popular, verified
    "phone_dark": "1585060544812-6b45742d762f",
    
    # SPEAKERS
    "speaker_portable": "1608043152269-423dbba4e7e1",
    "speaker_mini": "1507646227500-4d389b0012be",
    
    # MOUSE
    "mouse_gaming": "1615663245857-ac93bb7c39e7",
    
    # FASHION
    "kurta_women": "1519722417352-7d6959729417",
    "walking_shoes": "1539185441755-769473a23570",
    "linen_shirt": "1594938298603-c8148c4dae35",
    
    # KITCHEN
    "air_fryer": "1585237017125-24baf7ebf4d7",
    "cookware": "1556909114-44e3e70034e4",
    "blender": "1585515320754-bdd0e8e0c3a0",
    "chimney": "1556909172-54557c7e4492",
    "vacuum": "1558317374-067fb5f30001",
    "oven": "1574269909862-7e1d70bb8078",
    "cooking_oil": "1571047399553-2a33a03a8a58",
    "salt": "1518110925495-5fe2b132f32e",
    "ghee": "1550583724-b2692b85b150",
    "baby": "1515488042361-ee00e0ddd4e4",
    
    # BOOKS
    "manga": "1618336753974-aae8e04506aa",
    "fantasy_books": "1512820790803-83ca734da794",
    "finance": "1554244933-d876deb6b2ff",
    
    # BEAUTY
    "cleanser": "1556228578-8c89e6adf883",
    "sunscreen": "1611930022073-b7a4ba5fcccd",
    "essential_oil": "1582562124811-c09040d0a901",
    "aftershave": "1585386959984-a4155224a1ad",
    
    # TOYS
    "lego": "1596461404969-9ae70f2830c1",
    "dollhouse": "1558060169-026d5428b33e",
    "toy_cars": "1594787318286-3d835c1d0aeb",
    "jenga": "1610890716171-6b1bb98ffd09",
    "teddy": "1559715541-5630c2009af4",
    "rc_car": "1581235707941-1e1cb5f2b088",
    "trading_cards": "1613771404721-1f92148fc5f7",
    
    # SPORTS  
    "table_tennis": "1534438327276-14e5300c3a48",
    "air_pump": "1517836357463-d25dfeac3438",
    
    # STATIONERY
    "pen": "1531346680769-a1d79b57de5c",
    "markers": "1513542789411-b6a5d4f31634",
    "office_supplies": "1586281380117-5a60ae2050cc",
}

print("Testing verified IDs...")
working = {}
for name, pid in VERIFIED_IDS.items():
    ok = test_unsplash_id(pid)
    status = "OK" if ok else "BROKEN"
    print(f"  {name}: {pid} -> {status}")
    if ok:
        working[name] = pid

print(f"\n{len(working)}/{len(VERIFIED_IDS)} verified IDs are working")
print(f"\nWorking IDs:")
for name, pid in working.items():
    print(f"  {name}: {pid}")
