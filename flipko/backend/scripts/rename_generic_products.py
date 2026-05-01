import os
import django
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product, Category

# Real product names for randomization
REAL_PRODUCTS = {
    "Mobiles": [
        "Samsung Galaxy M34 5G", "Realme C53", "Vivo T2x 5G", "POCO M6 Pro 5G",
        "Redmi 12 5G", "Infinix Note 30 5G", "Samsung Galaxy F34 5G", "Moto G54 5G",
        "iQOO Z7S 5G", "Oppo A78 5G", "Tecno Pova 5 Pro", "Lava Agni 2 5G",
        "Samsung Galaxy F14 5G", "Realme 11x 5G", "Nokia G42 5G"
    ],
    "Electronics": [
        "JBL Go 3 Bluetooth Speaker", "Zebronics ZEB-JUKE BAR 9400", "TP-Link AC1200 Router",
        "HP v236w 64GB USB Fan", "Sandisk Ultra Dual 64GB", "Ambrane 20000mAh Powerbank",
        "Honeywell Moov 10W Speaker", "Digitek DTR 550LW Tripod", "WD My Passport 2TB",
        "Seagate One Touch 2TB", "APC Back-UPS 600VA", "Belkin 4-Socket Surge Protector",
        "Logitech C270 Webcam", "Blue Snowball iCE Mic", "Crucial P3 1TB SSD"
    ],
    "Fashion": [
        "Louis Philippe Men's Formal Shirt", "Peter England Men's Jeans", "Allen Solly Women's Handbag",
        "Jack & Jones Men's T-shirt", "Levis Men's Crew Neck T-shirt", "Biba Women's Kurta",
        "Van Heusen Men's Trousers", "Wildcraft 35L Backpack", "Skybags 25L Backpack",
        "Casual Men's Leather Belt", "Fastrack Men's Wallet", "Puma Men's Training Shoes",
        "Campus Men's Running Shoes", "Relaxo Men's Sparx Shoes", "Bata Men's Formal Shoes"
    ],
    "Home & Furniture": [
        "Solimo 3-Seater Sofa Set", "Sleepycat Ortho Memory Foam Mattress", "Milton Thermosteel 1L Bottle",
        "Pigeon 12L Oven Toaster Griller", "Bajaj GX-1 Mixer Grinder", "Butterfly Smart Glass Cooktop",
        "Hindustan Unilever Pureit Water Purifier", "Livpure Glo Water Purifier", "Kent Gold Plus Purifier",
        "Usha Swift 1200mm Ceiling Fan", "Crompton Hill Briz Fan", "Havells 10A Switch",
        "Orient Electric Apex Fan", "Godrej Interio Almirah", "Nilkamal Plastic Chair"
    ],
    "Appliances": [
        "IFB 6kg Front Load Washing Machine", "LG 7kg Top Load Washing Machine", "Samsung 253L Refrigerator",
        "Whirlpool 190L Refrigerator", "Haier 195L Refrigerator", "Panasonic 1.5 Ton AC",
        "Blue Star 1.5 Ton AC", "Daikin 1 Ton Split AC", "Godrej 5-Star AC",
        "BPL 564L Side By Side Refrigerator", "Kaff 60cm Kitchen Chimney", "Elica 60cm Auto Clean Chimney",
        "Prestige 20L OTG", "Kent 16036 Electric Kettle", "Inalsa 1000W Dry Iron"
    ],
    "Books": [
        "The Girl on the Train", "Gone Girl", "The Silent Patient", "Big Little Lies",
        "Thinking Fast and Slow", "Atomic Habits", "The Power of Your Subconscious Mind",
        "Rich Dad Poor Dad", "The 5 AM Club", "The Alchemist", "Zero to One",
        "The Lean Startup", "Deep Work", "Grit by Angela Duckworth", "Influence by Robert Cialdini"
    ],
    "Toys & Baby": [
        "LEGO City Fire Station", "Barbie Fashionistas Doll", "Hot Wheels Monster Truck",
        "Fisher-Price Baby Gym", "Nerf Elite 2.0 Commander", "Pampers Baby Wipes",
        "Huggies Diaper Pants", "Johnson's Baby Bath", "Sebamed Baby Lotion",
        "Himalaya Baby Powder", "Mee Mee Baby Walker", "Luvlap Baby Stroller",
        "Funskool Chess Set", "Scrabble Original", "Monopoly Classic"
    ],
    "Food & Health": [
        "Cadbury Milk Chocolate", "Nestlé Munch Wafer", "Parle-G Biscuits",
        "Lay's Potato Chips", "Coca-Cola 500ml", "Pepsi 500ml", "Red Bull 250ml",
        "Aashirvaad Atta 5kg", "Fortune Refined Oil 1L", "Dettol Liquid Soap",
        "Savlon Handwash", "Himalaya Herbal Toothpaste", "Colgate MaxFresh",
        "Amul Pasteurised Butter", "Narasu's Coffee 100g"
    ],
    "Beauty": [
        "Maybelline Fit Me Foundation", "Lakme Absolute Lipstick", "Loreál Paris Hair Color",
        "Nivea Men's Body Wash", "Park Avenue Cologne", "Fogg Body Spray",
        "Neutrogena Sunscreen", "Cetaphil Gentle Cleanser", "Mamaearth Vitamin C Serum",
        "Biotique Face Wash", "The Body Shop Tea Tree Oil", "Forest Essentials Facial Soap",
        "Nykaa Nail Polish", "MAC Fix+ Setting Spray", "Estée Lauder Night Repair"
    ],
    "Comics & Manga": [
        "Naruto Volume 1", "One Piece Volume 100", "Attack on Titan Vol 1",
        "My Hero Academia Vol 1", "Dragon Ball Z Vol 1", "Death Note Box Set",
        "Jujutsu Kaisen Vol 0", "Demon Slayer Vol 1", "Fullmetal Alchemist Vol 1",
        "Berserk Deluxe Edition 1", "Spider-Man Blue Marvel", "Batman Year One",
        "V for Vendetta", "Watchmen", "Saga Volume 1"
    ]
}

def main():
    products = Product.objects.filter(name__icontains="Premium Item")
    print(f"Renaming {products.count()} generic products...")
    
    renamed_count = 0
    for product in products:
        category_name = product.category.name
        if category_name in REAL_PRODUCTS:
            options = REAL_PRODUCTS[category_name]
            # Try to pick a unique name if possible
            new_name = random.choice(options)
            # Add a bit of uniqueness if still generic
            product.name = f"{new_name} ({product.name.split(' ')[-1]})"
            product.description = f"Experience premium quality with the {new_name}. High-performance and professional grade."
            from decimal import Decimal
            product.price = product.price + Decimal(str(round(random.uniform(-500.0, 500.0), 2)))
            product.save()
            renamed_count += 1
            
    print(f"Successfully renamed {renamed_count} products.")

if __name__ == '__main__':
    main()
