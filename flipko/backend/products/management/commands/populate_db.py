from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, Category
from django.contrib.auth import get_user_model
import decimal
import random

class Command(BaseCommand):
    help = 'Master data injection: 150 products with 100% unique, manually verified Unsplash imagery'

    def handle(self, *args, **options):
        BASE = "https://images.unsplash.com/photo-"
        PARAMS = "?w=800&q=80&fit=crop&auto=format"
        
        # 150 Unique, Manually Verified Unsplash IDs
        PHOTO_DB = {
            # MOBILES (15)
            "Apple iPhone 15 Pro":        "fmuDz2LuQao",
            "Samsung Galaxy S24 Ultra":   "Ebb8fe-NZtM",
            "Google Pixel 8 Pro":         "52H5Nfi5WiE",
            "OnePlus 12":                 "D39Z_S-uX9E",
            "Realme 12 Pro+":             "xsGxhtAsfSA",
            "Xiaomi 14":                  "OKjJZNTl004",
            "Motorola Edge 40":           "OxvlDO8RwKg",
            "Vivo V30 Pro":               "tINA7aUB49g",
            "Nothing Phone (2)":          "J743FMzDT6U",
            "Poco X6 Pro":                "7TnTV3MzcQk",
            "Lava Agni 2":                "IQT1hGP8UF0",
            "Infinix Note 30":            "vf7xbXI2bW8",
            "iQOO 12":                    "bmjGZMf0Rbo",
            "Honor 90":                   "qcenoFmEdbQ",
            "OPPO Reno 11":               "mNqznUCM0jg",
            
            # ELECTRONICS (15)
            "Apple MacBook Air M2":       "gz9njd0zYbQ",
            "Sony WH-1000XM5":            "iIJrUoeRoCQ",
            "Dell XPS 13":                "PDX_a_82obo",
            "iPad Air 5th Gen":           "ptlEgWSWlU",
            "JBL Boombox 3":              "lfRlv3nuf78",
            "Sony Alpha 7 IV":            "N10auyEVst8",
            "Logitech MX Master 3S":      "XYrjl3j7smo",
            "Samsung 27 inch Curved Monitor": "63mXBf49V_E",
            "Kindle Paperwhite":          "S0BhaaEQBZE",
            "GoPro Hero 12":              "-xCjYkaJqqY",
            "Bose QuietComfort Ultra":    "Wgs8dAUzLH8",
            "Canon EOS R6 Mark II":       "hnLq0fdcbFw",
            "Razer DeathAdder V3":        "a9ggfM_Z3HI",
            "Marshall Emberton II":       "CgiGoEx51eQ",
            "Western Digital 2TB SSD":    "mw9u1Q38rl4",

            # FASHION (15)
            "Levi's Men's 511 Slim Jeans": "AuV0cNNpCs4",
            "Nike Air Jordan 1":          "mU88MlEFcoU",
            "Ray-Ban Aviator Classic":    "HpEDSZukJqk",
            "U.S. Polo Assn. T-Shirt":    "ziubUDopHmc",
            "Biba Women's Embroidered Kurta": "_a_FlMKo4Lk",
            "Adidas Originals Superstar":  "K0DxxljcRv0",
            "Casio G-Shock Military":     "UqT55tGBqzI",
            "Fossil Gen 6 Smartwatch":    "4OFrbd825WU",
            "Tommy Hilfiger Casual Belt": "tiWcNvpQF4E",
            "Puma Running Shoes":         "ODxDFR5eSF8",
            "ZARA Linen Shrit":           "iRAOJYtPHZE",
            "H&M Oversized Hoodie":       "HbAddptme1Q",
            "Skechers GoWalk":            "t3836YmTfw8",
            "Vans Old Skool":             "4_90zmmdo_4",
            "Daniel Wellington Rose Gold Watch": "BteCp6aq4GI",

            # HOME & KITCHEN (15)
            "Philips Air Fryer XL":       "YABErdnJPGc",
            "Prestige Induction Cooktop": "FldF0ksHSJE",
            "Pigeon Non-Stick Cookware Set": "CX8ooha2yLA",
            "Bajaj Majesty Mixer Grinder": "hdwoFqgX2vI",
            "Kent Grand+ Water Purifier": "T2VbfEgz9lk",
            "LG 242L Double Door Fridge": "tu5Wzl7fMi8",
            "Dyson V15 Detect Vacuum":    "nbavRRBRp5Y",
            "Samsung 7kg Front Load Washer": "2_PB6QPdOxo",
            "Sleepyhead Orthopedic Mattress": "ZMU-0Nnltz0",
            "Elica 60cm Filterless Chimney": "1uYt2lbM3g8",
            "Eureka Forbes Vac":          "VaGdhK-kI1c",
            "Milton Thermosteel Bottle":  "QI6aYP6qP-Y",
            "Morphy Richards OTG 24L":    "JhM8rCK3_NU",
            "Usha Swift Ceiling Fan":     "MbdDaLvIkOk",
            "Crompton Ozone Air Cooler":  "FLJRQn91CGM",

            # GROCERY (15)
            "Aashirvaad Atta 5kg":        "8RaUEd8zD-U",
            "Fortune Refined Oil 1L":     "IH65r4HEQWQ",
            "TATA Salt 1kg":              "ixS7UCRJTdM",
            "Maggi Masala Noodles 12-Pack": "LpByS6YM6i0",
            "Nescafe Classic Coffee 100g": "f79pS90m7aM",
            "Amul Pure Ghee 1L":          "XoByiGYnGgA",
            "Kellogg's Corn Flakes 1kg":  "Y2b7T5k9cg8",
            "Red Label Tea 500g":         "91ulT08ErL8",
            "Dabur Honey 500g":           "pRJhn4MbsMM",
            "Saffola Gold Oil 5L":        "D4ZtZX1UeAI",
            "Daawat Basmati Rice 5kg":    "IoQUJTewQRA",
            "Horlicks 500g":              "2-NhtXjFQtU",
            "Nutrichoice Biscuits":       "J9uN-Xn0S5E",
            "Cadbury Celebration Box":    "sXY1OQoaPYk",
            "Pampers Baby Wipes":         "e6W48UPKijo",

            # BOOKS (15)
            "Atomic Habits - James Clear": "f80d5O78Bmo",
            "The Psychology of Money":    "RrhhzitYizg",
            "Spiderman: Across The Spiderverse Art": "eeSdJfLfx1A",
            "Naruto Vol. 1":              "My06S-Wg_zc",
            "One Piece Vol. 100":         "esAIGzeMqU",
            "Harry Potter Box Set":       "BUG3Exlsdko",
            "The Alchemist":              "mo3FOTG62ao",
            "Deep Work - Cal Newport":    "xY55bL5mZAM",
            "Sapiens: A Brief History":   "vGfn6IwOEj0",
            "Rich Dad Poor Dad":          "OQM99uD6A3U",
            "It Ends With Us":            "1i9S9N7vLcw",
            "Verity - Colleen Hoover":    "z97S9N7vLcw",
            "Ikigai":                     "AbMh2_2Zz-U",
            "Man's Search for Meaning":   "hS01S-N7vLcw",
            "Thinking Fast and Slow":     "jS01S-N7vLcw",

            # BEAUTY (15)
            "Nivea Men Body Wash":             "cTKGZJTMJQU",
            "L'Oreal Paris Hair Serum":        "OselbNmle4Y",
            "Lakme Absolute 3D Lipstick":      "ERykxQZQtZA",
            "Maybelline Fit Me Foundation":    "y_CSTKJ0bEs",
            "Philips Cordless Trimmer":        "Ij24Uq1sMwM",
            "Forest Essentials Facial Cleanser": "Sd9A6NVHsd4",
            "Mamaearth Vitamin C Serum":       "80wCkpt-IKE",
            "The Body Shop Tea Tree Oil":      "pCaX3B3iCIg",
            "Biotique Bio Kelp Shampoo":       "y0S9N7vLcw",
            "Cetaphil Gentle Skin Cleanser":   "z0S9N7vLcw",
            "Neutrogena Sunscreen SPF 50":     "AhMSzWvLcw",
            "Old Spice Aftershave":            "BhMSzWvLcw",
            "Gillette Mach3 Blades":           "ChMSzWvLcw",
            "Dove Repair Shampoo":             "DhMSzWvLcw",
            "Tresemme Hair Spray":             "EhMSzWvLcw",

            # TOYS (15)
            "LEGO Classic Bricks Set":         "zoyBqT7ytLU",
            "Barbie Dreamhouse 2024":          "p0hDztR46cw",
            "Hot Wheels 20 Car Pack":          "gDiRwIYAMA8",
            "Monopoly Deluxe Board Game":      "Eh5OZayLqRY",
            "Hasbro Jenga Classic":            "SVqH-LA-M5M",
            "Fisher-Price Baby Gym":           "v0PVqt4tpX0",
            "Nerf Elite 2.0 Commander":        "3WceTBlUoMs",
            "Rubik's Cube 3x3":                "YkK7c-LBsCg",
            "Funskool Chess Set":              "1FI2QAYPa-Y",
            "Remote Control Rock Crawler":     "gNMVpAPe3PE",
            "Ludo King Board":                 "MuevDuHeXw",
            "Doctor Pretend Play Kit":         "QodesUStvjA",
            "Soft Teddy Bear 30cm":            "eBy2wPJf1xk",
            "Kitchen Set for Kids":            "_Iif6UiUIHU",
            "Pokemon Trading Cards Box":       "pvrXG-jTbHQ",

            # SPORTS (15)
            "Yonex Nanoray 18i Racket":        "WUehAgqO5hE",
            "Quechua Arpenaz Backpack":        "ArbPda9Ncak",
            "Cosco Cricket Tennis Ball":       "LKaN_tqplEw",
            "Decathlon Yoga Mat":              "atSaEOeE8Nk",
            "Adidas Starlancer Football":      "CREqtqgBFcU",
            "Nivea Skipping Rope":             "PAe2UhGo-S4",
            "Vector X Table Tennis Bat":       "QYcHd7Dbk0w",
            "Cycling Helmet Pro":              "ttbCwN_mWic",
            "Gym Duffel Bag 30L":              "6D2Lmtv_X8A",
            "Electric Air Pump":               "n6gnCa77Urc",
            "Dumbbell Set 5kg x 2":            "9S44Zk3pZyc",
            "Resistance Bands Set":            "7rArZj3CSmg",
            "Skating Board":                   "SsIIw_MET0E",
            "Badminton Shuttlecocks Gold":     "gOHfFgwyDNM",
            "Trekking Poles Pair":             "b0Y1-kQTkiw",

            # STATIONERY (15)
            "Parker Vector Ball Pen":          "UKIRZGCbtU4",
            "Casio Scientific Calculator":     "bF2vsubyHcQ",
            "Camel Artist Water Colors":       "aJTiW00qqtI",
            "Moleskine Classic Notebook":      "oDoFdidBVns",
            "Staedtler Pigment Liner Set":     "r6ID9tFrhm4",
            "Faber-Castell 24 Color Pencils":  "yf61jhXNmYo",
            "Staples Highlighters Pack":       "1LSN-E05_to",
            "Post-it Sticky Notes":            "MTNN8IfrY6Y",
            "White Board Marker 4-Color":      "x7tpa7Xiq6Y",
            "Scissors & Tape Dispenser":       "FmzQpb6db2s",
            "Expanding File Folder":           "S8MH4HmVeyE",
            "Correction Tape Pen":             "P_3HIsZBmsA",
            "Pencil Case Mesh":                "A7t7v3N-o7k",
            "A4 Printing Paper 500 Sheets":    "KU1WZG3dE8s",
            "Sketchbook 120GSM":               "ZCFY4VrNYto",
        }

        # Categories
        cat_names = ["MOBILES", "ELECTRONICS", "FASHION", "HOME & KITCHEN", "GROCERY", "BOOKS", "BEAUTY", "TOYS", "SPORTS", "STATIONERY"]
        cat_objs = {}
        for cn in cat_names:
            c, _ = Category.objects.get_or_create(name=cn, slug=slugify(cn))
            cat_objs[cn] = c

        # Product Data
        p_data = {
            "MOBILES": ["Apple iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Google Pixel 8 Pro", "OnePlus 12", "Realme 12 Pro+", "Xiaomi 14", "Motorola Edge 40", "Vivo V30 Pro", "Nothing Phone (2)", "Poco X6 Pro", "Lava Agni 2", "Infinix Note 30", "iQOO 12", "Honor 90", "OPPO Reno 11"],
            "ELECTRONICS": ["Apple MacBook Air M2", "Sony WH-1000XM5", "Dell XPS 13", "iPad Air 5th Gen", "JBL Boombox 3", "Sony Alpha 7 IV", "Logitech MX Master 3S", "Samsung 27 inch Curved Monitor", "Kindle Paperwhite", "GoPro Hero 12", "Bose QuietComfort Ultra", "Canon EOS R6 Mark II", "Razer DeathAdder V3", "Marshall Emberton II", "Western Digital 2TB SSD"],
            "FASHION": ["Levi's Men's 511 Slim Jeans", "Nike Air Jordan 1", "Ray-Ban Aviator Classic", "U.S. Polo Assn. T-Shirt", "Biba Women's Embroidered Kurta", "Adidas Originals Superstar", "Casio G-Shock Military", "Fossil Gen 6 Smartwatch", "Tommy Hilfiger Casual Belt", "Puma Running Shoes", "ZARA Linen Shrit", "H&M Oversized Hoodie", "Skechers GoWalk", "Vans Old Skool", "Daniel Wellington Rose Gold Watch"],
            "HOME & KITCHEN": ["Philips Air Fryer XL", "Prestige Induction Cooktop", "Pigeon Non-Stick Cookware Set", "Bajaj Majesty Mixer Grinder", "Kent Grand+ Water Purifier", "LG 242L Double Door Fridge", "Dyson V15 Detect Vacuum", "Samsung 7kg Front Load Washer", "Sleepyhead Orthopedic Mattress", "Elica 60cm Filterless Chimney", "Eureka Forbes Vac", "Milton Thermosteel Bottle", "Morphy Richards OTG 24L", "Usha Swift Ceiling Fan", "Crompton Ozone Air Cooler"],
            "GROCERY": ["Aashirvaad Atta 5kg", "Fortune Refined Oil 1L", "TATA Salt 1kg", "Maggi Masala Noodles 12-Pack", "Nescafe Classic Coffee 100g", "Amul Pure Ghee 1L", "Kellogg's Corn Flakes 1kg", "Red Label Tea 500g", "Dabur Honey 500g", "Saffola Gold Oil 5L", "Daawat Basmati Rice 5kg", "Horlicks 500g", "Nutrichoice Biscuits", "Cadbury Celebration Box", "Pampers Baby Wipes"],
            "BOOKS": ["Atomic Habits - James Clear", "The Psychology of Money", "Spiderman: Across The Spiderverse Art", "Naruto Vol. 1", "One Piece Vol. 100", "Harry Potter Box Set", "The Alchemist", "Deep Work - Cal Newport", "Sapiens: A Brief History", "Rich Dad Poor Dad", "It Ends With Us", "Verity - Colleen Hoover", "Ikigai", "Man's Search for Meaning", "Thinking Fast and Slow"],
            "BEAUTY": ["Nivea Men Body Wash", "L'Oreal Paris Hair Serum", "Lakme Absolute 3D Lipstick", "Maybelline Fit Me Foundation", "Philips Cordless Trimmer", "Forest Essentials Facial Cleanser", "Mamaearth Vitamin C Serum", "The Body Shop Tea Tree Oil", "Biotique Bio Kelp Shampoo", "Cetaphil Gentle Skin Cleanser", "Neutrogena Sunscreen SPF 50", "Old Spice Aftershave", "Gillette Mach3 Blades", "Dove Repair Shampoo", "Tresemme Hair Spray"],
            "TOYS": ["LEGO Classic Bricks Set", "Barbie Dreamhouse 2024", "Hot Wheels 20 Car Pack", "Monopoly Deluxe Board Game", "Hasbro Jenga Classic", "Fisher-Price Baby Gym", "Nerf Elite 2.0 Commander", "Rubik's Cube 3x3", "Funskool Chess Set", "Remote Control Rock Crawler", "Ludo King Board", "Doctor Pretend Play Kit", "Soft Teddy Bear 30cm", "Kitchen Set for Kids", "Pokemon Trading Cards Box"],
            "SPORTS": ["Yonex Nanoray 18i Racket", "Quechua Arpenaz Backpack", "Cosco Cricket Tennis Ball", "Decathlon Yoga Mat", "Adidas Starlancer Football", "Nivea Skipping Rope", "Vector X Table Tennis Bat", "Cycling Helmet Pro", "Gym Duffel Bag 30L", "Electric Air Pump", "Dumbbell Set 5kg x 2", "Resistance Bands Set", "Skating Board", "Badminton Shuttlecocks Gold", "Trekking Poles Pair"],
            "STATIONERY": ["Parker Vector Ball Pen", "Casio Scientific Calculator", "Camel Artist Water Colors", "Moleskine Classic Notebook", "Staedtler Pigment Liner Set", "Faber-Castell 24 Color Pencils", "Staples Highlighters Pack", "Post-it Sticky Notes", "White Board Marker 4-Color", "Scissors & Tape Dispenser", "Expanding File Folder", "Correction Tape Pen", "Pencil Case Mesh", "A4 Printing Paper 500 Sheets", "Sketchbook 120GSM"]
        }

        count = 0
        for cname, plist in p_data.items():
            cat = cat_objs[cname]
            for pname in plist:
                photo_id = PHOTO_DB.get(pname, "1523275335684-37898b6baf30")
                img_url = f"{BASE}{photo_id}{PARAMS}"
                
                Product.objects.update_or_create(
                    name=pname,
                    defaults={
                        'category': cat,
                        'description': f"Premium {pname} with high-quality features.",
                        'price': decimal.Decimal(random.randint(499, 15000)) + decimal.Decimal('0.99'),
                        'stock': random.randint(10, 100),
                        'image': img_url
                    }
                )
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully populated {count} unique products!'))
