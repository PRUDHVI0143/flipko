"""
patch_remaining_images.py — Apply specific images to all remaining products
that previously got category-level fallbacks.
"""
import os, sys, django

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

PATCH = {
    # MOBILES
    "Xiaomi 14":                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    "Motorola Edge 40":             "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80",
    "Nothing Phone (2)":            "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    "Poco X6 Pro":                  "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    "Lava Agni 2":                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "Infinix Note 30":              "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80",
    "iQOO 12":                      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    "Honor 90":                     "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    "OPPO Reno 11":                 "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",

    # ELECTRONICS
    "Dell XPS 13":                  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80",
    "JBL Boombox 3":                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    "Samsung 27 inch Curved Monitor":"https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=800&q=80",
    "Bose QuietComfort Ultra":      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    "Razer DeathAdder V3":          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "Marshall Emberton II":         "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    "Western Digital 2TB SSD":      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",

    # FASHION
    "Levi's Men's 511 Slim Jeans":  "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    "U.S. Polo Assn. T-Shirt":      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
    "Biba Women's Embroidered Kurta":"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    "Fossil Gen 6 Smartwatch":      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "Tommy Hilfiger Casual Belt":   "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "Puma Running Shoes":           "https://images.unsplash.com/photo-1608231387042-66d1773d3028?auto=format&fit=crop&w=800&q=80",
    "ZARA Linen Shrit":             "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "Skechers GoWalk":              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "Daniel Wellington Rose Gold Watch": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",

    # HOME & KITCHEN
    "Philips Air Fryer XL":         "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    "Prestige Induction Cooktop":   "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80",
    "Pigeon Non-Stick Cookware Set":"https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80",
    "Bajaj Majesty Mixer Grinder":  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    "Kent Grand+ Water Purifier":   "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    "LG 242L Double Door Fridge":   "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
    "Samsung 7kg Front Load Washer":"https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80",
    "Sleepyhead Orthopedic Mattress":"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    "Elica 60cm Filterless Chimney":"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
    "Eureka Forbes Vac":            "https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?auto=format&fit=crop&w=800&q=80",
    "Morphy Richards OTG 24L":      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    "Usha Swift Ceiling Fan":       "https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?auto=format&fit=crop&w=800&q=80",
    "Crompton Ozone Air Cooler":    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",

    # GROCERY
    "Fortune Refined Oil 1L":       "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    "Maggi Masala Noodles 12-Pack": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    "Nescafe Classic Coffee 100g":  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    "Amul Pure Ghee 1L":            "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
    "Kellogg's Corn Flakes 1kg":    "https://images.unsplash.com/photo-1545296664-39db72996d6a?auto=format&fit=crop&w=800&q=80",
    "Red Label Tea 500g":           "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    "Dabur Honey 500g":             "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    "Saffola Gold Oil 5L":          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    "Daawat Basmati Rice 5kg":      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    "Horlicks 500g":                "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    "Nutrichoice Biscuits":         "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    "Cadbury Celebration Box":      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80",
    "Pampers Baby Wipes":           "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",

    # BOOKS
    "Spiderman: Across The Spiderverse Art": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80",
    "Naruto Vol. 1":                "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80",
    "One Piece Vol. 100":           "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&w=800&q=80",
    "Deep Work - Cal Newport":      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    "Sapiens: A Brief History":     "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    "It Ends With Us":              "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    "Verity - Colleen Hoover":      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
    "Man's Search for Meaning":     "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    "Thinking Fast and Slow":       "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80",

    # BEAUTY
    "Nivea Men Body Wash":          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "L'Oreal Paris Hair Serum":     "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "Lakme Absolute 3D Lipstick":   "https://images.unsplash.com/photo-1586495777744-4e6232bf2cd3?auto=format&fit=crop&w=800&q=80",
    "Philips Cordless Trimmer":     "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
}

def main():
    updated = 0
    not_found = []
    for name, url in PATCH.items():
        try:
            p = Product.objects.get(name=name)
            p.image = url
            p.save(update_fields=['image'])
            updated += 1
            print(f"  [OK] {p.name}")
        except Product.DoesNotExist:
            not_found.append(name)
        except Product.MultipleObjectsReturned:
            products = Product.objects.filter(name=name)
            for p in products:
                p.image = url
                p.save(update_fields=['image'])
                updated += 1
            print(f"  [OK] {name} (x{products.count()})")

    print(f"\nDone! Patched {updated} products.")
    if not_found:
        print(f"Not found in DB: {not_found}")

if __name__ == '__main__':
    print("Patching remaining product images...")
    main()
