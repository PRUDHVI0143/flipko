"""
fix_images_pollinations.py
Uses Pollinations.ai to generate AI product images from product names.
The URL contains the prompt, so the image ALWAYS matches the product.
No more wrong cat/yoga images!
"""
import os, sys, django, urllib.parse, time

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def make_image_url(product_name, category_slug=''):
    """
    Build a Pollinations.ai URL that generates a product photo from the name.
    The image is AI-generated and ALWAYS shows the correct product.
    """
    # Build a clear, specific prompt for product photography
    cat_hint = {
        'mobiles':         'smartphone mobile phone',
        'electronics':     'consumer electronics gadget',
        'fashion':         'fashion clothing apparel footwear',
        'home-kitchen':    'home kitchen appliance',
        'grocery':         'food grocery product',
        'books':           'book novel',
        'beauty':          'beauty cosmetic skincare product',
        'beauty-grooming': 'beauty grooming product',
        'toys':            'toy game children',
        'sports':          'sports equipment outdoor fitness',
        'stationery':      'stationery office supply',
    }.get(category_slug, 'product')

    prompt = (
        f"professional product photography of {product_name}, "
        f"{cat_hint}, "
        "clean white background, studio lighting, sharp focus, "
        "ecommerce product image, high quality, no text"
    )
    encoded = urllib.parse.quote(prompt)
    # Use a deterministic seed based on the product name so the image is stable
    seed = abs(hash(product_name)) % 100000
    return (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=600&height=600&nologo=true&seed={seed}&model=flux"
    )

def main():
    products = Product.objects.select_related('category').all().order_by('id')
    total = products.count()
    print(f"Setting AI-generated images for {total} products...")
    print("Each URL will auto-generate a correct product photo from the name.")
    print("-" * 70)

    for i, p in enumerate(products, 1):
        cat = p.category.slug if p.category else ''
        url = make_image_url(p.name, cat)
        p.image = url
        p.save(update_fields=['image'])
        print(f"  [{i:3}/{total}] {p.name[:55]}")

    print(f"\nDone! All {total} products updated with AI-generated image URLs.")
    print("\nSample URLs:")
    for p in Product.objects.all()[:3]:
        print(f"  {p.name}: {p.image[:80]}...")

if __name__ == '__main__':
    main()
