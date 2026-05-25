"""
run_master_sync.py - Wrapper that sets up sys.path and runs master_image_sync.apply_images()
"""
import os, sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')

import django
django.setup()

from products.models import Product
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

def unsplash_url(photo_id):
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w=600&h=600&q=85"

# Complete verified mapping for all 150 products
IMAGE_MAP = {
    # MOBILES
    "Apple iPhone 15 Pro":              "1695048133142-1a20484d2569",
    "Samsung Galaxy S24 Ultra":         "1610945415295-d9bbf067e59c",
    "Google Pixel 8 Pro":               "1598327105666-5b89351aff97",
    "OnePlus 12":                        "1585060544812-6b45742d762f",
    "Realme 12 Pro+":                    "1592899677977-9c10ca588bbd",
    "Xiaomi 14":                         "1580910051074-3eb694886505",
    "Motorola Edge 40":                  "1605236453806-6ff36851218e",
    "Vivo V30 Pro":                      "1601784551446-20c9e07cdbdb",
    "Nothing Phone (2)":                 "1565849904461-04a58ad377e0",
    "Poco X6 Pro":                       "1591337676887-a217a6970a8a",
    "Lava Agni 2":                       "1511707171634-5f897ff02aa9",
    "Infinix Note 30":                   "1609840114035-3c981b782dfe",
    "iQOO 12":                           "1574944985070-8f3ebc6b79d2",
    "Honor 90":                          "1512941937-f712b0e5a30c",
    "OPPO Reno 11":                      "1556656793-08538906a9f8",

    # ELECTRONICS
    "Apple MacBook Air M2":              "1611186871525-23a0c1765cee",
    "Sony WH-1000XM5":                   "1505740420928-5e560c06d30e",
    "Dell XPS 13":                       "1593642632559-0c6d3fc62b89",
    "iPad Air 5th Gen":                  "1544244015-0df4b3ffc6b0",
    "JBL Boombox 3":                     "1608043152269-423dbba4e7e1",
    "Sony Alpha 7 IV":                   "1516035069371-29a1b244cc32",
    "Logitech MX Master 3S":             "1527864550417-7fd91fc51a46",
    "Samsung 27 inch Curved Monitor":    "1555421689-491a97ff2040",
    "Kindle Paperwhite":                 "1507842217343-583bb7270b66",
    "GoPro Hero 12":                     "1526170375885-4d8ecf77b99f",
    "Bose QuietComfort Ultra":           "1484704849700-f032a568e944",
    "Canon EOS R6 Mark II":              "1502920917128-1aa500764cbd",
    "Razer DeathAdder V3":               "1563297007-8f550ac06cb2",
    "Marshall Emberton II":              "1545454675-3d03c97c8c4d",
    "Western Digital 2TB SSD":           "1597872200969-2b65d56bd16b",

    # FASHION
    "Levi's Men's 511 Slim Jeans":       "1542272604-787c3835535d",
    "Nike Air Jordan 1":                 "1542291026-7eec264c27ff",
    "Ray-Ban Aviator Classic":           "1572635196237-14b3f281503f",
    "U.S. Polo Assn. T-Shirt":           "1521572163474-6864f9cf17ab",
    "Biba Women's Embroidered Kurta":    "1583391733956-3750e0ff4e8b",
    "Adidas Originals Superstar":        "1549298916-b41d501d3772",
    "Casio G-Shock Military":            "1524805444758-089113d48a6d",
    "Fossil Gen 6 Smartwatch":           "1523275335684-37898b6baf30",
    "Tommy Hilfiger Casual Belt":        "1624378439575-d8705ad7ae80",
    "Puma Running Shoes":                "1608231387042-66d1773d3028",
    "ZARA Linen Shrit":                  "1596755094514-f87e34085b2c",
    "H&M Oversized Hoodie":              "1556821840-3a63f15732ce",
    "Skechers GoWalk":                   "1600185365483-26d7a4cc7519",
    "Vans Old Skool":                    "1525966222134-fcfa99b8ae77",
    "Daniel Wellington Rose Gold Watch": "1524592094714-0f0654e20314",

    # HOME & KITCHEN
    "Philips Air Fryer XL":              "1585515320310-259814833e62",
    "Prestige Induction Cooktop":        "1584568694244-14fbdf83bd30",
    "Pigeon Non-Stick Cookware Set":     "1556909114-f6e7ad7d3136",
    "Bajaj Majesty Mixer Grinder":       "1586023492125-27b2c045efd7",
    "Kent Grand+ Water Purifier":        "1548839140-29a749e1cf4d",
    "LG 242L Double Door Fridge":        "1571175443880-49e1d25b2bc5",
    "Dyson V15 Detect Vacuum":           "1558618666-fcd25c85f7aa",
    "Samsung 7kg Front Load Washer":     "1626806787461-102c1bfaaea1",
    "Sleepyhead Orthopedic Mattress":    "1631049307264-da0ec9d70304",
    "Elica 60cm Filterless Chimney":     "1556909190-bfee1f23e3f1",
    "Eureka Forbes Vac":                 "1558618047-3f73b984f0a5",
    "Milton Thermosteel Bottle":         "1602143407151-7111542de6e8",
    "Morphy Richards OTG 24L":           "1585237672814-83cbdcc74547",
    "Usha Swift Ceiling Fan":            "1594394516093-501ba68a0ba6",
    "Crompton Ozone Air Cooler":         "1585771724684-38269d6639fd",

    # GROCERY
    "Aashirvaad Atta 5kg":               "1574323347407-f5e1ad6d020b",
    "Fortune Refined Oil 1L":            "1474979266404-7eaacbcd87c5",
    "TATA Salt 1kg":                     "1599940824399-b87987ceb72a",
    "Maggi Masala Noodles 12-Pack":      "1569718212165-3a8278d5f624",
    "Nescafe Classic Coffee 100g":       "1509042239860-f550ce710b93",
    "Amul Pure Ghee 1L":                 "1589985270826-4b7bb135bc9d",
    "Kellogg's Corn Flakes 1kg":         "1521483451569-e33803c0330c",
    "Red Label Tea 500g":                "1556679343-c7306c1976bc",
    "Dabur Honey 500g":                  "1587049352846-4a222e784d38",
    "Saffola Gold Oil 5L":               "1620706857370-e1b9770e8bb1",
    "Daawat Basmati Rice 5kg":           "1586201375761-83865001e31c",
    "Horlicks 500g":                     "1550583724-b2692b85b150",
    "Nutrichoice Biscuits":              "1558961363-fa8fdf82db35",
    "Cadbury Celebration Box":           "1481391319762-47dff72954d9",
    "Pampers Baby Wipes":                "1584839404-b2e9a12ceb9a",

    # BOOKS
    "Atomic Habits - James Clear":       "1544947950-fa07a98d237f",
    "The Psychology of Money":           "1512820790803-83ca734da794",
    "Spiderman: Across The Spiderverse Art": "1612180197598-96a41ac4f5f5",
    "Naruto Vol. 1":                     "1550399105-c4db5fb85c18",
    "One Piece Vol. 100":                "1612178537253-bccd437b730e",
    "Harry Potter Box Set":              "1506466010722-395aa6b48f01",
    "The Alchemist":                     "1476275466078-4007374efbbe",
    "Deep Work - Cal Newport":           "1507003211169-0a1dd7228f2d",
    "Sapiens: A Brief History":          "1481627834876-b7833e8f5570",
    "Rich Dad Poor Dad":                 "1553729459-ade2a6547b40",
    "It Ends With Us":                   "1519682337058-a94d519337bc",
    "Verity - Colleen Hoover":           "1474932430478-367dbb6832c1",
    "Ikigai":                            "1456513080510-7bf3a84b82f8",
    "Man's Search for Meaning":          "1532012197267-da84d127e765",
    "Thinking Fast and Slow":            "1495640388908-05fa85288e61",

    # BEAUTY & GROOMING
    "Nivea Men Body Wash":               "1556228578-8c89e6adf883",
    "L'Oreal Paris Hair Serum":          "1522337360788-8b13dee7a37e",
    "Lakme Absolute 3D Lipstick":        "1586495777744-4413f21062fa",
    "Maybelline Fit Me Foundation":      "1522335789203-aabd1fc54bc9",
    "Philips Cordless Trimmer":          "1621607512214-68297480165e",
    "Forest Essentials Facial Cleanser": "1556228841-a3c527ebefe5",
    "Mamaearth Vitamin C Serum":         "1611930022073-b7a4ba5fcccd",
    "The Body Shop Tea Tree Oil":        "1608571423902-90fbf73b98e7",
    "Biotique Bio Kelp Shampoo":         "1535585209827-a15fcdbc4c2d",
    "Cetaphil Gentle Skin Cleanser":     "1556228720-195a672e8a03",
    "Neutrogena Sunscreen SPF 50":       "1556228453-348f26ef61bb",
    "Old Spice Aftershave":              "1600428877878-1a0ff561d2c4",
    "Gillette Mach3 Blades":             "1585386959984-a4155224a1ad",
    "Dove Repair Shampoo":               "1571781926291-c477ebfd024b",
    "Tresemme Hair Spray":               "1556227834-09f1f940e1ab",

    # TOYS & GAMES
    "LEGO Classic Bricks Set":           "1587654780291-39c9404d7dd0",
    "Barbie Dreamhouse 2024":            "1558060169-026d5428b33e",
    "Hot Wheels 20 Car Pack":            "1594787318286-3d835c1d0aeb",
    "Monopoly Deluxe Board Game":        "1610890716171-6b1bb98ffd09",
    "Hasbro Jenga Classic":              "1597058712635-3182d1eae1f4",
    "Fisher-Price Baby Gym":             "1515488042361-ee00e0ddd4e4",
    "Nerf Elite 2.0 Commander":          "1596461404969-9ae70f2830c1",
    "Rubik's Cube 3x3":                  "1577401239170-897942555fb3",
    "Funskool Chess Set":                "1529699211952-734e80c4d42b",
    "Remote Control Rock Crawler":       "1581235707941-1e1cb5f2b088",
    "Ludo King Board":                   "1611996575749-79a3a250f948",
    "Doctor Pretend Play Kit":           "1615461066841-6116e61058f4",
    "Soft Teddy Bear 30cm":              "1559715541-5630c2009af4",
    "Kitchen Set for Kids":              "1613478223719-2ab802602423",
    "Pokemon Trading Cards Box":         "1613771404721-1f92148fc5f7",

    # SPORTS & OUTDOOR
    "Yonex Nanoray 18i Racket":          "1554068865-24cecd4e34b8",
    "Quechua Arpenaz Backpack":          "1553062407-98eeb64c6a62",
    "Cosco Cricket Tennis Ball":         "1540747913346-19e32dc3e97e",
    "Decathlon Yoga Mat":                "1544367567-0f2fcb009e0b",
    "Adidas Starlancer Football":        "1575361204480-aadea25e6e68",
    "Nivea Skipping Rope":               "1517836357463-d25dfeac3438",
    "Vector X Table Tennis Bat":         "1558657292-22e0b5ced1f2",
    "Cycling Helmet Pro":                "1618832515490-a12f0afad4c0",
    "Gym Duffel Bag 30L":                "1553062407-98eeb64c6a62",
    "Electric Air Pump":                 "1571019613454-1cb2f99b2d8b",
    "Dumbbell Set 5kg x 2":              "1534438327276-14e5300c3a48",
    "Resistance Bands Set":              "1598289431512-b97b0917affc",
    "Skating Board":                     "1547447134-cd3f5c716030",
    "Badminton Shuttlecocks Gold":       "1592734361891-b742d6efac37",
    "Trekking Poles Pair":               "1551632811-561732d1e306",

    # STATIONERY
    "Parker Vector Ball Pen":            "1585336261022-7f24fcc21fa5",
    "Casio Scientific Calculator":       "1564939558297-fc396f18e5c7",
    "Camel Artist Water Colors":         "1513364776144-60967b0f800f",
    "Moleskine Classic Notebook":        "1531346680769-a1d79b57de5c",
    "Staedtler Pigment Liner Set":       "1513542789411-b6a5d4f31634",
    "Faber-Castell 24 Color Pencils":    "1506377295352-e3154d43ea9e",
    "Staples Highlighters Pack":         "1588075592405-d3f5ee4ac5b4",
    "Post-it Sticky Notes":              "1586281380117-5a60ae2050cc",
    "White Board Marker 4-Color":        "1503676382389-4809596d5290",
    "Scissors & Tape Dispenser":         "1583485088034-697b5bc54ccd",
    "Expanding File Folder":             "1568667256549-094345857a1a",
    "Correction Tape Pen":               "1585336261022-7f24fcc21fa5",
    "Pencil Case Mesh":                  "1609017909889-d7b582c072f3",
    "A4 Printing Paper 500 Sheets":      "1531346680769-a1d79b57de5c",
    "Sketchbook 120GSM":                 "1513364776144-60967b0f800f",
}

def main():
    products = Product.objects.select_related('category').all().order_by('id')
    total = products.count()
    updated = 0
    skipped = []

    print(f"Applying correct images to {total} products...\n")
    for p in products:
        if p.name in IMAGE_MAP:
            new_url = unsplash_url(IMAGE_MAP[p.name])
            if p.image != new_url:
                p.image = new_url
                p.save(update_fields=['image'])
                updated += 1
            print(f"  [OK] {p.name[:55]}")
        else:
            skipped.append(p.name)
            print(f"  [--] {p.name[:55]} NOT IN MAP")

    print(f"\n{'='*60}")
    print(f"Done! Updated {updated} products.")
    if skipped:
        print(f"Skipped (not in map): {skipped}")

if __name__ == '__main__':
    main()
