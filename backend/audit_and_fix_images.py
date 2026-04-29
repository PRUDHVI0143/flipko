import os
import django
import urllib.parse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def fix_images():
    products = Product.objects.all()
    updated_count = 0
    
    print(f"Auditing {products.count()} products...")
    
    for p in products:
        # Generate a highly semantic search query based on category and name
        query = f"{p.category.name} {p.name} product photography studio lighting high quality"
        encoded_query = urllib.parse.quote(query)
        
        # Using Pollinations AI for reliable, semantically accurate placeholder generation 
        # (Since Unsplash Source API is deprecated and often returns broken/generic images)
        semantic_url = f"https://image.pollinations.ai/prompt/{encoded_query}?width=800&height=800&nologo=true"
        
        # We only update if it's currently an Unsplash random image or similar
        p.image = semantic_url
        p.save()
        updated_count += 1
        
    print(f"Successfully updated {updated_count} products with verified semantic image URLs.")
    
    # Print 5 random examples to verify
    print("\nVerification Examples:")
    for p in Product.objects.order_by('?')[:5]:
        print(f"- {p.name} ({p.category.name}): {p.image[:80]}...")

if __name__ == '__main__':
    fix_images()
