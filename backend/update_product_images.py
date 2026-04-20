import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# ================================================================
# ALL VERIFIED working Unsplash photo IDs (tested OK via HTTP)
# Format: https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=800&q=80
# ================================================================
VERIFIED_IDS = {
    # ── phones/tech ──
    "phone":         "1510557880182-3d4d3cba35a5",
    "laptop":        "1496181133206-80ce9b88a853",
    "headphones":    "1505740420928-5e560c06d30e",
    "camera":        "1453728013993-6d66e9c9123a",
    "monitor":       "1486312338219-ce68d2c6f44d",
    "speaker":       "1545167622-43f5ac6b3f95",
    "book_cover":    "1512820790803-83ca734da794",
    "novel":         "1532012197267-da84d127e765",
    "watch":         "1523275335684-37898b6baf30",
    "jeans":         "1542272604-787c3835535d",
    "sneakers":      "1542291026-7eec264c27ff",
    "football":      "1574629810360-7efbbe195018",
    "water_bottle":  "1602143407151-7111542de6e8",
    "dslr":          "1516035069-79b2c18e3c57",   # NOT VERIFIED — will use fallback
}

BASE = "https://images.unsplash.com/photo-"
PARAMS = "?auto=format&fit=crop&w=800&q=80"

def u(photo_id):
    return f"{BASE}{photo_id}{PARAMS}"

def picsum(seed):
    return f"https://picsum.photos/seed/{seed}/800/800"

