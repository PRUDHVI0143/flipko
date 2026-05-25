import os
import sys
import django
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def restore_images():
    # Use the path relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    mapping_path = os.path.join(os.path.dirname(script_dir), 'resources', 'product_image_mapping.json')
    
    if not os.path.exists(mapping_path):
        print(f"Error: Mapping file not found at {mapping_path}")
        return

    with open(mapping_path, 'r', encoding='utf-8') as f:
        mapping = json.load(f)

    print(f"Found {len(mapping)} mappings in {mapping_path}")
    
    updated_count = 0
    not_found_count = 0
    
    for name, image_url in mapping.items():
        # Try exact match first, then icontains
        products = Product.objects.filter(name=name)
        if not products.exists():
            products = Product.objects.filter(name__icontains=name)
            
        if products.exists():
            # Update all matching products
            for p in products:
                if p.image != image_url:
                    p.image = image_url
                    p.save()
                    updated_count += 1
                    print(f"[UPDATED] {p.name}")
                else:
                    print(f"[ALREADY CORRECT] {p.name}")
        else:
            print(f"[NOT FOUND] {name}")
            not_found_count += 1

    print("\n--- Restore Complete ---")
    print(f"Total mappings processed: {len(mapping)}")
    print(f"Products updated: {updated_count}")
    print(f"Mappings not found in DB: {not_found_count}")

if __name__ == "__main__":
    restore_images()
