import os
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Mapping of product name keywords to generated image paths
# Replace with actual absolute paths from the tool output
generated_images = {
    "Samsung Galaxy M34": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\samsung_m34_top_1776437080414.png",
    "JBL Go 3": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\jbl_go3_top_1776437096962.png",
    "Atomic Habits": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\atomic_habits_top_1776437111448.png",
    "Maybelline Fit Me": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\maybelline_foundation_top_1776437128056.png",
    "Naruto Volume 1": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\naruto_vol1_top_1776437144936.png"
}

def main():
    for name_part, img_path in generated_images.items():
        if not os.path.exists(img_path):
            print(f"Path not found: {img_path}")
            continue
            
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Injecting premium AI image for {p.name}...")
            if p.image:
                p.image.delete(save=False)
            with open(img_path, 'rb') as f:
                p.image.save(f"{slugify(p.name)}_{p.id}.png", ContentFile(f.read()), save=True)
            print(f"Successfully updated image for {p.name}")
        else:
            print(f"Product not found for: {name_part}")

if __name__ == '__main__':
    main()