# ================================================================
# FINAL DEFINITIVE PRODUCT IMAGE MAP
# Priority: local media > verified Unsplash > Picsum seed
# ================================================================
PRODUCT_IMAGE_MAP = {

    # ── MOBILES ──────────────────────────────────────────────
    "Apple iPhone 15 Pro":       "/media/iphone15pro.png",
    "Samsung Galaxy S24 Ultra":  "/media/samsung_s24.png",
    "Google Pixel 8 Pro":        u("1510557880182-3d4d3cba35a5"),
    "OnePlus 12":                u("1510557880182-3d4d3cba35a5"),
    "Realme 12 Pro+":            u("1510557880182-3d4d3cba35a5"),
    "Xiaomi 14":                 picsum(52),
    "Motorola Edge 40":          picsum(63),
    "Vivo V30 Pro":              u("1510557880182-3d4d3cba35a5"),
    "Nothing Phone (2)":         picsum(88),
    "Poco X6 Pro":               picsum(90),
    "Lava Agni 2":               picsum(102),
    "Infinix Note 30":           picsum(110),
    "iQOO 12":                   picsum(122),
    "Honor 90":                  picsum(133),
    "OPPO Reno 11":              picsum(141),

    # ── ELECTRONICS ──────────────────────────────────────────
    "Apple MacBook Air M2":      "/media/macbook.png",
    "Sony WH-1000XM5":           u("1505740420928-5e560c06d30e"),
    "Dell XPS 13":               u("1496181133206-80ce9b88a853"),
    "iPad Air 5th Gen":          picsum(220),
    "JBL Boombox 3":             u("1545167622-43f5ac6b3f95"),
    "Sony Alpha 7 IV":           u("1453728013993-6d66e9c9123a"),
    "Logitech MX Master 3S":     picsum(305),
    "Samsung 27 inch Curved Monitor": u("1486312338219-ce68d2c6f44d"),
    "Kindle Paperwhite":         u("1512820790803-83ca734da794"),
    "GoPro Hero 12":             u("1453728013993-6d66e9c9123a"),
    "Bose QuietComfort Ultra":   u("1505740420928-5e560c06d30e"),
    "Canon EOS R6 Mark II":      u("1453728013993-6d66e9c9123a"),
    "Razer DeathAdder V3":       picsum(312),
    "Marshall Emberton II":      u("1545167622-43f5ac6b3f95"),
    "Western Digital 2TB SSD":   picsum(342),

    # ── FASHION ──────────────────────────────────────────────
    "Levi's Men's 511 Slim Jeans":      u("1542272604-787c3835535d"),
    "Nike Air Jordan 1":                "/media/jordans.png",
    "Ray-Ban Aviator Classic":          picsum(421),
    "U.S. Polo Assn. T-Shirt":         picsum(432),
    "Biba Women's Embroidered Kurta":   picsum(441),
    "Adidas Originals Superstar":       u("1542291026-7eec264c27ff"),
    "Casio G-Shock Military":           u("1523275335684-37898b6baf30"),
    "Fossil Gen 6 Smartwatch":          u("1523275335684-37898b6baf30"),
    "Tommy Hilfiger Casual Belt":       picsum(492),
    "Puma Running Shoes":               u("1542291026-7eec264c27ff"),
    "ZARA Linen Shrit":                 picsum(511),
    "H&M Oversized Hoodie":             picsum(522),
    "Skechers GoWalk":                  u("1542291026-7eec264c27ff"),
    "Vans Old Skool":                   u("1542291026-7eec264c27ff"),
    "Daniel Wellington Rose Gold Watch": u("1523275335684-37898b6baf30"),

    # ── HOME & KITCHEN ────────────────────────────────────────
    "Philips Air Fryer XL":             picsum(601),
    "Prestige Induction Cooktop":       picsum(611),
    "Pigeon Non-Stick Cookware Set":    picsum(622),
    "Bajaj Majesty Mixer Grinder":      picsum(631),
    "Kent Grand+ Water Purifier":       u("1602143407151-7111542de6e8"),
    "LG 242L Double Door Fridge":       picsum(651),
    "Dyson V15 Detect Vacuum":          picsum(662),
    "Samsung 7kg Front Load Washer":    picsum(671),
    "Sleepyhead Orthopedic Mattress":   picsum(681),
    "Elica 60cm Filterless Chimney":    picsum(691),
    "Eureka Forbes Vac":                picsum(382),
    "Milton Thermosteel Bottle":        u("1602143407151-7111542de6e8"),
    "Morphy Richards OTG 24L":          picsum(712),
    "Usha Swift Ceiling Fan":           picsum(721),
    "Crompton Ozone Air Cooler":        picsum(731),

    # ── GROCERY ───────────────────────────────────────────────
    "Aashirvaad Atta 5kg":             picsum(801),
    "Fortune Refined Oil 1L":          picsum(812),
    "TATA Salt 1kg":                   picsum(821),
    "Maggi Masala Noodles 12-Pack":    picsum(831),
    "Nescafe Classic Coffee 100g":     picsum(841),
    "Amul Pure Ghee 1L":               picsum(851),
    "Kellogg's Corn Flakes 1kg":       picsum(861),
    "Red Label Tea 500g":              picsum(871),
    "Dabur Honey 500g":                picsum(882),
    "Saffola Gold Oil 5L":             picsum(891),
    "Daawat Basmati Rice 5kg":         picsum(892),
    "Horlicks 500g":                   picsum(901),
    "Nutrichoice Biscuits":            picsum(911),
    "Cadbury Celebration Box":         picsum(921),
    "Pampers Baby Wipes":              picsum(931),

    # ── BOOKS ─────────────────────────────────────────────────
    "Atomic Habits - James Clear":     u("1512820790803-83ca734da794"),
    "The Psychology of Money":         u("1512820790803-83ca734da794"),
    "Spiderman: Across The Spiderverse Art": picsum(1021),
    "Naruto Vol. 1":                   picsum(1031),
    "One Piece Vol. 100":              picsum(1041),
    "Harry Potter Box Set":            u("1512820790803-83ca734da794"),
    "The Alchemist":                   u("1512820790803-83ca734da794"),
    "Deep Work - Cal Newport":         u("1512820790803-83ca734da794"),
    "Sapiens: A Brief History":        u("1512820790803-83ca734da794"),
    "Rich Dad Poor Dad":               u("1512820790803-83ca734da794"),
    "It Ends With Us":                 u("1532012197267-da84d127e765"),
    "Verity - Colleen Hoover":         u("1532012197267-da84d127e765"),
    "Ikigai":                          u("1512820790803-83ca734da794"),
    "Man's Search for Meaning":        u("1512820790803-83ca734da794"),
    "Thinking Fast and Slow":          u("1512820790803-83ca734da794"),

    # ── BEAUTY & GROOMING ─────────────────────────────────────
    "Nivea Men Body Wash":             picsum(1201),
    "L'Oreal Paris Hair Serum":        picsum(1211),
    "Lakme Absolute 3D Lipstick":      picsum(1221),
    "Maybelline Fit Me Foundation":    picsum(1231),
    "Philips Cordless Trimmer":        picsum(1241),
    "Forest Essentials Facial Cleanser": picsum(1251),
    "Mamaearth Vitamin C Serum":       picsum(1261),
    "The Body Shop Tea Tree Oil":      picsum(1271),
    "Biotique Bio Kelp Shampoo":       picsum(1281),
    "Cetaphil Gentle Skin Cleanser":   picsum(1291),
    "Neutrogena Sunscreen SPF 50":     picsum(1301),
    "Old Spice Aftershave":            picsum(1311),
    "Gillette Mach3 Blades":           picsum(1321),
    "Dove Repair Shampoo":             picsum(1282),
    "Tresemme Hair Spray":             picsum(1331),

    # ── TOYS & GAMES ──────────────────────────────────────────
    "LEGO Classic Bricks Set":         picsum(1401),
    "Barbie Dreamhouse 2024":          picsum(1411),
    "Hot Wheels 20 Car Pack":          picsum(1421),
    "Monopoly Deluxe Board Game":      picsum(1431),
    "Hasbro Jenga Classic":            picsum(1441),
    "Fisher-Price Baby Gym":           picsum(1451),
    "Nerf Elite 2.0 Commander":        picsum(1461),
    "Rubik's Cube 3x3":                picsum(1471),
    "Funskool Chess Set":              picsum(1481),
    "Remote Control Rock Crawler":     picsum(1491),
    "Ludo King Board":                 picsum(1501),
    "Doctor Pretend Play Kit":         picsum(1531),
    "Soft Teddy Bear 30cm":            picsum(1511),
    "Kitchen Set for Kids":            picsum(1541),
    "Pokemon Trading Cards Box":       picsum(1521),

    # ── SPORTS & OUTDOOR ──────────────────────────────────────
    "Yonex Nanoray 18i Racket":        picsum(1601),
    "Quechua Arpenaz Backpack":        picsum(1611),
    "Cosco Cricket Tennis Ball":       picsum(1621),
    "Decathlon Yoga Mat":              picsum(1631),
    "Adidas Starlancer Football":      u("1574629810360-7efbbe195018"),
    "Nivea Skipping Rope":             picsum(1651),
    "Vector X Table Tennis Bat":       picsum(1661),
    "Cycling Helmet Pro":              picsum(1671),
    "Gym Duffel Bag 30L":              picsum(1681),
    "Electric Air Pump":               picsum(1691),
    "Dumbbell Set 5kg x 2":            picsum(1701),
    "Resistance Bands Set":            picsum(1711),
    "Skating Board":                   picsum(1721),
    "Badminton Shuttlecocks Gold":     picsum(1731),
    "Trekking Poles Pair":             picsum(1741),

    # ── STATIONERY ────────────────────────────────────────────
    "Parker Vector Ball Pen":          picsum(1801),
    "Casio Scientific Calculator":     picsum(1821),
    "Camel Artist Water Colors":       picsum(1831),
    "Moleskine Classic Notebook":      picsum(1841),
    "Staedtler Pigment Liner Set":     picsum(1851),
    "Faber-Castell 24 Color Pencils":  picsum(1861),
    "Staples Highlighters Pack":       picsum(1871),
    "Post-it Sticky Notes":            picsum(1881),
    "White Board Marker 4-Color":      picsum(1891),
    "Scissors & Tape Dispenser":       picsum(1901),
    "Expanding File Folder":           picsum(1911),
    "Correction Tape Pen":             picsum(1921),
    "Pencil Case Mesh":                picsum(1931),
    "A4 Printing Paper 500 Sheets":    picsum(1941),
    "Sketchbook 120GSM":               picsum(1951),
}


def update_images():
    products = Product.objects.all().order_by('category__name', 'name')
    updated = 0
    not_found = []

    for product in products:
        if product.name in PRODUCT_IMAGE_MAP:
            product.image = PRODUCT_IMAGE_MAP[product.name]
            product.save()
            print(f"[OK] {product.name} -> {product.image[:60]}")
            updated += 1
        else:
            not_found.append(product.name)
            print(f"[MISS] {product.name}")

    print(f"\nDone: {updated}/150 updated")
    if not_found:
        print(f"MISSING: {not_found}")


if __name__ == "__main__":
    update_images()
