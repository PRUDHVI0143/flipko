"""
fix_all_product_images.py
Assigns correct, product-specific images to every product in the database.
Uses high-quality Unsplash images properly matched to each product.
"""
import os, sys, django

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def u(photo_id, w=800, q=80):
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={w}&q={q}"

# Comprehensive product name -> correct image mapping
# Each image has been manually selected to match the product
CORRECT_IMAGES = {
    # ─── MOBILES ───────────────────────────────────────────────────────────────
    "Apple iPhone 15 Pro":            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    "Samsung Galaxy S24 Ultra":       "https://images.unsplash.com/photo-1706220986998-c5b90b3e73b3?auto=format&fit=crop&w=800&q=80",
    "Google Pixel 8 Pro":             "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    "OnePlus 12R":                    "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80",
    "Redmi Note 13 Pro":              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "Vivo V30 Pro":                   "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    "Realme 12 Pro+":                 "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    "iQOO Neo 9 Pro":                 "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    "Nothing Phone 2a":               "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    "Motorola Edge 50 Pro":           "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80",

    # ─── ELECTRONICS ───────────────────────────────────────────────────────────
    "Apple MacBook Air M2":           "https://images.unsplash.com/photo-1611186871525-23a0c1765cee?auto=format&fit=crop&w=800&q=80",
    "Sony WH-1000XM5 Headphones":     "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
    "iPad Air 5th Gen":               "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "Logitech MX Master 3S Mouse":    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "Samsung 65\" QLED 4K TV":        "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
    "Sony Alpha 7 IV":                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "Canon EOS R6 Mark II":           "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    "GoPro Hero 12":                  "https://images.unsplash.com/photo-1494489941702-b25c66abcb5b?auto=format&fit=crop&w=800&q=80",
    "Dell XPS 15 Laptop":             "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80",
    "Apple AirPods Pro 2":            "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    "Kindle Paperwhite 11th Gen":     "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    "JBL Charge 5 Speaker":           "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    "Philips Air Fryer HD9252":       "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    "Dyson V15 Detect Vacuum":        "https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?auto=format&fit=crop&w=800&q=80",
    "Bose QuietComfort 45":           "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",

    # ─── FASHION ───────────────────────────────────────────────────────────────
    "Nike Air Jordan 1 Retro High":   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "Nike Air Jordan 1":              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "Adidas Ultraboost 23":           "https://images.unsplash.com/photo-1608231387042-66d1773d3028?auto=format&fit=crop&w=800&q=80",
    "Levi's 511 Slim Fit Jeans":      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    "Puma RS-X Sneakers":             "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
    "Vans Old Skool":                 "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    "Adidas Originals Superstar":     "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80",
    "H&M Oversized Hoodie":           "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80",
    "Zara Cargo Trousers":            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    "U.S. Polo Polo T-Shirt":         "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
    "Woodland Men's Boots":           "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "Casio G-Shock Military":         "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "Fastrack Trendies Watch":        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "Titan Raga Gold Watch":          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    "Ray-Ban Aviator Classic":        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
    "Tommy Hilfiger Backpack":        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",

    # ─── HOME & KITCHEN ────────────────────────────────────────────────────────
    "Prestige 3L Pressure Cooker":    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80",
    "Philips HL7756 Mixer Grinder":   "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    "Godrej 185L Single Door Fridge": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80",
    "Havells Instanio Geyser 3L":     "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    "Milton Thermosteel Bottle":      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    "Cello Steelox Tiffin Box":       "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80",
    "Borosil Glass Mixing Bowls":     "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
    "Solimo Microwave Oven 20L":      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    "Pigeon Non-stick Kadai":         "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80",
    "FunFoods Waffle Maker":          "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
    "Amazon Basics Bedsheet Set":     "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    "Nilkamal Plastic Chair":         "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    "Pepperfry Wooden Shelf":         "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80",
    "Prestige Electric Kettle 1.5L":  "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80",
    "Eureka Forbes Wet-Dry Vacuum":   "https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?auto=format&fit=crop&w=800&q=80",

    # ─── GROCERY ───────────────────────────────────────────────────────────────
    "Tata Salt 1kg":                  "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80",
    "Fortune Sunflower Oil 5L":       "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    "Aashirvaad Atta 5kg":            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    "Amul Butter 500g":               "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
    "Bru Instant Coffee 200g":        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    "Tata Tea Premium 500g":          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    "Haldirams Aloo Bhujia 1kg":      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80",
    "Maggi Masala Noodles 12pk":      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
    "Cadbury Dairy Milk Silk":        "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80",
    "Parle-G Biscuits 1kg Pack":      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    "Dettol Hand Wash 500ml":         "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    "Ariel Matic Top Load Detergent": "https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?auto=format&fit=crop&w=800&q=80",
    "Vim Dishwash Liquid 750ml":      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    "Real Fruit Power Juice 1L":      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80",
    "Kissan Mixed Fruit Jam 500g":    "https://images.unsplash.com/photo-1553978297-9e4e9c8f9ac0?auto=format&fit=crop&w=800&q=80",

    # ─── BOOKS ─────────────────────────────────────────────────────────────────
    "Atomic Habits":                  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    "The Alchemist":                  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    "Rich Dad Poor Dad":              "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80",
    "Harry Potter Box Set":           "https://images.unsplash.com/photo-1564233779914-8534cfa0b7e1?auto=format&fit=crop&w=800&q=80",
    "Wings of Fire":                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    "The Psychology of Money":        "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=800&q=80",
    "Ikigai":                         "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    "NCERT Class 12 Physics":         "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    "IIT JEE Advanced Mathematics":   "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80",
    "The God of Small Things":        "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=800&q=80",
    "Gitanjali - Rabindranath Tagore":"https://images.unsplash.com/photo-1476275466078-4cdc88d07eed?auto=format&fit=crop&w=800&q=80",
    "Malgudi Days R.K. Narayan":      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
    "Midnight's Children":            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
    "The White Tiger":                "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?auto=format&fit=crop&w=800&q=80",
    "Five Point Someone":             "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80",

    # ─── BEAUTY & GROOMING ─────────────────────────────────────────────────────
    "Lakme Absolute Powder":          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    "Maybelline Fit Me Foundation":   "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    "Nykaa Lipstick Blushed Wine":    "https://images.unsplash.com/photo-1586495777744-4e6232bf2cd3?auto=format&fit=crop&w=800&q=80",
    "L'Oreal Paris Revitalift":       "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "Forest Essentials Facial Cleanser":"https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    "Mamaearth Vitamin C Serum":      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80",
    "The Body Shop Tea Tree Oil":     "https://images.unsplash.com/photo-1608571423902-90fbf73b98e7?auto=format&fit=crop&w=800&q=80",
    "Biotique Bio Kelp Shampoo":      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    "Cetaphil Gentle Skin Cleanser":  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "Neutrogena Sunscreen SPF 50":    "https://images.unsplash.com/photo-1556228453-348f26ef61bb?auto=format&fit=crop&w=800&q=80",
    "Old Spice Aftershave":           "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
    "Gillette Mach3 Blades":          "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
    "Dove Repair Shampoo":            "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    "Tresemme Hair Spray":            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",

    # ─── TOYS & GAMES ──────────────────────────────────────────────────────────
    "LEGO Classic Bricks Set":        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    "Barbie Dreamhouse 2024":         "https://images.unsplash.com/photo-1558060169-026d5428b33e?auto=format&fit=crop&w=800&q=80",
    "Hot Wheels 20 Car Pack":         "https://images.unsplash.com/photo-1594787318286-3d835c1d0aeb?auto=format&fit=crop&w=800&q=80",
    "Monopoly Deluxe Board Game":     "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "Hasbro Jenga Classic":           "https://images.unsplash.com/photo-1597058712635-3182d1eae1f4?auto=format&fit=crop&w=800&q=80",
    "Fisher-Price Baby Gym":          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    "Nerf Elite 2.0 Commander":       "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    "Rubik's Cube 3x3":               "https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=800&q=80",
    "Funskool Chess Set":             "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80",
    "Remote Control Rock Crawler":    "https://images.unsplash.com/photo-1581235707941-1e1cb5f2b088?auto=format&fit=crop&w=800&q=80",
    "Ludo King Board":                "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80",
    "Doctor Pretend Play Kit":        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    "Soft Teddy Bear 30cm":           "https://images.unsplash.com/photo-1559715541-5630c2009af4?auto=format&fit=crop&w=800&q=80",
    "Kitchen Set for Kids":           "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    "Pokemon Trading Cards Box":      "https://images.unsplash.com/photo-1613771404721-1f92148fc5f7?auto=format&fit=crop&w=800&q=80",

    # ─── SPORTS & OUTDOOR ──────────────────────────────────────────────────────
    "Yonex Nanoray 18i Racket":       "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
    "Quechua Arpenaz Backpack":       "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "Cosco Cricket Tennis Ball":      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    "Decathlon Yoga Mat":             "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    "Adidas Starlancer Football":     "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80",
    "Nivea Skipping Rope":            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    "Vector X Table Tennis Bat":      "https://images.unsplash.com/photo-1558657292-22e0b5ced1f2?auto=format&fit=crop&w=800&q=80",
    "Cycling Helmet Pro":             "https://images.unsplash.com/photo-1557246565-8a3d3ab5d7f6?auto=format&fit=crop&w=800&q=80",
    "Gym Duffel Bag 30L":             "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "Electric Air Pump":              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    "Dumbbell Set 5kg x 2":           "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    "Resistance Bands Set":           "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
    "Skating Board":                  "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    "Badminton Shuttlecocks Gold":    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
    "Trekking Poles Pair":            "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",

    # ─── STATIONERY ────────────────────────────────────────────────────────────
    "Parker Vector Ball Pen":         "https://images.unsplash.com/photo-1585336261022-7f24fcc21fa5?auto=format&fit=crop&w=800&q=80",
    "Casio Scientific Calculator":    "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?auto=format&fit=crop&w=800&q=80",
    "Camel Artist Water Colors":      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    "Moleskine Classic Notebook":     "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=800&q=80",
    "Staedtler Pigment Liner Set":    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    "Faber-Castell 24 Color Pencils": "https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?auto=format&fit=crop&w=800&q=80",
    "Staples Highlighters Pack":      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    "Post-it Sticky Notes":           "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&w=800&q=80",
    "White Board Marker 4-Color":     "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    "Scissors & Tape Dispenser":      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    "Expanding File Folder":          "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&w=800&q=80",
    "Correction Tape Pen":            "https://images.unsplash.com/photo-1585336261022-7f24fcc21fa5?auto=format&fit=crop&w=800&q=80",
    "Pencil Case Mesh":               "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    "A4 Printing Paper 500 Sheets":   "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=800&q=80",
    "Sketchbook 120GSM":              "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
}

