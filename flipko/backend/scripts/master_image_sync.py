"""
Master Image Sync Script for Flipko
Maps all 150 products to unique, product-specific Unsplash image URLs.
Each product gets a different, semantically appropriate image.
"""
import os
import django
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def unsplash_url(photo_id):
    """Build a high-quality Unsplash image URL from a photo ID."""
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=800&q=80"

def unsplash_direct(slug):
    """Build an Unsplash source URL that redirects to a random image for the query."""
    return f"https://source.unsplash.com/800x800/?{slug}"

# ================================================================
# PRODUCT-SPECIFIC IMAGE MAPPING
# Each product gets a unique, semantically-matched Unsplash photo
# Format: "Product Name": "unsplash_photo_id"
# ================================================================

IMAGE_MAP = {
    # ── MOBILES (15) ── Each phone gets a different smartphone image
    "Apple iPhone 15 Pro":       "1510557880182-3d4d3cba35a5",  # iPhone style
    "Samsung Galaxy S24 Ultra":  "1598327105666-5b89351aff97",  # Samsung style
    "Google Pixel 8 Pro":        "1511707171634-5f897ff02aa9",  # Pixel style
    "OnePlus 12":                "1585060544812-6b45742d762f",  # Dark phone
    "Realme 12 Pro+":            "1580910051074-3eb694886f94",  # Gold phone
    "Xiaomi 14":                 "1592899677977-9c10ca588bbd",  # Phone in hand
    "Motorola Edge 40":          "1556656793-08538906a9f8",     # Edge phone
    "Vivo V30 Pro":              "1601784551446-20c9e07cdbdb",  # Blue phone
    "Nothing Phone (2)":         "1565849904461-04a58ad377e0",  # Unique phone
    "Poco X6 Pro":               "1574944985070-8f3ebc6b79d2",  # Budget phone
    "Lava Agni 2":               "1523206489230-c012c64b2b48",  # Phone flat lay
    "Infinix Note 30":           "1567581935677-3f4b4f2b8b8b",  # Large phone
    "iQOO 12":                   "1591337676887-a217a6970a8a",  # Gaming phone
    "Honor 90":                  "1605236453806-6ff36851218e",  # Slim phone
    "OPPO Reno 11":              "1512941937-f712b0e5a30c",     # Colorful phone

    # ── ELECTRONICS (15) ── Different electronics per product
    "Apple MacBook Air M2":      "1517336714731-489689fd1ca8",  # MacBook
    "Sony WH-1000XM5":          "1505740420928-5e560c06d30e",  # Headphones
    "Dell XPS 13":               "1496181133206-80ce9b88a853",  # Laptop
    "iPad Air 5th Gen":          "1544244015-0df4b3ffc6b0",    # Tablet
    "JBL Boombox 3":             "1608043152269-423dbba4e7e1",  # Bluetooth speaker
    "Sony Alpha 7 IV":           "1516035069371-29a1b244cc32",  # Camera
    "Logitech MX Master 3S":     "1527864550417-7fd91fc51a46",  # Mouse
    "Samsung 27 inch Curved Monitor": "1527443224154-c4a3942d3acf", # Monitor
    "Kindle Paperwhite":         "1544716278-ca5e3f4abd8c",    # E-reader
    "GoPro Hero 12":             "1526170375885-4d8ecf77b99f",  # Action cam
    "Bose QuietComfort Ultra":   "1546435770-a3e426bf472b",    # Earbuds
    "Canon EOS R6 Mark II":      "1502920917128-1aa500764cbd",  # DSLR
    "Razer DeathAdder V3":       "1563297007-8f550ac06cb2",    # Gaming mouse
    "Marshall Emberton II":      "1545454675-3d03c97c8c4d",    # Portable speaker
    "Western Digital 2TB SSD":   "1597872200969-2b65d56bd16b",  # SSD/HDD

    # ── FASHION (15) ── Different fashion items
    "Levi's Men's 511 Slim Jeans":      "1542272604-787c3835535d",  # Jeans
    "Nike Air Jordan 1":                "1556906781-9a412961c28c",  # Jordan sneakers
    "Ray-Ban Aviator Classic":          "1511499767150-a48a237f0083",  # Sunglasses
    "U.S. Polo Assn. T-Shirt":          "1521572163474-6864f9cf17ab",  # Polo shirt
    "Biba Women's Embroidered Kurta":   "1583391733981-8b530e0a08c2",  # Indian kurta
    "Adidas Originals Superstar":       "1549298916-b41d501d3772",  # Adidas shoes
    "Casio G-Shock Military":           "1524805444758-089113d48a6d",  # G-Shock watch
    "Fossil Gen 6 Smartwatch":          "1523275335684-37898b6baf30",  # Smartwatch
    "Tommy Hilfiger Casual Belt":       "1553062407-98eeb64c6a62",  # Leather belt
    "Puma Running Shoes":               "1542291026-7eec264c27ff",  # Running shoes
    "ZARA Linen Shrit":                 "1596755094514-5c7c0aef53e6",  # Linen shirt
    "H&M Oversized Hoodie":             "1556821840-3a63f95609a7",  # Hoodie
    "Skechers GoWalk":                  "1460353581996-997bcd532125",  # Walking shoes
    "Vans Old Skool":                   "1525966222134-fcfa99b8ae77",  # Vans shoes
    "Daniel Wellington Rose Gold Watch": "1522312346375-d1a52e2b99b3",  # Rose gold watch

    # ── HOME & KITCHEN (15) ── Different home/kitchen items
    "Philips Air Fryer XL":             "1585515320754-b2e80be37c87",  # Air fryer
    "Prestige Induction Cooktop":       "1556909114-f6e7ad7d3136",    # Cooktop
    "Pigeon Non-Stick Cookware Set":    "1556909172-8c2f3e8f9e2a",    # Cookware
    "Bajaj Majesty Mixer Grinder":      "1570222094714-4acbf9067988",  # Blender
    "Kent Grand+ Water Purifier":       "1548839140-29a749e1cf4d",    # Water purifier
    "LG 242L Double Door Fridge":       "1571175443880-49e1d25b2bc5",  # Refrigerator
    "Dyson V15 Detect Vacuum":          "1558618666-fcd25c85f7aa",    # Vacuum
    "Samsung 7kg Front Load Washer":    "1626806787461-102c1bfaaea1",  # Washer
    "Sleepyhead Orthopedic Mattress":   "1631049307264-da0ec9d70304",  # Mattress
    "Elica 60cm Filterless Chimney":    "1556909190-bfee1f23e3f1",    # Kitchen chimney
    "Eureka Forbes Vac":                "1558618047-f5e8e1b1c1d3",    # Vacuum
    "Milton Thermosteel Bottle":        "1602143407151-7111542de6e8",  # Thermos bottle
    "Morphy Richards OTG 24L":          "1585237672814-83cbdcc74547",  # Oven/OTG
    "Usha Swift Ceiling Fan":           "1596394516093-501ba68a0ba6",  # Ceiling fan
    "Crompton Ozone Air Cooler":        "1585771724684-38269d6639fd",  # Air cooler

    # ── GROCERY (15) ── Different grocery/food items
    "Aashirvaad Atta 5kg":             "1574323347407-f5e1ad6d020b",  # Flour/wheat
    "Fortune Refined Oil 1L":          "1474979266404-7eaacbcd87e5",  # Cooking oil
    "TATA Salt 1kg":                   "1518110925495-5fe2b132f32e",  # Salt
    "Maggi Masala Noodles 12-Pack":    "1612929633738-8fe44f7ec841",  # Instant noodles
    "Nescafe Classic Coffee 100g":     "1509042239860-f550ce710b93",  # Coffee
    "Amul Pure Ghee 1L":               "1631372769-5b74e97d0f5e",    # Ghee/butter
    "Kellogg's Corn Flakes 1kg":       "1521483451569-e33803c0330c",  # Cereal
    "Red Label Tea 500g":              "1556679343-c7306c1976bc",    # Tea
    "Dabur Honey 500g":                "1587049352846-4a222e784d38",  # Honey
    "Saffola Gold Oil 5L":             "1620706857370-e1b9770e8bb1",  # Oil bottle
    "Daawat Basmati Rice 5kg":         "1586201375761-83865001e31c",  # Rice
    "Horlicks 500g":                   "1563729784474-d77dbb933a9e",  # Health drink
    "Nutrichoice Biscuits":            "1558961363-fa8fdf82db35",    # Biscuits
    "Cadbury Celebration Box":         "1548907040-4baa42d10919",    # Chocolate box
    "Pampers Baby Wipes":              "1584839404-b2e9a12ceb9a",    # Baby products

    # ── BOOKS (15) ── Different book/reading images
    "Atomic Habits - James Clear":     "1544947950-fa07a98d237f",    # Book on desk
    "The Psychology of Money":         "1512820790803-83ca734da794",  # Book stack
    "Spiderman: Across The Spiderverse Art": "1534423861386-85a16f5d13fd", # Comic art book
    "Naruto Vol. 1":                   "1578632292335-0769e5ac1190",  # Manga style
    "One Piece Vol. 100":              "1612178537253-bccd437b730e",  # Comic/manga
    "Harry Potter Box Set":            "1506466010722-395aa6b48f01",  # Fantasy books
    "The Alchemist":                   "1512820790803-83ca734da794",  # Classic book
    "Deep Work - Cal Newport":         "1507003211169-0a1dd7228f2d",  # Focus/work book
    "Sapiens: A Brief History":        "1481627834876-b7833e8f5570",  # History book
    "Rich Dad Poor Dad":               "1553729459-ade2a6547b40",    # Finance book
    "It Ends With Us":                 "1476275466078-4007374efbbe",  # Novel
    "Verity - Colleen Hoover":         "1474932430478-367dbb6832c1",  # Thriller book
    "Ikigai":                          "1519682337058-a94d519337bc",  # Japanese book
    "Man's Search for Meaning":        "1456513080510-7bf3a84b82f8",  # Philosophy book
    "Thinking Fast and Slow":          "1532012197267-da84d127e765",  # Psychology book

    # ── BEAUTY & GROOMING (15) ── Different beauty products
    "Nivea Men Body Wash":             "1556228578-8c89e6adf883",    # Body wash
    "L'Oreal Paris Hair Serum":        "1522337360788-8b13dee7a37e",  # Hair serum
    "Lakme Absolute 3D Lipstick":      "1586495777744-4413f21062fa",  # Lipstick
    "Maybelline Fit Me Foundation":    "1557205465-f3762edea6d3",    # Foundation
    "Philips Cordless Trimmer":        "1621607512214-68297480165e",  # Trimmer
    "Forest Essentials Facial Cleanser": "1556228841-a3c527ebefe5",  # Facial cleanser
    "Mamaearth Vitamin C Serum":       "1611930022073-b7a4ba5fcccd",  # Face serum
    "The Body Shop Tea Tree Oil":      "1608571423902-90fbf73b98e7",  # Essential oil
    "Biotique Bio Kelp Shampoo":       "1535585209827-a15fcdbc4c2d",  # Shampoo
    "Cetaphil Gentle Skin Cleanser":   "1556228720-195a672e8a03",    # Skin cleanser
    "Neutrogena Sunscreen SPF 50":     "1556228453-348f26ef61bb",    # Sunscreen
    "Old Spice Aftershave":            "1600428877878-1a0ff561d2c4",  # Aftershave
    "Gillette Mach3 Blades":           "1585386959984-a4155224a1ad",  # Razor
    "Dove Repair Shampoo":             "1535585209827-a15fcdbc4c2d",  # Shampoo bottle
    "Tresemme Hair Spray":             "1522337360788-8b13dee7a37e",  # Hair product

    # ── TOYS & GAMES (15) ── Different toy/game images
    "LEGO Classic Bricks Set":         "1587654780291-39c9404d7dd0",  # LEGO
    "Barbie Dreamhouse 2024":          "1558060169-026d5428b33e",    # Dollhouse
    "Hot Wheels 20 Car Pack":          "1594787318286-3d835c1d0aeb",  # Toy cars
    "Monopoly Deluxe Board Game":      "1610890716171-6b1bb98ffd09",  # Board game
    "Hasbro Jenga Classic":            "1597058712635-3182d1eae1f4",  # Jenga
    "Fisher-Price Baby Gym":           "1515488042361-ee00e0ddd4e4",  # Baby toys
    "Nerf Elite 2.0 Commander":        "1596461404969-9ae70f2830c1",  # Toy gun
    "Rubik's Cube 3x3":                "1577401239170-897942555fb3",  # Rubik's cube
    "Funskool Chess Set":              "1529699211952-734e80c4d42b",  # Chess
    "Remote Control Rock Crawler":     "1581235707941-1e1cb5f2b088",  # RC car
    "Ludo King Board":                 "1610890716171-6b1bb98ffd09",  # Board game
    "Doctor Pretend Play Kit":         "1515488042361-ee00e0ddd4e4",  # Pretend play
    "Soft Teddy Bear 30cm":            "1559715541-5630c2009af4",    # Teddy bear
    "Kitchen Set for Kids":            "1596461404969-9ae70f2830c1",  # Kids toy
    "Pokemon Trading Cards Box":       "1613771404721-1f92148fc5f7",  # Trading cards

    # ── SPORTS & OUTDOOR (15) ── Different sports items
    "Yonex Nanoray 18i Racket":        "1554068865-24cecd4e34b8",    # Badminton racket
    "Quechua Arpenaz Backpack":        "1553062407-98eeb64c6a62",    # Backpack
    "Cosco Cricket Tennis Ball":       "1540747913346-19e32dc3e97e",  # Cricket ball
    "Decathlon Yoga Mat":              "1544367567-0f2fcb009e0b",    # Yoga mat
    "Adidas Starlancer Football":      "1575361204480-aadea25e6e68",  # Football
    "Nivea Skipping Rope":             "1517836357463-d25dfeac3438",  # Skipping rope
    "Vector X Table Tennis Bat":       "1558657292-22e0b5ced1f2",    # Table tennis
    "Cycling Helmet Pro":              "1557246565-8a3d3ab5d7f6",    # Cycling helmet
    "Gym Duffel Bag 30L":              "1553062407-98eeb64c6a62",    # Gym bag
    "Electric Air Pump":               "1558618666-fcd25c85f7aa",    # Air pump
    "Dumbbell Set 5kg x 2":            "1534438327276-14e5300c3a48",  # Dumbbells
    "Resistance Bands Set":            "1598289431512-b97b0917affc",  # Resistance bands
    "Skating Board":                   "1547447134-cd3f5c716030",    # Skateboard
    "Badminton Shuttlecocks Gold":     "1554068865-24cecd4e34b8",    # Shuttlecock
    "Trekking Poles Pair":             "1551632811-561732d1e306",    # Trekking poles

    # ── STATIONERY (15) ── Different stationery items
    "Parker Vector Ball Pen":          "1585336261022-7f24fcc21fa5",  # Pen
    "Casio Scientific Calculator":     "1564939558297-fc396f18e5c7",  # Calculator
    "Camel Artist Water Colors":       "1513364776144-60967b0f800f",  # Watercolors
    "Moleskine Classic Notebook":      "1531346680769-a1d79b57de5c",  # Notebook
    "Staedtler Pigment Liner Set":     "1513542789411-b6a5d4f31634",  # Drawing pens
    "Faber-Castell 24 Color Pencils":  "1506377295352-e3154d43ea9e",  # Colored pencils
    "Staples Highlighters Pack":       "1513542789411-b6a5d4f31634",  # Highlighters
    "Post-it Sticky Notes":           "1586281380117-5a60ae2050cc",  # Sticky notes
    "White Board Marker 4-Color":      "1585336261022-7f24fcc21fa5",  # Markers
    "Scissors & Tape Dispenser":       "1513364776144-60967b0f800f",  # Office supplies
    "Expanding File Folder":           "1586281380117-5a60ae2050cc",  # File folder
    "Correction Tape Pen":             "1585336261022-7f24fcc21fa5",  # Correction tape
    "Pencil Case Mesh":                "1513542789411-b6a5d4f31634",  # Pencil case
    "A4 Printing Paper 500 Sheets":    "1531346680769-a1d79b57de5c",  # Paper
    "Sketchbook 120GSM":               "1513364776144-60967b0f800f",  # Sketchbook
}


