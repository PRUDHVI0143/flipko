import os
import django
import random
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Category, Product
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem
from django.contrib.auth.models import User

def recreate_everything():
    print("--- RECREATING EVERYTHING ---")
    
    # 1. Clear everything
    print("Clearing database...")
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    CartItem.objects.all().delete()
    Cart.objects.all().delete()
    Product.objects.all().delete()
    Category.objects.all().delete()
    
    # 2. Define Categories
    categories_data = [
        {'name': 'Mobiles', 'slug': 'mobiles'},
        {'name': 'Electronics', 'slug': 'electronics'},
        {'name': 'Fashion', 'slug': 'fashion'},
        {'name': 'Home & Kitchen', 'slug': 'home-kitchen'},
        {'name': 'Toys & Games', 'slug': 'toys-games'},
        {'name': 'Beauty & Grooming', 'slug': 'beauty-grooming'},
        {'name': 'Grocery', 'slug': 'grocery'},
        {'name': 'Books', 'slug': 'books'},
        {'name': 'Sports & Outdoor', 'slug': 'sports-outdoor'},
        {'name': 'Stationery', 'slug': 'stationery'},
    ]
    
    category_objs = {}
    for cat in categories_data:
        obj = Category.objects.create(name=cat['name'], slug=cat['slug'])
        category_objs[cat['slug']] = obj
        print(f"Created category: {cat['name']}")

    # 3. Define Products for each category
    products_map = {
        'mobiles': [
            "Apple iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Google Pixel 8 Pro", "OnePlus 12",
            "Realme 12 Pro+", "Xiaomi 14", "Motorola Edge 40", "Vivo V30 Pro", "Nothing Phone (2)",
            "Poco X6 Pro", "Lava Agni 2", "Infinix Note 30", "iQOO 12", "Honor 90", "OPPO Reno 11"
        ],
        'electronics': [
            "Apple MacBook Air M2", "Sony WH-1000XM5", "Dell XPS 13", "iPad Air 5th Gen",
            "JBL Boombox 3", "Sony Alpha 7 IV", "Logitech MX Master 3S", "Samsung 27 inch Curved Monitor",
            "Kindle Paperwhite", "GoPro Hero 12", "Bose QuietComfort Ultra", "Canon EOS R6 Mark II",
            "Razer DeathAdder V3", "Marshall Emberton II", "Western Digital 2TB SSD"
        ],
        'fashion': [
            "Levi's Men's 511 Slim Jeans", "Nike Air Jordan 1", "Ray-Ban Aviator Classic", "U.S. Polo Assn. T-Shirt",
            "Biba Women's Embroidered Kurta", "Adidas Originals Superstar", "Casio G-Shock Military", "Fossil Gen 6 Smartwatch",
            "Tommy Hilfiger Casual Belt", "Puma Running Shoes", "ZARA Linen Shrit", "H&M Oversized Hoodie",
            "Skechers GoWalk", "Vans Old Skool", "Daniel Wellington Rose Gold Watch"
        ],
        'home-kitchen': [
            "Philips Air Fryer XL", "Prestige Induction Cooktop", "Pigeon Non-Stick Cookware Set", "Bajaj Majesty Mixer Grinder",
            "Kent Grand+ Water Purifier", "LG 242L Double Door Fridge", "Dyson V15 Detect Vacuum", "Samsung 7kg Front Load Washer",
            "Sleepyhead Orthopedic Mattress", "Elica 60cm Filterless Chimney", "Eureka Forbes Vac", "Milton Thermosteel Bottle",
            "Morphy Richards OTG 24L", "Usha Swift Ceiling Fan", "Crompton Ozone Air Cooler"
        ],
        'grocery': [
            "Aashirvaad Atta 5kg", "Fortune Refined Oil 1L", "TATA Salt 1kg", "Maggi Masala Noodles 12-Pack",
            "Nescafe Classic Coffee 100g", "Amul Pure Ghee 1L", "Kellogg's Corn Flakes 1kg", "Red Label Tea 500g",
            "Dabur Honey 500g", "Saffola Gold Oil 5L", "Daawat Basmati Rice 5kg", "Horlicks 500g",
            "Nutrichoice Biscuits", "Cadbury Celebration Box", "Pampers Baby Wipes"
        ],
        'books': [
            "Atomic Habits - James Clear", "The Psychology of Money", "Spiderman: Across The Spiderverse Art", "Naruto Vol. 1",
            "One Piece Vol. 100", "Harry Potter Box Set", "The Alchemist", "Deep Work - Cal Newport",
            "Sapiens: A Brief History", "Rich Dad Poor Dad", "It Ends With Us", "Verity - Colleen Hoover",
            "Ikigai", "Man's Search for Meaning", "Thinking Fast and Slow"
        ],
        'beauty-grooming': [
            "Nivea Men Body Wash", "L'Oreal Paris Hair Serum", "Lakme Absolute 3D Lipstick", "Maybelline Fit Me Foundation",
            "Philips Cordless Trimmer", "Forest Essentials Facial Cleanser", "Mamaearth Vitamin C Serum", "The Body Shop Tea Tree Oil",
            "Biotique Bio Kelp Shampoo", "Cetaphil Gentle Skin Cleanser", "Neutrogena Sunscreen SPF 50", "Old Spice Aftershave",
            "Gillette Mach3 Blades", "Dove Repair Shampoo", "Tresemme Hair Spray"
        ],
        'toys-games': [
            "LEGO Classic Bricks Set", "Barbie Dreamhouse 2024", "Hot Wheels 20 Car Pack", "Monopoly Deluxe Board Game",
            "Hasbro Jenga Classic", "Fisher-Price Baby Gym", "Nerf Elite 2.0 Commander", "Rubik's Cube 3x3",
            "Funskool Chess Set", "Remote Control Rock Crawler", "Ludo King Board", "Doctor Pretend Play Kit",
            "Soft Teddy Bear 30cm", "Kitchen Set for Kids", "Pokemon Trading Cards Box"
        ],
        'sports-outdoor': [
            "Yonex Nanoray 18i Racket", "Quechua Arpenaz Backpack", "Cosco Cricket Tennis Ball", "Decathlon Yoga Mat",
            "Adidas Starlancer Football", "Nivea Skipping Rope", "Vector X Table Tennis Bat", "Cycling Helmet Pro",
            "Gym Duffel Bag 30L", "Electric Air Pump", "Dumbbell Set 5kg x 2", "Resistance Bands Set",
            "Skating Board", "Badminton Shuttlecocks Gold", "Trekking Poles Pair"
        ],
        'stationery': [
            "Parker Vector Ball Pen", "Casio Scientific Calculator", "Camel Artist Water Colors", "Moleskine Classic Notebook",
            "Staedtler Pigment Liner Set", "Faber-Castell 24 Color Pencils", "Staples Highlighters Pack", "Post-it Sticky Notes",
            "White Board Marker 4-Color", "Scissors & Tape Dispenser", "Expanding File Folder", "Correction Tape Pen",
            "Pencil Case Mesh", "A4 Printing Paper 500 Sheets", "Sketchbook 120GSM"
        ]
    }
    
    # 4. Premium Image Mapping for Flagships
    flagship_images = {
        "Apple iPhone 15 Pro": "https://m.media-amazon.com/images/I/81SigAnN7pL._AC_UF1000,1000_QL80_.jpg",
        "Samsung Galaxy S24 Ultra": "https://m.media-amazon.com/images/I/71JLfbYatnL._AC_UF1000,1000_QL80_.jpg",
        "Apple MacBook Air M2": "https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_UF1000,1000_QL80_.jpg",
        "Sony WH-1000XM5": "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_UF1000,1000_QL80_.jpg",
        "Nike Air Jordan 1": "https://m.media-amazon.com/images/I/71u3sI8Z9SL._AC_UF1000,1000_QL80_.jpg",
        "Philips Air Fryer XL": "https://m.media-amazon.com/images/I/61m71z78wSL._AC_UF1000,1000_QL80_.jpg",
        "Atomic Habits - James Clear": "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
        "LEGO Classic Bricks Set": "https://m.media-amazon.com/images/I/71M0XfG9LmL._AC_UF1000,1000_QL80_.jpg",
        "Barbie Dreamhouse 2024": "https://m.media-amazon.com/images/I/81fSjL3-v7L.jpg",
        "Dyson V15 Detect Vacuum": "https://m.media-amazon.com/images/I/51vI6S3Z6pL._AC_SL1200_.jpg",
        "Sony Alpha 7 IV": "https://m.media-amazon.com/images/I/81Wn6tH-8BL._AC_UF1000,1000_QL80_.jpg",
        "Maggi Masala Noodles 12-Pack": "https://m.media-amazon.com/images/I/81Y7p9+E9QL._AC_SL1500_.jpg",
        "Cadbury Celebration Box": "https://m.media-amazon.com/images/I/71m67Yv8S8L._SL1500_.jpg",
        "One Piece Vol. 100": "https://m.media-amazon.com/images/I/81t33B+Hj3L.jpg"
    }

    # 5. Create Products
    total_created = 0
    for slug, names in products_map.items():
        cat_obj = category_objs[slug]
        for name in names:
            price = Decimal(random.randint(200, 150000))
            if slug == 'grocery': price = Decimal(random.randint(50, 2000))
            if slug == 'mobiles': price = Decimal(random.randint(10000, 140000))
            if slug == 'books': price = Decimal(random.randint(150, 1500))
            
            # Check if flagship
            if name in flagship_images:
                image_url = flagship_images[name]
            else:
                image_url = f"https://loremflickr.com/600/600/{slug},product/all?lock={total_created + 300}"
            
            Product.objects.create(
                category=cat_obj,
                name=name,
                description=f"Premium {name} with latest features and high-quality build. Experience the best of {cat_obj.name} with our top-rated product lineup.",
                price=price,
                stock=random.randint(10, 100),
                image=image_url
            )
            total_created += 1
            if total_created % 10 == 0:
                print(f"Created {total_created} products...")

    print(f"Successfully recreated {total_created} products in {len(categories_data)} categories!")

    # 5. Fix Guest User
    User.objects.filter(username='guest').delete()
    user = User.objects.create(username='guest', email='guest@flipko.com')
    user.set_password('guest123')
    user.save()
    print("Guest user reset.")

if __name__ == "__main__":
    recreate_everything()
