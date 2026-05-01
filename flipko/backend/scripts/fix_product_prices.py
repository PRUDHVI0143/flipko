"""
fix_product_prices.py  -  Run from backend/ folder:
    ..\venv\Scripts\python.exe fix_product_prices.py
Sets realistic Indian market prices (INR) for all 150 products.
"""
import os, sys, django
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()
from products.models import Product
from decimal import Decimal

# Realistic Indian market prices in INR
PRICES = {
    # ── MOBILES ──────────────────────────────────────────────────────────────
    "Apple iPhone 15 Pro":            134900,
    "Samsung Galaxy S24 Ultra":       129999,
    "Google Pixel 8 Pro":              99999,
    "OnePlus 12":                      64999,
    "Realme 12 Pro+":                  29999,
    "Xiaomi 14":                       69999,
    "Motorola Edge 40":                24999,
    "Vivo V30 Pro":                    49999,
    "Nothing Phone (2)":               44999,
    "Poco X6 Pro":                     26999,
    "Lava Agni 2":                     19999,
    "Infinix Note 30":                 14999,
    "iQOO 12":                         52999,
    "Honor 90":                        34999,
    "OPPO Reno 11":                    29999,

    # ── ELECTRONICS ──────────────────────────────────────────────────────────
    "Apple MacBook Air M2":           114900,
    "Sony WH-1000XM5":                 29990,
    "Dell XPS 13":                    104990,
    "iPad Air 5th Gen":                59900,
    "JBL Boombox 3":                   29999,
    "Sony Alpha 7 IV":                259990,
    "Logitech MX Master 3S":            9995,
    "Samsung 27 inch Curved Monitor":  24990,
    "Kindle Paperwhite":               14999,
    "GoPro Hero 12":                   39500,
    "Bose QuietComfort Ultra":         32000,
    "Canon EOS R6 Mark II":           239995,
    "Razer DeathAdder V3":              8499,
    "Marshall Emberton II":            13999,
    "Western Digital 2TB SSD":         14999,

    # ── FASHION ──────────────────────────────────────────────────────────────
    "Levi's Men's 511 Slim Jeans":      3499,
    "Nike Air Jordan 1":               12995,
    "Ray-Ban Aviator Classic":          9990,
    "U.S. Polo Assn. T-Shirt":          1299,
    "Biba Women's Embroidered Kurta":   2499,
    "Adidas Originals Superstar":       8999,
    "Casio G-Shock Military":           6995,
    "Fossil Gen 6 Smartwatch":         24995,
    "Tommy Hilfiger Casual Belt":       2995,
    "Puma Running Shoes":               4999,
    "ZARA Linen Shrit":                 2990,
    "H&M Oversized Hoodie":             1999,
    "Skechers GoWalk":                  5999,
    "Vans Old Skool":                   6995,
    "Daniel Wellington Rose Gold Watch": 12995,

    # ── HOME & KITCHEN ────────────────────────────────────────────────────────
    "Philips Air Fryer XL":             9495,
    "Prestige Induction Cooktop":       2995,
    "Pigeon Non-Stick Cookware Set":    1999,
    "Bajaj Majesty Mixer Grinder":      3299,
    "Kent Grand+ Water Purifier":      14900,
    "LG 242L Double Door Fridge":      27490,
    "Dyson V15 Detect Vacuum":         52900,
    "Samsung 7kg Front Load Washer":   37990,
    "Sleepyhead Orthopedic Mattress":  19999,
    "Elica 60cm Filterless Chimney":   12999,
    "Eureka Forbes Vac":                5490,
    "Milton Thermosteel Bottle":          799,
    "Morphy Richards OTG 24L":          6995,
    "Usha Swift Ceiling Fan":           2299,
    "Crompton Ozone Air Cooler":        9499,

    # ── GROCERY ──────────────────────────────────────────────────────────────
    "Aashirvaad Atta 5kg":               290,
    "Fortune Refined Oil 1L":            155,
    "TATA Salt 1kg":                      28,
    "Maggi Masala Noodles 12-Pack":      199,
    "Nescafe Classic Coffee 100g":       299,
    "Amul Pure Ghee 1L":                 695,
    "Kellogg's Corn Flakes 1kg":         399,
    "Red Label Tea 500g":                285,
    "Dabur Honey 500g":                  249,
    "Saffola Gold Oil 5L":               799,
    "Daawat Basmati Rice 5kg":           599,
    "Horlicks 500g":                     345,
    "Nutrichoice Biscuits":               99,
    "Cadbury Celebration Box":           499,
    "Pampers Baby Wipes":                399,

    # ── BOOKS ─────────────────────────────────────────────────────────────────
    "Atomic Habits - James Clear":       399,
    "The Psychology of Money":           349,
    "Spiderman: Across The Spiderverse Art": 599,
    "Naruto Vol. 1":                     299,
    "One Piece Vol. 100":                399,
    "Harry Potter Box Set":             3499,
    "The Alchemist":                     199,
    "Deep Work - Cal Newport":           399,
    "Sapiens: A Brief History":          499,
    "Rich Dad Poor Dad":                 299,
    "It Ends With Us":                   299,
    "Verity - Colleen Hoover":           349,
    "Ikigai":                            249,
    "Man's Search for Meaning":          199,
    "Thinking Fast and Slow":            649,

    # ── BEAUTY & GROOMING ─────────────────────────────────────────────────────
    "Lakme Absolute 3D Lipstick":        699,
    "Maybelline Fit Me Foundation":      499,
    "Philips Cordless Trimmer":         2495,
    "Forest Essentials Facial Cleanser":1295,
    "Mamaearth Vitamin C Serum":         599,
    "The Body Shop Tea Tree Oil":        695,
    "Biotique Bio Kelp Shampoo":         249,
    "Cetaphil Gentle Skin Cleanser":     599,
    "Neutrogena Sunscreen SPF 50":       699,
    "Old Spice Aftershave":              499,
    "Gillette Mach3 Blades":             495,
    "Dove Repair Shampoo":               349,
    "Tresemme Hair Spray":               599,
    "L'Oreal Paris Hair Serum":          449,
    "Nivea Men Body Wash":               299,

    # ── TOYS & GAMES ──────────────────────────────────────────────────────────
    "LEGO Classic Bricks Set":          3999,
    "Barbie Dreamhouse 2024":          14999,
    "Hot Wheels 20 Car Pack":            999,
    "Monopoly Deluxe Board Game":       2499,
    "Hasbro Jenga Classic":             1499,
    "Fisher-Price Baby Gym":            3499,
    "Nerf Elite 2.0 Commander":         2999,
    "Rubik's Cube 3x3":                  399,
    "Funskool Chess Set":                799,
    "Remote Control Rock Crawler":      1999,
    "Ludo King Board":                   299,
    "Doctor Pretend Play Kit":           799,
    "Soft Teddy Bear 30cm":              699,
    "Kitchen Set for Kids":             1299,
    "Pokemon Trading Cards Box":        3999,

    # ── SPORTS & OUTDOOR ──────────────────────────────────────────────────────
    "Yonex Nanoray 18i Racket":         2499,
    "Quechua Arpenaz Backpack":         1999,
    "Cosco Cricket Tennis Ball":         299,
    "Decathlon Yoga Mat":                999,
    "Adidas Starlancer Football":       1499,
    "Nivea Skipping Rope":               599,
    "Vector X Table Tennis Bat":        1299,
    "Cycling Helmet Pro":               2999,
    "Gym Duffel Bag 30L":               1999,
    "Electric Air Pump":                1499,
    "Dumbbell Set 5kg x 2":             2499,
    "Resistance Bands Set":              899,
    "Skating Board":                    3999,
    "Badminton Shuttlecocks Gold":       599,
    "Trekking Poles Pair":              2999,

    # ── STATIONERY ────────────────────────────────────────────────────────────
    "Parker Vector Ball Pen":            399,
    "Casio Scientific Calculator":      1195,
    "Camel Artist Water Colors":         499,
    "Moleskine Classic Notebook":       1299,
    "Staedtler Pigment Liner Set":       799,
    "Faber-Castell 24 Color Pencils":    399,
    "Staples Highlighters Pack":         299,
    "Post-it Sticky Notes":              249,
    "White Board Marker 4-Color":        299,
    "Scissors & Tape Dispenser":         399,
    "Expanding File Folder":             499,
    "Correction Tape Pen":               149,
    "Pencil Case Mesh":                  299,
    "A4 Printing Paper 500 Sheets":      549,
    "Sketchbook 120GSM":                 499,
}

def main():
    products = Product.objects.all()
    total = products.count()
    updated = 0
    not_found = []

    print(f"\n>> Fixing prices for {total} products...\n")
    for p in products:
        new_price = PRICES.get(p.name)
        if new_price is None:
            not_found.append(p.name)
            print(f"  [????] NOT IN MAP: {p.name}  (current: Rs.{p.price})")
            continue

        old_price = p.price
        p.price = Decimal(str(new_price))
        p.save(update_fields=["price"])
        updated += 1
        print(f"  [OK] {p.name:45s}  Rs.{old_price:>12} -> Rs.{new_price:>10,}")

    print(f"\nDone! Updated {updated}/{total} products.")
    if not_found:
        print(f"Not mapped ({len(not_found)}): {not_found}")

if __name__ == "__main__":
    main()