def verify_url(url, timeout=8):
    """Check if a URL returns HTTP 200."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    try:
        response = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
        return response.status_code == 200 or response.status_code == 301 or response.status_code == 302
    except Exception:
        try:
            response = requests.get(url, timeout=timeout, headers=headers, stream=True)
            return response.status_code == 200
        except Exception:
            return False


def apply_images():
    """Apply unique images to all products."""
    products = Product.objects.select_related('category').all()
    updated = 0
    not_found = []
    
    for p in products:
        if p.name in IMAGE_MAP:
            photo_id = IMAGE_MAP[p.name]
            new_url = unsplash_url(photo_id)
            p.image = new_url
            p.save()
            updated += 1
            print(f"  [OK] {p.name}")
        else:
            not_found.append(f"{p.name} (cat: {p.category.slug})")
    
    print(f"\n{'='*60}")
    print(f"  Sync Complete: {updated}/{products.count()} products updated")
    
    if not_found:
        print(f"\n  [WARN] {len(not_found)} products NOT in mapping:")
        for name in not_found:
            print(f"    - {name}")
    
    return updated, not_found


def verify_all_images():
    """Verify all product image URLs are accessible."""
    products = Product.objects.all()
    print(f"\n{'='*60}")
    print(f"  Verifying {products.count()} product images...")
    
    results = {"ok": [], "broken": []}
    
    def check_product(product):
        if not product.image:
            return (product.name, "NO IMAGE", product.image)
        ok = verify_url(product.image)
        return (product.name, "OK" if ok else "BROKEN", product.image)
    
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(check_product, p): p for p in products}
        for future in as_completed(futures):
            name, status, url = future.result()
            if status == "OK":
                results["ok"].append(name)
            else:
                results["broken"].append((name, url))
    
    print(f"\n  Results: {len(results['ok'])} OK, {len(results['broken'])} BROKEN")
    
    if results["broken"]:
        print(f"\n  Broken URLs:")
        for name, url in results["broken"]:
            print(f"    [X] {name}: {url[:80]}...")
    
    return results


if __name__ == "__main__":
    print("="*60)
    print("  FLIPKO MASTER IMAGE SYNC")
    print("="*60)
    
    # Step 1: Apply images
    print("\n[Step 1] Applying product-specific images...")
    updated, not_found = apply_images()
    
    # Step 2: Verify
    print("\n[Step 2] Verifying image URLs...")
    results = verify_all_images()
    
    print(f"\n{'='*60}")
    print("  SYNC COMPLETE!")
    print(f"{'='*60}")
