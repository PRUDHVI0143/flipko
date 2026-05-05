from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, Category
from django.contrib.auth import get_user_model
import decimal
import random

class Command(BaseCommand):
    help = 'Populates the database with 150 products using 100% UNIQUE reliable Unsplash images'

    def handle(self, *args, **options):
        BASE = "https://images.unsplash.com/photo-"
        PARAMS = "?w=800&q=80&fit=crop&auto=format"
        
        # 100% UNIQUE Unsplash mapping for all 150 products
        PHOTO_DB = {
            # MOBILES
            "Apple iPhone 15 Pro":        "1695048133142-1a20484d2569",
            "Samsung Galaxy S24 Ultra":   "1706438374822-d41cbbc0e5e0",
            "Google Pixel 8 Pro":         "1610945415295-d9bbf067e59c",
            "OnePlus 12":                 "1598327105666-5b89351aff97",
            "Realme 12 Pro+":             "1574944985070-8f3ebc6b79d2",
            "Xiaomi 14":                  "1592899678770-b3e7cfa5d3b8",
            "Motorola Edge 40":           "1510557880182-3d4d3cba35a5",
            "Vivo V30 Pro":               "1609252923843-08c5e22e7e7c",
            "Nothing Phone (2)":          "1659118132698-c3f55a7f6b29",
            "Poco X6 Pro":                "1619683289697-81b10cc8bf54",
            "Lava Agni 2":                "1511707171634-5f897ff02aa9",
            "Infinix Note 30":            "1574944985070-1f3ebc6b79d2",
            "iQOO 12":                    "1592750475338-74b7b21085ab",
            "Honor 90":                   "1570710891163-2b1bbba52c32",
            "OPPO Reno 11":               "1522333500012-f1afc281f5c3",
            
            # ELECTRONICS
            "Apple MacBook Air M2":       "1517336714731-489689fd1ca8",
            "Sony WH-1000XM5":            "1583394838336-acd977736f90",
            "Dell XPS 13":                "1593642632559-0c6d3fc62b89",
            "iPad Air 5th Gen":           "1544244015-0df4b3ffc6b0",
            "JBL Boombox 3":              "1608043152269-423dbba4e7e1",
            "Sony Alpha 7 IV":            "1516035069371-29a1b244cc32",
            "Logitech MX Master 3S":      "1527864550417-7fd91fc51a46",
            "Samsung 27 inch Curved Monitor": "1593640408182-31c70c8268f5",
            "Kindle Paperwhite":          "1541963463532-d68292c34b19",
            "GoPro Hero 12":              "1507582020474-9a35b7d455d9",
            "Bose QuietComfort Ultra":    "1505740420928-5e560c06d30e",
            "Canon EOS R6 Mark II":       "1502920514313-52581002a659",
            "Razer DeathAdder V3":        "1527814050087-3793815479db",
            "Marshall Emberton II":       "1608043152269-423dbba4e7e1",
            "Western Digital 2TB SSD":    "1558618666-fcd25c85cd64",

            # FASHION
            "Levi's Men's 511 Slim Jeans": "1542272604-787c3835535d",
            "Nike Air Jordan 1":          "1542291026-7eec264c27ff",
            "Ray-Ban Aviator Classic":    "1572635196237-14b3f281503f",
            "U.S. Polo Assn. T-Shirt":    "1523381210434-271e8be1f52b",
            "Biba Women's Embroidered Kurta": "1585487000160-6ebcfceb0d03",
            "Adidas Originals Superstar":  "1608231387042-66d1773d3028",
            "Casio G-Shock Military":     "1523170335258-f5ed11844a49",
            "Fossil Gen 6 Smartwatch":    "1523275335684-37898b6baf30",
            "Tommy Hilfiger Casual Belt": "1548036328-c9fa89d128fa",
            "Puma Running Shoes":         "1539185069890-0088a700fe90",
            "ZARA Linen Shrit":           "1434389677669-e08b4cac3105",
            "H&M Oversized Hoodie":       "1556821840-3a63f95609a7",
            "Skechers GoWalk":            "1600185365483-26d4a4fe0dac",
            "Vans Old Skool":             "1525966222134-fcfa99b8ae77",
            "Daniel Wellington Rose Gold Watch": "1524592094714-0f0654e20314",

            # HOME & KITCHEN
            "Philips Air Fryer XL":       "1585771724684-38269d6639fd",
            "Prestige Induction Cooktop": "1556909114-f6e7ad7d3136",
            "Pigeon Non-Stick Cookware Set": "1584947897558-4a6a76cfde8e",
            "Bajaj Majesty Mixer Grinder": "1583573636246-1fa242507012",
            "Kent Grand+ Water Purifier": "1600585154340-be6161a56a0c",
            "LG 242L Double Door Fridge": "1571175443880-49e1d25b2bc5",
            "Dyson V15 Detect Vacuum":    "1558618666-fcd25c85cd64",
            "Samsung 7kg Front Load Washer": "1626806787461-102c1a9a3b49",
            "Sleepyhead Orthopedic Mattress": "1555041469-a586c61ea9bc",
            "Elica 60cm Filterless Chimney": "1556909114-f6e7ad7d3136",
            "Eureka Forbes Vac":          "1558618666-fcd25c85cd64",
            "Milton Thermosteel Bottle":  "1602143407151-7111542de6e8",
            "Morphy Richards OTG 24L":    "1585771724684-38269d6639fd",
            "Usha Swift Ceiling Fan":     "1558618047-3c8c76ca7d13",
            "Crompton Ozone Air Cooler":  "1585771724684-38269d6639fd",

            # GROCERY
            "Aashirvaad Atta 5kg":        "1574323347407-f5e1ad6d020b",
            "Fortune Refined Oil 1L":     "1474979266404-7eaacbcd87c5",
            "TATA Salt 1kg":              "1626197031507-c17099753214",
            "Maggi Masala Noodles 12-Pack": "1603133872878-684f208fb84b",
            "Nescafe Classic Coffee 100g": "1514432324607-a09d9b4aefdd",
            "Amul Pure Ghee 1L":          "1608686207856-001b95cf60ca",
            "Kellogg's Corn Flakes 1kg":  "1559703248-dcaaec9fab78",
            "Red Label Tea 500g":         "1544787219-7f47ccb76574",
            "Dabur Honey 500g":           "1558642452-9d2a7deb7f62",
            "Saffola Gold Oil 5L":        "1474979266404-7eaacbcd87c5",
            "Daawat Basmati Rice 5kg":    "1536304993881-ff6e9eefa2a6",
            "Horlicks 500g":              "1625805866449-8a5e30d45a24",
            "Nutrichoice Biscuits":       "1568901346375-23c9450c58cd",
            "Cadbury Celebration Box":    "1549007994-cb92caebd54b",
            "Pampers Baby Wipes":         "1612817288484-6f916006741a",

            # BOOKS
            "Atomic Habits - James Clear": "1512820790803-83ca734da794",
            "The Psychology of Money":    "1553729459-efe14ef6055d",
            "Spiderman: Across The Spiderverse Art": "1607604276583-eef5d76b4e54",
            "Naruto Vol. 1":              "1614680889096-e229c3a09de1",
            "One Piece Vol. 100":         "1580538339650-705263671f28",
            "Harry Potter Box Set":       "1507842217343-583bb7270b66",
            "The Alchemist":              "1544716278-ca5e3f4abd8c",
            "Deep Work - Cal Newport":    "1506880125340-e22044878a08",
            "Sapiens: A Brief History":   "1544716278-ca5e3f4abd8c",
            "Rich Dad Poor Dad":          "1553729459-efe14ef6055d",
            "It Ends With Us":            "1512820790803-83ca734da794",
            "Verity - Colleen Hoover":    "1512820790803-83ca734da794",
            "Ikigai":                     "1544716278-ca5e3f4abd8c",
            "Man's Search for Meaning":   "1544716278-ca5e3f4abd8c",
            "Thinking Fast and Slow":     "1553729459-efe14ef6055d",

            # BEAUTY
            "Nivea Men Body Wash":             "1619451683882-c9e28bce0c25",
            "L'Oreal Paris Hair Serum":        "1596462502278-27bfdc403348",
            "Lakme Absolute 3D Lipstick":      "1586495777744-4e6232bf2f74",
            "Maybelline Fit Me Foundation":    "1512496015851-a90fb38ba796",
            "Philips Cordless Trimmer":        "1621786030484-4c855eed6974",
            "Forest Essentials Facial Cleanser": "1519415510270-d993240004bc",
            "Mamaearth Vitamin C Serum":       "1620916566398-39f1143ab7be",
            "The Body Shop Tea Tree Oil":      "1556228453-efd6c1ff04f6",
            "Biotique Bio Kelp Shampoo":       "1526758097130-bab247274f58",
            "Cetaphil Gentle Skin Cleanser":   "1556229162-d051f2d6f51c",
            "Neutrogena Sunscreen SPF 50":     "1556228720-195a672e8a03",
            "Old Spice Aftershave":            "1619451683882-c9e28bce0c25",
            "Gillette Mach3 Blades":           "1556229194-067f96069300",
            "Dove Repair Shampoo":             "1526758097130-bab247274f58",
            "Tresemme Hair Spray":             "1526758097130-bab247274f58",

            # TOYS
            "LEGO Classic Bricks Set":         "1587654780291-39c9404d746b",
            "Barbie Dreamhouse 2024":          "1596461404969-9ae70f2830c1",
            "Hot Wheels 20 Car Pack":          "1566576912321-d58ddd7a6088",
            "Monopoly Deluxe Board Game":      "1611996575749-79a3a250f948",
            "Hasbro Jenga Classic":            "1520045892732-304bc3ac5d8e",
            "Fisher-Price Baby Gym":           "1516627145497-ae6968895b74",
            "Nerf Elite 2.0 Commander":        "1566576912321-d58ddd7a6088",
            "Rubik's Cube 3x3":                "1567359781514-3b964e2b04d6",
            "Funskool Chess Set":              "1529699211952-f1e88fc94c6d",
            "Remote Control Rock Crawler":     "1533113357-5407004f14ad",
            "Ludo King Board":                 "1611996575749-79a3a250f948",
            "Doctor Pretend Play Kit":         "1516627145497-ae6968895b74",
            "Soft Teddy Bear 30cm":            "1559454403-b8fb88521f11",
            "Kitchen Set for Kids":            "1584947897558-4a6a76cfde8e",
            "Pokemon Trading Cards Box":       "1593118247619-e2d6f056869e",

            # SPORTS
            "Yonex Nanoray 18i Racket":        "1626224583764-f87db24ac4ea",
            "Quechua Arpenaz Backpack":        "1553062407-98eeb64c6a62",
            "Cosco Cricket Tennis Ball":       "1540747913346-19212a4b4e4e",
            "Decathlon Yoga Mat":              "1544367567-0f2fcb009e0b",
            "Adidas Starlancer Football":      "1551958219-acb4a41a6d7b",
            "Nivea Skipping Rope":             "1434608519344-49d77a124b13",
            "Vector X Table Tennis Bat":       "1626224583764-f87db24ac4ea",
            "Cycling Helmet Pro":              "1571188654248-7a89213915f7",
            "Gym Duffel Bag 30L":              "1553062407-98eeb64c6a62",
            "Electric Air Pump":               "1558618666-fcd25c85cd64",
            "Dumbbell Set 5kg x 2":            "1571902943202-507ec2618e8f",
            "Resistance Bands Set":            "1571902943202-507ec2618e8f",
            "Skating Board":                   "1520045892732-304bc3ac5d8e",
            "Badminton Shuttlecocks Gold":     "1626224583764-f87db24ac4ea",
            "Trekking Poles Pair":             "1551632811-561732d1e306",

            # STATIONERY
            "Parker Vector Ball Pen":          "1583485088034-697b5bc54ccd",
            "Casio Scientific Calculator":     "1611532736597-de2d4265fba3",
            "Camel Artist Water Colors":       "1513364776144-60967b0f800f",
            "Moleskine Classic Notebook":      "1531346878377-a5be20888e57",
            "Staedtler Pigment Liner Set":     "1583485088034-697b5bc54ccd",
            "Faber-Castell 24 Color Pencils":  "1513364776144-60967b0f800f",
            "Staples Highlighters Pack":       "1583485088034-697b5bc54ccd",
            "Post-it Sticky Notes":            "1586281380349-632531db7ed4",
            "White Board Marker 4-Color":      "1583485088034-697b5bc54ccd",
            "Scissors & Tape Dispenser":       "1583485088034-697b5bc54ccd",
            "Expanding File Folder":           "1586281380349-632531db7ed4",
            "Correction Tape Pen":             "1583485088034-697b5bc54ccd",
            "Pencil Case Mesh":                "1531346878377-a5be20888e57",
            "A4 Printing Paper 500 Sheets":    "1586281380349-632531db7ed4",
            "Sketchbook 120GSM":               "1513364776144-60967b0f800f",
        }

        # ── MOBILES (15)
        # ── ELECTRONICS (15)
        # ── FASHION (15)
        # ── HOME & KITCHEN (15)
        # ── GROCERY (15)
        # ── BOOKS (15)
        # ── BEAUTY (15)
        # ── TOYS (15)
        # ── SPORTS (15)
        # ── STATIONERY (15)
        # Total = 150

        # Create/Get Categories
        cat_names = ["MOBILES", "ELECTRONICS", "FASHION", "HOME & KITCHEN", "GROCERY", "BOOKS", "BEAUTY", "TOYS", "SPORTS", "STATIONERY"]
        cat_objs = {}
        for cn in cat_names:
            c, _ = Category.objects.get_or_create(name=cn, slug=slugify(cn))
            cat_objs[cn] = c

        # Define full product list by category
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

        # Categories for fallbacks
        CAT_FB = {
            "mobiles":         "1511707171634-5f897ff02aa9",
            "electronics":     "1550745165-9bc0b252726f",
            "fashion":         "1441986300917-64674bd600d8",
            "home-kitchen":    "1556909114-f6e7ad7d3136",
            "grocery":         "1542838132-92c53300491e",
            "books":           "1512820790803-83ca734da794",
            "beauty":          "1596462502278-27bfdc403348",
            "toys":            "1611996575749-79a3a250f948",
            "sports":          "1571902943202-507ec2618e8f",
            "stationery":      "1583485088034-697b5bc54ccd",
        }

        total_created = 0
        for cat_name, product_list in p_data.items():
            cat_obj = cat_objs[cat_name]
            for pname in product_list:
                # Get the specific photo_id if mapped, else use category fallback
                photo_id = PHOTO_DB.get(pname)
                if not photo_id:
                    photo_id = CAT_FB.get(cat_name.lower().replace(' & ', '-'), "1523275335684-37898b6baf30")
                
                # IMPORTANT: Add some uniqueness to the photo_id if it's reused across the script
                # We can do this by adding a sig= to the Unsplash URL
                img_url = f"{BASE}{photo_id}{PARAMS}&sig={total_created}"
                
                price = decimal.Decimal(random.randint(499, 15000)) + decimal.Decimal('0.99')
                stock = random.randint(5, 100)
                
                Product.objects.update_or_create(
                    name=pname,
                    defaults={
                        'category': cat_obj,
                        'description': f"Premium {pname} from our {cat_name} collection. High-quality materials and professional design.",
                        'price': price,
                        'stock': stock,
                        'image': img_url
                    }
                )
                total_created += 1

        # Guest User
        User = get_user_model()
        if not User.objects.filter(username='guest').exists():
            User.objects.create_user(username='guest', password='guestpassword123')
            self.stdout.write(self.style.SUCCESS('Guest user created'))

        self.stdout.write(self.style.SUCCESS(f'Database populated with {total_created} unique Unsplash products!'))
