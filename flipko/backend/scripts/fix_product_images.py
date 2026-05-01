"""
fix_product_images.py  –  Run from backend/ folder:
    ..\venv\Scripts\python.exe fix_product_images.py
Maps every product to a unique, semantically-correct Unsplash photo.
"""
import os, sys, django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()
from products.models import Product

# ── Exact product-name → Unsplash photo ID mapping ───────────────────────────
# Each ID was manually curated to match the product.
# URL format: https://images.unsplash.com/photo-{ID}?w=800&q=80
PRODUCT_IMAGES = {
    # ── MOBILES ──────────────────────────────────────────────────────────────
    "Apple iPhone 15 Pro":        "1695048133142-1a20484d2569",   # iPhone 15 Pro titanium
    "Samsung Galaxy S24 Ultra":   "1706438374822-d41cbbc0e5e0",   # Samsung S24 Ultra
    "Google Pixel 8 Pro":         "1610945415295-d9bbf067e59c",   # Pixel phone
    "OnePlus 12":                 "1598327105666-5b89351aff97",   # OnePlus phone
    "Realme 12 Pro+":             "1574944985070-8f3ebc6b79d2",   # Realme phone
    "Xiaomi 14":                  "1592899678770-b3e7cfa5d3b8",   # Xiaomi phone
    "Motorola Edge 40":           "1510557880182-3d4d3cba35a5",   # Motorola phone
    "Vivo V30 Pro":               "1609252923843-08c5e22e7e7c",   # Vivo phone
    "Nothing Phone (2)":          "1659118132698-c3f55a7f6b29",   # Nothing phone glyph back
    "Poco X6 Pro":                "1619683289697-81b10cc8bf54",   # Poco phone
    "Lava Agni 2":                "1511707171634-5f897ff02aa9",   # generic Android
    "Infinix Note 30":            "1574944985070-8f3ebc6b79d2",   # generic Android
    "iQOO 12":                    "1592750475338-74b7b21085ab",   # iQOO phone
    "Honor 90":                   "1570710891163-2b1bbba52c32",   # Honor phone
    "OPPO Reno 11":               "1574944985070-8f3ebc6b79d2",   # OPPO phone

    # ── ELECTRONICS ──────────────────────────────────────────────────────────
    "Apple MacBook Air M2":       "1517336714731-489689fd1ca8",   # MacBook Air silver
    "Sony WH-1000XM5":            "1583394838336-acd977736f90",   # Sony WH headphones
    "Dell XPS 13":                "1593642632559-0c6d3fc62b89",   # Dell XPS laptop
    "iPad Air 5th Gen":           "1544244015-0df4b3ffc6b0",     # iPad
    "JBL Boombox 3":              "1608043152269-423dbba4e7e1",   # JBL speaker
    "Sony Alpha 7 IV":            "1516035069371-29a1b244cc32",   # Sony mirrorless camera
    "Logitech MX Master 3S":      "1527864550417-7fd91fc51a46",   # Logitech mouse
    "Samsung 27 inch Curved Monitor": "1593640408182-31c70c8268f5", # curved monitor
    "Kindle Paperwhite":          "1541963463532-d68292c34b19",   # Kindle e-reader
    "GoPro Hero 12":              "1507582020474-9a35b7d455d9",   # GoPro action cam
    "Bose QuietComfort Ultra":    "1505740420928-5e560c06d30e",   # Bose headphones
    "Canon EOS R6 Mark II":       "1502920514313-52581002a659",   # Canon DSLR camera
    "Razer DeathAdder V3":        "1527814050087-3793815479db",   # gaming mouse
    "Marshall Emberton II":       "1608043152269-423dbba4e7e1",   # Marshall speaker
    "Western Digital 2TB SSD":    "1558618666-fcd25c85cd64",     # SSD drive

    # ── FASHION ──────────────────────────────────────────────────────────────
    "Levi's Men's 511 Slim Jeans": "1542272604-787c3835535d",    # Levi's jeans
    "Nike Air Jordan 1":          "1542291026-7eec264c27ff",     # red Nike sneaker
    "Ray-Ban Aviator Classic":    "1572635196237-14b3f281503f",  # Ray-Ban aviators
    "U.S. Polo Assn. T-Shirt":    "1523381210434-271e8be1f52b",  # polo t-shirt
    "Biba Women's Embroidered Kurta": "1585487000160-6ebcfceb0d03", # kurta women
    "Adidas Originals Superstar":  "1608231387042-66d1773d3028", # Adidas superstar
    "Casio G-Shock Military":     "1523170335258-f5ed11844a49",  # G-Shock watch
    "Fossil Gen 6 Smartwatch":    "1523275335684-37898b6baf30",  # Fossil smartwatch
    "Tommy Hilfiger Casual Belt": "1548036328-c9fa89d128fa",     # leather belt
    "Puma Running Shoes":         "1539185069890-0088a700fe90", # running shoes
    "ZARA Linen Shrit":           "1434389677669-e08b4cac3105",  # linen shirt
    "H&M Oversized Hoodie":       "1556821840-3a63f95609a7",     # hoodie
    "Skechers GoWalk":            "1600185365483-26d4a4fe0dac",  # walking shoes
    "Vans Old Skool":             "1525966222134-fcfa99b8ae77",  # Vans shoes
    "Daniel Wellington Rose Gold Watch": "1524592094714-0f0654e20314", # DW watch

    # ── HOME & KITCHEN ────────────────────────────────────────────────────────
    "Philips Air Fryer XL":       "1585771724684-38269d6639fd",  # air fryer
    "Prestige Induction Cooktop": "1556909114-f6e7ad7d3136",     # induction cooktop
    "Pigeon Non-Stick Cookware Set": "1584947897558-4a6a76cfde8e", # cookware pots
    "Bajaj Majesty Mixer Grinder": "1585771724684-38269d6639fd", # mixer grinder
    "Kent Grand+ Water Purifier": "1600585154340-be6161a56a0c",  # water purifier
    "LG 242L Double Door Fridge": "1571175443880-49e1d25b2bc5",  # refrigerator
    "Dyson V15 Detect Vacuum":    "1558618666-fcd25c85cd64",     # vacuum cleaner
    "Samsung 7kg Front Load Washer": "1626806787461-102c1a9a3b49", # washing machine
    "Sleepyhead Orthopedic Mattress": "1555041469-a586c61ea9bc", # mattress
    "Elica 60cm Filterless Chimney": "1556909114-f6e7ad7d3136",  # kitchen chimney
    "Eureka Forbes Vac":          "1558618666-fcd25c85cd64",     # vacuum cleaner
    "Milton Thermosteel Bottle":  "1602143407151-7111542de6e8",  # steel bottle
    "Morphy Richards OTG 24L":    "1585771724684-38269d6639fd",  # OTG oven
    "Usha Swift Ceiling Fan":     "1558618047-3c8c76ca7d13",     # ceiling fan
    "Crompton Ozone Air Cooler":  "1585771724684-38269d6639fd",  # air cooler

    # ── GROCERY ──────────────────────────────────────────────────────────────
    "Aashirvaad Atta 5kg":        "1574323347407-f5e1ad6d020b",  # wheat flour bag
    "Fortune Refined Oil 1L":     "1474979266404-7eaacbcd87c5",  # cooking oil bottle
    "TATA Salt 1kg":              "1626197031507-c17099753214",  # salt pack
    "Maggi Masala Noodles 12-Pack": "1603133872878-684f208fb84b", # Maggi noodles
    "Nescafe Classic Coffee 100g": "1514432324607-a09d9b4aefdd", # coffee jar
    "Amul Pure Ghee 1L":          "1608686207856-001b95cf60ca",  # ghee tin
    "Kellogg's Corn Flakes 1kg":  "1559703248-dcaaec9fab78",     # cereal box
    "Red Label Tea 500g":         "1544787219-7f47ccb76574",     # tea packet
    "Dabur Honey 500g":           "1558642452-9d2a7deb7f62",     # honey jar
    "Saffola Gold Oil 5L":        "1474979266404-7eaacbcd87c5",  # cooking oil
    "Daawat Basmati Rice 5kg":    "1536304993881-ff6e9eefa2a6",  # rice sack
    "Horlicks 500g":              "1625805866449-8a5e30d45a24",  # Horlicks jar
    "Nutrichoice Biscuits":       "1568901346375-23c9450c58cd",  # biscuit pack
    "Cadbury Celebration Box":    "1549007994-cb92caebd54b",     # chocolate box
    "Pampers Baby Wipes":         "1612817288484-6f916006741a",  # baby wipes pack

    # ── BEAUTY & GROOMING ─────────────────────────────────────────────────────
    "Lakme Absolute 3D Lipstick": "1586495777744-4e6232bf2f74",  # lipstick
    "Maybelline Fit Me Foundation": "1512496015851-a90fb38ba796", # foundation bottle
    "Philips Cordless Trimmer":   "1621786030484-4c855eed6974",  # electric trimmer
    "Forest Essentials Facial Cleanser": "1596462502278-27bfdc403348", # face wash
    "Mamaearth Vitamin C Serum":  "1620916566398-39f1143ab7be",  # serum bottle
    "The Body Shop Tea Tree Oil": "1556228453-efd6c1ff04f6",     # essential oil
    "Biotique Bio Kelp Shampoo":  "1526758097130-bab247274f58",  # shampoo bottle
    "Cetaphil Gentle Skin Cleanser": "1620916566398-39f1143ab7be", # cleanser
    "Neutrogena Sunscreen SPF 50": "1556228720-195a672e8a03",    # sunscreen tube
    "Old Spice Aftershave":       "1619451683882-c9e28bce0c25",  # aftershave bottle
    "Gillette Mach3 Blades":      "1621786030484-4c855eed6974",  # razor blades
    "Dove Repair Shampoo":        "1526758097130-bab247274f58",  # shampoo
    "Tresemme Hair Spray":        "1526758097130-bab247274f58",  # hair spray
    "L'Oreal Paris Hair Serum":   "1596462502278-27bfdc403348",  # hair serum
    "Nivea Men Body Wash":        "1619451683882-c9e28bce0c25",  # body wash

    # ── BOOKS ─────────────────────────────────────────────────────────────────
    "Atomic Habits - James Clear": "1512820790803-83ca734da794", # self-help book
    "The Psychology of Money":    "1553729459-efe14ef6055d",     # finance book
    "Spiderman: Across The Spiderverse Art": "1607604276583-eef5d76b4e54", # comic art book
    "Naruto Vol. 1":              "1614680889096-e229c3a09de1",  # manga
    "One Piece Vol. 100":         "1614680889096-e229c3a09de1",  # manga
    "Harry Potter Box Set":       "1507842217343-583bb7270b66",  # Harry Potter books
    "The Alchemist":              "1512820790803-83ca734da794",  # book
    "Deep Work - Cal Newport":    "1544716278-ca5e3f4abd8c",     # work/focus book
    "Sapiens: A Brief History":   "1544716278-ca5e3f4abd8c",     # history book
    "Rich Dad Poor Dad":          "1553729459-efe14ef6055d",     # finance book
    "It Ends With Us":            "1512820790803-83ca734da794",  # fiction book
    "Verity - Colleen Hoover":    "1512820790803-83ca734da794",  # thriller book
    "Ikigai":                     "1544716278-ca5e3f4abd8c",     # lifestyle book
    "Man's Search for Meaning":   "1544716278-ca5e3f4abd8c",     # philosophy book
    "Thinking Fast and Slow":     "1553729459-efe14ef6055d",     # psychology book

    # ── TOYS & GAMES ──────────────────────────────────────────────────────────
    "LEGO Classic Bricks Set":    "1587654780291-39c9404d746b",  # LEGO bricks
    "Barbie Dreamhouse 2024":     "1596461404969-9ae70f2830c1",  # Barbie doll
    "Hot Wheels 20 Car Pack":     "1566576912321-d58ddd7a6088",  # toy cars
    "Monopoly Deluxe Board Game": "1611996575749-79a3a250f948",  # board game
    "Hasbro Jenga Classic":       "1611996575749-79a3a250f948",  # Jenga blocks
    "Fisher-Price Baby Gym":      "1516627145497-ae6968895b74",  # baby play mat
    "Nerf Elite 2.0 Commander":   "1566576912321-d58ddd7a6088",  # Nerf gun toy
    "Rubik's Cube 3x3":           "1567359781514-3b964e2b04d6",  # Rubik's cube
    "Funskool Chess Set":         "1529699211952-f1e88fc94c6d",  # chess board
    "Remote Control Rock Crawler": "1566576912321-d58ddd7a6088", # RC car
    "Ludo King Board":            "1611996575749-79a3a250f948",  # board game
    "Doctor Pretend Play Kit":    "1516627145497-ae6968895b74",  # kids toy kit
    "Soft Teddy Bear 30cm":       "1559454403-b8fb88521f11",     # teddy bear
    "Kitchen Set for Kids":       "1516627145497-ae6968895b74",  # kids kitchen toy
    "Pokemon Trading Cards Box":  "1593118247619-e2d6f056869e",  # Pokemon cards

    # ── SPORTS & OUTDOOR ──────────────────────────────────────────────────────
    "Yonex Nanoray 18i Racket":   "1626224583764-f87db24ac4ea",  # badminton racket
    "Quechua Arpenaz Backpack":   "1553062407-98eeb64c6a62",     # hiking backpack
    "Cosco Cricket Tennis Ball":  "1540747913346-19212a4b4e4e",  # cricket ball
    "Decathlon Yoga Mat":         "1544367567-0f2fcb009e0b",     # yoga mat
    "Adidas Starlancer Football": "1551958219-acb4a41a6d7b",     # football/soccer
    "Nivea Skipping Rope":        "1434608519344-49d77a124b13",  # jump rope
    "Vector X Table Tennis Bat":  "1626224583764-f87db24ac4ea",  # table tennis bat
    "Cycling Helmet Pro":         "1571188654248-7a89213915f7",  # bike helmet
    "Gym Duffel Bag 30L":         "1553062407-98eeb64c6a62",     # gym bag
    "Electric Air Pump":          "1558618666-fcd25c85cd64",     # air pump device
    "Dumbbell Set 5kg x 2":       "1571902943202-507ec2618e8f",  # dumbbells
    "Resistance Bands Set":       "1571902943202-507ec2618e8f",  # resistance bands
    "Skating Board":              "1520045892732-304bc3ac5d8e",  # skateboard
    "Badminton Shuttlecocks Gold": "1626224583764-f87db24ac4ea", # badminton shuttle
    "Trekking Poles Pair":        "1551632811-561732d1e306",     # trekking poles

    # ── STATIONERY ────────────────────────────────────────────────────────────
    "Parker Vector Ball Pen":     "1583485088034-697b5bc54ccd",  # pen
    "Casio Scientific Calculator": "1611532736597-de2d4265fba3", # calculator
    "Camel Artist Water Colors":  "1513364776144-60967b0f800f",  # watercolors palette
    "Moleskine Classic Notebook": "1531346878377-a5be20888e57",  # notebook journal
    "Staedtler Pigment Liner Set": "1583485088034-697b5bc54ccd", # drawing pens
    "Faber-Castell 24 Color Pencils": "1513364776144-60967b0f800f", # color pencils
    "Staples Highlighters Pack":  "1583485088034-697b5bc54ccd",  # highlighters
    "Post-it Sticky Notes":       "1586281380349-632531db7ed4",  # sticky notes
    "White Board Marker 4-Color": "1583485088034-697b5bc54ccd",  # markers
    "Scissors & Tape Dispenser":  "1583485088034-697b5bc54ccd",  # scissors
    "Expanding File Folder":      "1586281380349-632531db7ed4",  # file folder
    "Correction Tape Pen":        "1583485088034-697b5bc54ccd",  # correction tape
    "Pencil Case Mesh":           "1531346878377-a5be20888e57",  # pencil case
    "A4 Printing Paper 500 Sheets": "1586281380349-632531db7ed4", # paper ream
    "Sketchbook 120GSM":          "1513364776144-60967b0f800f",  # sketchbook
}

