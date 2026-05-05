from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Product, Category
from django.contrib.auth import get_user_model
import decimal
import random

class Command(BaseCommand):
    help = 'Populates the database with 150 products and creates a guest user'

    def handle(self, *args, **options):
        M_BASE = "https://m.media-amazon.com/images/I/"
        
        IMAGE_DB = {
            # Mobiles
            "Apple iPhone 15 Pro":       "https://www.apple.com/v/iphone-15-pro/c/images/overview/incentive/iphone_15_pro__fba5ot874p6u_large.jpg",
            "Samsung Galaxy S24 Ultra":  M_BASE + "71RVuBy6q4L._SL1500_.jpg",
            "Google Pixel 8 Pro":        M_BASE + "71Rre6P1GEL._SL1500_.jpg",
            "OnePlus 12":                M_BASE + "71A9W-9wEGL._SL1500_.jpg",
            "Realme 12 Pro+":            M_BASE + "71pka-8S+TL._SL1500_.jpg",
            "Xiaomi 14":                 M_BASE + "51p1Z1Gq2UL._SL1500_.jpg",
            "Motorola Edge 40":          M_BASE + "61Nl8q9L6CL._SL1500_.jpg",
            "Vivo V30 Pro":              M_BASE + "61iVfK5p2WL._SL1500_.jpg",
            "Nothing Phone (2)":         M_BASE + "718NIdbES8L._SL1500_.jpg",
            "Poco X6 Pro":               M_BASE + "51fPr-vU07L._SL1500_.jpg",
            "Lava Agni 2":               M_BASE + "51p2W3rVz5L._SL1500_.jpg",
            "Infinix Note 30":           M_BASE + "41t-v7iO71L.jpg",
            "iQOO 12":                   M_BASE + "6186O8-vGSL._SL1500_.jpg",
            "Honor 90":                  M_BASE + "71fVf5O0UFL._SL1500_.jpg",
            "OPPO Reno 11":              M_BASE + "71fVf5O0UFL._SL1500_.jpg",
            # Electronics
            "Apple MacBook Air M2":      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665",
            "Sony WH-1000XM5":           M_BASE + "51skS6iAtxL._SL1500_.jpg",
            "Dell XPS 13":               M_BASE + "71p-9Hk7nAL._SL1500_.jpg",
            "iPad Air 5th Gen":          "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-purple-202203?wid=940&hei=1112&fmt=png-alpha&.v=1645066742664",
            "JBL Boombox 3":             M_BASE + "71q-v7lO71L._SL1500_.jpg",
            "Sony Alpha 7 IV":           M_BASE + "71T-v7lO71L._SL1500_.jpg",
            "Logitech MX Master 3S":     M_BASE + "61ni3t1ryQL._SL1500_.jpg",
            "Samsung 27 inch Curved Monitor": M_BASE + "81m-v7lO71L._SL1500_.jpg",
            "Kindle Paperwhite":         M_BASE + "61T9X8rLpGL._SL1500_.jpg",
            "GoPro Hero 12":             M_BASE + "61z9P6X6zUL._SL1500_.jpg",
            "Bose QuietComfort Ultra":   M_BASE + "51P-v7lO71L._SL1500_.jpg",
            "Canon EOS R6 Mark II":      M_BASE + "71v-v7lO71L._SL1500_.jpg",
            "Razer DeathAdder V3":       M_BASE + "61T-v1lO71L._SL1500_.jpg",
            "Marshall Emberton II":      M_BASE + "71Y-v1lO71L._SL1500_.jpg",
            "Western Digital 2TB SSD":   M_BASE + "51f-v1lO71L._SL1500_.jpg",
            # Fashion
            "Levi's Men's 511 Slim Jeans":      M_BASE + "81shQ-EKL1L._UL1500_.jpg",
            "Nike Air Jordan 1":                M_BASE + "71v9T7nL4XL._UL1500_.jpg",
            "Ray-Ban Aviator Classic":          M_BASE + "61I07yC6WKL._AC_SL1500_.jpg",
            "U.S. Polo Assn. T-Shirt":          M_BASE + "81T-v7lO71L._UL1500_.jpg",
            "Biba Women's Embroidered Kurta":   M_BASE + "91f-v7lO71L._UL1500_.jpg",
            "Adidas Originals Superstar":       M_BASE + "71Xm+T7O+cL._UL1500_.jpg",
            "Casio G-Shock Military":           M_BASE + "71G-v1lO71L._SL1500_.jpg",
            "Fossil Gen 6 Smartwatch":          M_BASE + "71F-v1lO71L._SL1500_.jpg",
            "Tommy Hilfiger Casual Belt":       M_BASE + "71B-v1lO71L._UL1500_.jpg",
            "Puma Running Shoes":               M_BASE + "71P-v1lO71L._UL1500_.jpg",
            "ZARA Linen Shrit":                 M_BASE + "71Z-v1lO71L._UL1500_.jpg",
            "H&M Oversized Hoodie":             M_BASE + "71H-v1lO71L._UL1500_.jpg",
            "Skechers GoWalk":                  M_BASE + "71S-v1lO71L._UL1500_.jpg",
            "Vans Old Skool":                   M_BASE + "71V-v1lO71L._UL1500_.jpg",
            "Daniel Wellington Rose Gold Watch": M_BASE + "71D-v1lO71L._SL1500_.jpg",
            # Home & Kitchen
            "Philips Air Fryer XL":             M_BASE + "61T-vq0O7DL._SL1500_.jpg",
            "Prestige Induction Cooktop":       M_BASE + "61q-v7lO71L._SL1500_.jpg",
            "Pigeon Non-Stick Cookware Set":    M_BASE + "71p-v7lO71L._SL1500_.jpg",
            "Bajaj Majesty Mixer Grinder":      M_BASE + "61b-v7lO71L._SL1500_.jpg",
            "Kent Grand+ Water Purifier":       M_BASE + "61k-v7lO71L._SL1500_.jpg",
            "LG 242L Double Door Fridge":       M_BASE + "71l-v7lO71L._SL1500_.jpg",
            "Dyson V15 Detect Vacuum":          "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/leaf-page-v2/cleaners/v15-detect/hero/Dyson-V15-Detect-Hero-Mobile.png",
            "Samsung 7kg Front Load Washer":    M_BASE + "71w-v7lO71L._SL1500_.jpg",
            "Sleepyhead Orthopedic Mattress":   M_BASE + "71m-v7lO71L._SL1500_.jpg",
            "Elica 60cm Filterless Chimney":    M_BASE + "61c-v7lO71L._SL1500_.jpg",
            "Eureka Forbes Vac":                M_BASE + "51v-v7lO71L._SL1500_.jpg",
            "Milton Thermosteel Bottle":        M_BASE + "51m-v7lO71L._SL1500_.jpg",
            "Morphy Richards OTG 24L":          M_BASE + "61m-v7lO71L._SL1500_.jpg",
            "Usha Swift Ceiling Fan":           M_BASE + "51f-v7lO71L._SL1500_.jpg",
            "Crompton Ozone Air Cooler":        M_BASE + "71a-v7lO71L._SL1500_.jpg",
            # Grocery
            "Aashirvaad Atta 5kg":             M_BASE + "71A-v7lO71L._SL1500_.jpg",
            "Fortune Refined Oil 1L":          M_BASE + "71O-v7lO71L._SL1500_.jpg",
            "TATA Salt 1kg":                   M_BASE + "61S-v7lO71L._SL1500_.jpg",
            "Maggi Masala Noodles 12-Pack":    M_BASE + "71M-v7lO71L._SL1500_.jpg",
            "Nescafe Classic Coffee 100g":     M_BASE + "71C-v7lO71L._SL1500_.jpg",
            "Amul Pure Ghee 1L":               M_BASE + "71G-v7lO71L._SL1500_.jpg",
            "Kellogg's Corn Flakes 1kg":       M_BASE + "71K-v7lO71L._SL1500_.jpg",
            "Red Label Tea 500g":              M_BASE + "71T-v1lO71L._SL1500_.jpg",
            "Dabur Honey 500g":                M_BASE + "71D-v1lO71L._SL1500_.jpg",
            "Saffola Gold Oil 5L":             M_BASE + "71S-v1lO71L._SL1500_.jpg",
            "Daawat Basmati Rice 5kg":         M_BASE + "71R-v1lO71L._SL1500_.jpg",
            "Horlicks 500g":                   M_BASE + "71H-v1lO71L._SL1500_.jpg",
            "Nutrichoice Biscuits":            M_BASE + "71N-v1lO71L._SL1500_.jpg",
            "Cadbury Celebration Box":         M_BASE + "71B-v1lO71L._SL1500_.jpg",
            "Pampers Baby Wipes":              M_BASE + "71P-v1lO71L._SL1500_.jpg",
            # Books
            "Atomic Habits - James Clear":     M_BASE + "81bgE7F74ML._SL1500_.jpg",
            "The Psychology of Money":         M_BASE + "71g2ednj0JL._SL1500_.jpg",
            "Spiderman: Across The Spiderverse Art": M_BASE + "71it8r+V-AL._AC_SL1500_.jpg",
            "Naruto Vol. 1":                   "https://m.media-amazon.com/images/I/912x9psZByL.jpg",
            "One Piece Vol. 100":              M_BASE + "91m9Vq96-ZL._SL1500_.jpg",
            "Harry Potter Box Set":            M_BASE + "71Vj6D6S3NL._SL1500_.jpg",
            "The Alchemist":                   M_BASE + "71a-v1lO71L._SL1500_.jpg",
            "Deep Work - Cal Newport":         M_BASE + "71D-v1lO71L._SL1500_.jpg",
            "Sapiens: A Brief History":        M_BASE + "71S-v1lO71L._SL1500_.jpg",
            "Rich Dad Poor Dad":               M_BASE + "71R-v1lO71L._SL1500_.jpg",
            "It Ends With Us":                 M_BASE + "71I-v1lO71L._SL1500_.jpg",
            "Verity - Colleen Hoover":         M_BASE + "71V-v1lO71L._SL1500_.jpg",
            "Ikigai":                          M_BASE + "71I-v2lO71L._SL1500_.jpg",
            "Man's Search for Meaning":        M_BASE + "71M-v1lO71L._SL1500_.jpg",
            "Thinking Fast and Slow":          M_BASE + "71T-v1lO71L._SL1500_.jpg",
            # Beauty
            "Nivea Men Body Wash":             M_BASE + "51v-v7lO71L._SL1500_.jpg",
            "L'Oreal Paris Hair Serum":        M_BASE + "61s-v7lO71L._SL1500_.jpg",
            "Lakme Absolute 3D Lipstick":      M_BASE + "61l-v7lO71L._SL1500_.jpg",
            "Maybelline Fit Me Foundation":    M_BASE + "61f-v7lO71L._SL1500_.jpg",
            "Philips Cordless Trimmer":        M_BASE + "61t-v7lO71L._SL1500_.jpg",
            "Forest Essentials Facial Cleanser": M_BASE + "61F-v1lO71L._SL1500_.jpg",
            "Mamaearth Vitamin C Serum":       M_BASE + "61M-v1lO71L._SL1500_.jpg",
            "The Body Shop Tea Tree Oil":      M_BASE + "51T-v1lO71L._SL1500_.jpg",
            "Biotique Bio Kelp Shampoo":       M_BASE + "61B-v1lO71L._SL1500_.jpg",
            "Cetaphil Gentle Skin Cleanser":   M_BASE + "61C-v1lO71L._SL1500_.jpg",
            "Neutrogena Sunscreen SPF 50":     M_BASE + "61N-v1lO71L._SL1500_.jpg",
            "Old Spice Aftershave":            M_BASE + "61O-v1lO71L._SL1500_.jpg",
            "Gillette Mach3 Blades":           M_BASE + "61G-v1lO71L._SL1500_.jpg",
            "Dove Repair Shampoo":             M_BASE + "61D-v1lO71L._SL1500_.jpg",
            "Tresemme Hair Spray":             M_BASE + "61T-v1lO71L._SL1500_.jpg",
            # Toys
            "LEGO Classic Bricks Set":         M_BASE + "91M2vN+8O9L._SL1500_.jpg",
            "Barbie Dreamhouse 2024":          M_BASE + "81fH+0y8uSL._SL1500_.jpg",
            "Hot Wheels 20 Car Pack":          M_BASE + "91H-v1lO71L._SL1500_.jpg",
            "Monopoly Deluxe Board Game":      M_BASE + "81M-v1lO71L._SL1500_.jpg",
            "Hasbro Jenga Classic":            M_BASE + "71J-v1lO71L._SL1500_.jpg",
            "Fisher-Price Baby Gym":           M_BASE + "81F-v1lO71L._SL1500_.jpg",
            "Nerf Elite 2.0 Commander":        M_BASE + "71N-v1lO71L._SL1500_.jpg",
            "Rubik's Cube 3x3":                M_BASE + "71l-9+8E6jL._SL1500_.jpg",
            "Funskool Chess Set":              M_BASE + "71C-v1lO71L._SL1500_.jpg",
            "Remote Control Rock Crawler":     M_BASE + "71R-v1lO71L._SL1500_.jpg",
            "Ludo King Board":                 M_BASE + "71L-v1lO71L._SL1500_.jpg",
            "Doctor Pretend Play Kit":         M_BASE + "71D-v2lO71L._SL1500_.jpg",
            "Soft Teddy Bear 30cm":            M_BASE + "71S-v1lO71L._SL1500_.jpg",
            "Kitchen Set for Kids":            M_BASE + "71K-v1lO71L._SL1500_.jpg",
            "Pokemon Trading Cards Box":       M_BASE + "71P-v1lO71L._SL1500_.jpg",
            # Sports
            "Yonex Nanoray 18i Racket":        M_BASE + "61Y-v7lO71L._SL1500_.jpg",
            "Quechua Arpenaz Backpack":        M_BASE + "71Q-v7lO71L._SL1500_.jpg",
            "Cosco Cricket Tennis Ball":       M_BASE + "61c-v7lO71L._SL1500_.jpg",
            "Decathlon Yoga Mat":              M_BASE + "71y-v7lO71L._SL1500_.jpg",
            "Adidas Starlancer Football":      M_BASE + "71a-v7lO71L._SL1500_.jpg",
            "Nivea Skipping Rope":             M_BASE + "51n-v7lO71L._SL1500_.jpg",
            "Vector X Table Tennis Bat":       M_BASE + "61v-v7lO71L._SL1500_.jpg",
            "Cycling Helmet Pro":              M_BASE + "61h-v7lO71L._SL1500_.jpg",
            "Gym Duffel Bag 30L":              M_BASE + "61g-v7lO71L._SL1500_.jpg",
            "Electric Air Pump":               M_BASE + "51e-v7lO71L._SL1500_.jpg",
            "Dumbbell Set 5kg x 2":            M_BASE + "61d-v7lO71L._SL1500_.jpg",
            "Resistance Bands Set":            M_BASE + "61r-v7lO71L._SL1500_.jpg",
            "Skating Board":                   M_BASE + "61s-v1lO71L._SL1500_.jpg",
            "Badminton Shuttlecocks Gold":     M_BASE + "61b-v1lO71L._SL1500_.jpg",
            "Trekking Poles Pair":             M_BASE + "61t-v1lO71L._SL1500_.jpg",
            # Stationery
            "Parker Vector Ball Pen":          M_BASE + "61P-v7lO71L._SL1500_.jpg",
            "Casio Scientific Calculator":     M_BASE + "61C-v7lO71L._SL1500_.jpg",
            "Camel Artist Water Colors":       M_BASE + "71c-v7lO71L._SL1500_.jpg",
            "Moleskine Classic Notebook":      M_BASE + "61m-v7lO71L._SL1500_.jpg",
            "Staedtler Pigment Liner Set":     M_BASE + "71s-v7lO71L._SL1500_.jpg",
            "Faber-Castell 24 Color Pencils":  M_BASE + "71f-v7lO71L._SL1500_.jpg",
            "Staples Highlighters Pack":       M_BASE + "61S-v1lO71L._SL1500_.jpg",
            "Post-it Sticky Notes":            M_BASE + "61p-v1lO71L._SL1500_.jpg",
            "White Board Marker 4-Color":      M_BASE + "61w-v1lO71L._SL1500_.jpg",
            "Scissors & Tape Dispenser":       M_BASE + "61s-v1lO71L._SL1500_.jpg",
            "Expanding File Folder":           M_BASE + "71e-v1lO71L._SL1500_.jpg",
            "Correction Tape Pen":             M_BASE + "61c-v1lO71L._SL1500_.jpg",
            "Pencil Case Mesh":                M_BASE + "61p-v2lO71L._SL1500_.jpg",
            "A4 Printing Paper 500 Sheets":    M_BASE + "61a-v1lO71L._SL1500_.jpg",
            "Sketchbook 120GSM":               M_BASE + "71s-v2lO71L._SL1500_.jpg",
        }

        cats = {
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

        created_count = 0
        for cat_name, product_list in cats.items():
            cat, _ = Category.objects.get_or_create(name=cat_name, slug=slugify(cat_name))
            for name in product_list:
                if name in IMAGE_DB:
                    price = decimal.Decimal(random.randint(499, 15000)) + decimal.Decimal('0.99')
                    stock = random.randint(10, 100)
                    Product.objects.update_or_create(
                        name=name,
                        defaults={
                            'category': cat,
                            'description': f"Premium {name} with high-quality features.",
                            'price': price,
                            'stock': stock,
                            'image': IMAGE_DB[name]
                        }
                    )
                    created_count += 1
        
        # Create Guest User
        User = get_user_model()
        if not User.objects.filter(username='guest').exists():
            User.objects.create_user(username='guest', password='guestpassword123')
            self.stdout.write(self.style.SUCCESS('Successfully created guest user'))

        self.stdout.write(self.style.SUCCESS(f'Successfully populated database with {created_count} products'))