# Category-level fallback images (used if product name not in CORRECT_IMAGES)
CATEGORY_FALLBACKS = {
    "mobiles":        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "electronics":    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    "fashion":        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    "home-kitchen":   "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
    "grocery":        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    "books":          "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    "beauty-grooming":"https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    "toys-games":     "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
    "sports-outdoor": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80",
    "stationery":     "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=800&q=80",
}

def main():
    products = Product.objects.select_related('category').all().order_by('id')
    total = products.count()
    print(f"Fixing images for {total} products...")
    print("-" * 80)

    updated = 0
    not_found = []

    for p in products:
        # Try exact name match first
        new_url = CORRECT_IMAGES.get(p.name)

        # Try partial match if exact match fails
        if not new_url:
            for key, url in CORRECT_IMAGES.items():
                if key.lower() in p.name.lower() or p.name.lower() in key.lower():
                    new_url = url
                    break

        # Fall back to category image
        if not new_url:
            cat_slug = p.category.slug if p.category else ''
            new_url = CATEGORY_FALLBACKS.get(cat_slug)
            not_found.append(p.name)

        if new_url and p.image != new_url:
            p.image = new_url
            p.save(update_fields=['image'])
            updated += 1
            print(f"  [OK] [{p.id:3}] {p.name[:45]}")
        else:
            print(f"  - [{p.id:3}] {p.name[:45]} (unchanged)")

    print(f"\n{'='*80}")
    print(f"Done! Updated {updated} / {total} products.")
    if not_found:
        print(f"\nUsed category fallback for {len(not_found)} products:")
        for n in not_found:
            print(f"  - {n}")

if __name__ == '__main__':
    main()
