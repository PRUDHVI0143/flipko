import urllib.request, json

BASE = "http://127.0.0.1:8080/api"

tests = [
    ("Products (paginated)",     f"{BASE}/products/?page=1&page_size=3"),
    ("Products search ?q=iphone", f"{BASE}/products/?q=iphone"),
    ("Products by category",     f"{BASE}/products/?category=mobiles&page_size=3"),
    ("Products price filter",    f"{BASE}/products/?min_price=500&max_price=2000&page_size=3"),
    ("Featured products",        f"{BASE}/products/featured/"),
    ("Trending products",        f"{BASE}/products/trending/?limit=5"),
    ("By category grouping",     f"{BASE}/products/by_category/"),
    ("Images list",              f"{BASE}/images/"),
    ("Image detail (id=1)",      f"{BASE}/images/1/"),
    ("Categories list",          f"{BASE}/categories/"),
]

for label, url in tests:
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            data = json.loads(r.read())
            if isinstance(data, dict):
                count = data.get('count', data.get('results') and len(data['results']))
                keys  = list(data.keys())
                print(f"  [OK] {label}")
                print(f"       keys={keys}, count={count}")
            else:
                print(f"  [OK] {label} -> list({len(data)} items)")
    except Exception as e:
        print(f"  [FAIL] {label}: {e}")

print("\nAll tests done!")