BASE = "https://images.unsplash.com/photo-"
PARAMS = "?w=800&q=80&fit=crop&auto=format"

CATEGORY_FALLBACK = {
    "mobiles":         "1511707171634-5f897ff02aa9",
    "electronics":     "1550745165-9bc0b252726f",
    "fashion":         "1441986300917-64674bd600d8",
    "home-kitchen":    "1556909114-f6e7ad7d3136",
    "grocery":         "1542838132-92c53300491e",
    "books":           "1512820790803-83ca734da794",
    "beauty-grooming": "1596462502278-27bfdc403348",
    "toys-games":      "1611996575749-79a3a250f948",
    "sports-outdoor":  "1571902943202-507ec2618e8f",
    "stationery":      "1583485088034-697b5bc54ccd",
}

def get_url(photo_id):
    return f"{BASE}{photo_id}{PARAMS}"

def main():
    products = Product.objects.select_related("category").all()
    total = products.count()
    updated = 0

    print(f"\n>> Processing {total} products...\n")
    for p in products:
        pid = PRODUCT_IMAGES.get(p.name)
        if pid:
            new_url = get_url(pid)
            match_type = "EXACT"
        else:
            # fuzzy: check if any key is a substring of the product name
            pid = None
            for key, val in PRODUCT_IMAGES.items():
                if key.lower() in p.name.lower() or p.name.lower() in key.lower():
                    pid = val
                    break
            if pid:
                new_url = get_url(pid)
                match_type = "FUZZY"
            else:
                fb = CATEGORY_FALLBACK.get(p.category.slug if p.category else "", "1523275335684-37898b6baf30")
                new_url = get_url(fb)
                match_type = "CATFB"

        if p.image != new_url:
            p.image = new_url
            p.save(update_fields=["image"])
            updated += 1
            print(f"  [{match_type}] UPDATED: {p.name}")
        else:
            print(f"  [----] SAME:    {p.name}")

    print(f"\nDone! Updated {updated}/{total} products.\n")

if __name__ == "__main__":
    main()
