import requests, urllib.parse

product_name = "Cycling Helmet Pro"
prompt = f"professional product photography of {product_name}, sports equipment outdoor fitness, clean white background, studio lighting, sharp focus, ecommerce product image, high quality, no text"
seed = abs(hash(product_name)) % 100000
encoded = urllib.parse.quote(prompt)
url = f"https://image.pollinations.ai/prompt/{encoded}?width=600&height=600&nologo=true&seed={seed}&model=flux"
print(f"URL: {url[:120]}...")

try:
    r = requests.get(url, timeout=30, stream=True, allow_redirects=True)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type', '?')}")
    print(f"Content-Length: {r.headers.get('Content-Length', '?')}")
    if r.status_code == 200:
        print("SUCCESS - Image URL is working!")
    else:
        print(f"FAILED with status {r.status_code}")
except Exception as e:
    print(f"ERROR: {e}")
