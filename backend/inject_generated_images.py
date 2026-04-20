import os
import shutil
import django
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Path to the generated images in the brain directory
# Replace with actual absolute paths provided by the tool
generated_images = {
    "iPhone 14": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\iphone_14_blue_real_1776418769201.png",
    "Galaxy S23": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\samsung_s23_green_real_1776418789387.png",
    "Pixel 7a": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\pixel_7a_charcoal_real_1776418806248.png",
    "Nothing Phone": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\nothing_phone_2_grey_real_1776418821995.png",
    "MacBook Air": r"C:\Users\prudh\.gemini\antigravity\brain\252a1d68-ad15-4969-bd15-34f6f3116def\macbook_air_m1_real_1776418839906.png"
}

def main():
    for name_part, img_path in generated_images.items():
        if not os.path.exists(img_path):
            print(f"File not found: {img_path}")
            continue
            
        p = Product.objects.filter(name__icontains=name_part).first()
        if p:
            print(f"Injecting AI image for {p.name}...")
            with open(img_path, 'rb') as f:
                img_data = f.read()
                
            if p.image:
                p.image.delete(save=False)
            
            file_name = f"{slugify(p.name)}_{p.id}.png"
            p.image.save(file_name, ContentFile(img_data), save=True)
            print(f"Successfully updated {p.name}")
        else:
            print(f"Product not found for: {name_part}")

if __name__ == '__main__':
    main()
