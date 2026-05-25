"""
final_image_fix.py
Uses source.unsplash.com/?keyword URLs so every product ALWAYS shows a
relevant, topic-matched image. No more wrong photo IDs.
"""
import os, sys, django

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

def img(keywords):
    """Return a stable Unsplash source URL for the given keywords."""
    kw = keywords.replace(' ', '+')
    return f"https://source.unsplash.com/600x600/?{kw}"

# ── Complete keyword map for all 150 products ─────────────────────────────────
IMAGE_KEYWORDS = {
    # MOBILES
    "Apple iPhone 15 Pro":          img("iphone 15 pro apple smartphone"),
    "Samsung Galaxy S24 Ultra":     img("samsung galaxy s24 ultra android phone"),
    "Google Pixel 8 Pro":           img("google pixel 8 smartphone android"),
    "OnePlus 12":                   img("oneplus smartphone black android"),
    "Realme 12 Pro+":               img("realme smartphone mobile device"),
    "Xiaomi 14":                    img("xiaomi 14 smartphone phone"),
    "Motorola Edge 40":             img("motorola edge smartphone android"),
    "Vivo V30 Pro":                 img("vivo smartphone selfie camera phone"),
    "Nothing Phone (2)":            img("nothing phone transparent glyph mobile"),
    "Poco X6 Pro":                  img("poco gaming smartphone android"),
    "Lava Agni 2":                  img("budget smartphone android mobile"),
    "Infinix Note 30":              img("infinix smartphone mobile large screen"),
    "iQOO 12":                      img("gaming phone iqoo smartphone"),
    "Honor 90":                     img("honor smartphone android mobile phone"),
    "OPPO Reno 11":                 img("oppo reno smartphone camera android"),

    # ELECTRONICS
    "Apple MacBook Air M2":         img("macbook air m2 laptop apple silver"),
    "Sony WH-1000XM5":             img("sony headphones over ear wireless noise cancelling"),
    "Dell XPS 13":                  img("dell xps laptop thin ultrabook"),
    "iPad Air 5th Gen":             img("ipad tablet apple drawing"),
    "JBL Boombox 3":                img("jbl bluetooth speaker portable boombox"),
    "Sony Alpha 7 IV":              img("sony mirrorless camera photography dslr"),
    "Logitech MX Master 3S":       img("logitech mouse wireless computer peripheral"),
    "Samsung 27 inch Curved Monitor": img("curved gaming monitor display screen"),
    "Kindle Paperwhite":            img("kindle ereader reading digital book device"),
    "GoPro Hero 12":                img("gopro action camera outdoor adventure"),
    "Bose QuietComfort Ultra":      img("bose headphones wireless premium audio"),
    "Canon EOS R6 Mark II":         img("canon camera mirrorless photography"),
    "Razer DeathAdder V3":          img("razer gaming mouse rgb computer"),
    "Marshall Emberton II":         img("marshall bluetooth speaker music portable"),
    "Western Digital 2TB SSD":     img("ssd external hard drive storage"),

    # FASHION
    "Levi's Men's 511 Slim Jeans":  img("levis slim jeans denim blue pants"),
    "Nike Air Jordan 1":            img("nike air jordan 1 sneakers shoes"),
    "Ray-Ban Aviator Classic":      img("ray-ban aviator sunglasses stylish"),
    "U.S. Polo Assn. T-Shirt":      img("polo t-shirt casual menswear"),
    "Biba Women's Embroidered Kurta": img("women kurta indian ethnic embroidery"),
    "Adidas Originals Superstar":   img("adidas superstar sneakers white shoes"),
    "Casio G-Shock Military":       img("casio g-shock digital sports watch"),
    "Fossil Gen 6 Smartwatch":      img("fossil smartwatch leather strap digital"),
    "Tommy Hilfiger Casual Belt":   img("leather belt casual fashion accessory"),
    "Puma Running Shoes":           img("puma running shoes athletic footwear"),
    "ZARA Linen Shrit":             img("linen shirt men casual summer"),
    "H&M Oversized Hoodie":         img("oversized hoodie sweatshirt casual fashion"),
    "Skechers GoWalk":              img("skechers walking shoes comfort casual"),
    "Vans Old Skool":               img("vans old skool skateboard shoes"),
    "Daniel Wellington Rose Gold Watch": img("daniel wellington rose gold watch elegant"),

    # HOME & KITCHEN
    "Philips Air Fryer XL":         img("air fryer kitchen appliance cooking"),
    "Prestige Induction Cooktop":   img("induction cooktop stove cooking kitchen"),
    "Pigeon Non-Stick Cookware Set": img("non stick cookware pan set kitchen"),
    "Bajaj Majesty Mixer Grinder":  img("mixer grinder blender kitchen appliance"),
    "Kent Grand+ Water Purifier":   img("water purifier filter clean drinking"),
    "LG 242L Double Door Fridge":   img("double door refrigerator fridge kitchen"),
    "Dyson V15 Detect Vacuum":      img("dyson vacuum cleaner cordless home"),
    "Samsung 7kg Front Load Washer": img("front load washing machine laundry"),
    "Sleepyhead Orthopedic Mattress": img("mattress orthopedic bed sleep foam"),
    "Elica 60cm Filterless Chimney": img("kitchen chimney hood vent cooking"),
    "Eureka Forbes Vac":            img("vacuum cleaner home cleaning appliance"),
    "Milton Thermosteel Bottle":    img("thermos steel bottle insulated flask"),
    "Morphy Richards OTG 24L":      img("oven toaster grill kitchen baking OTG"),
    "Usha Swift Ceiling Fan":       img("ceiling fan home electricity air"),
    "Crompton Ozone Air Cooler":    img("air cooler desert cooler summer room"),

    # GROCERY
    "Aashirvaad Atta 5kg":          img("wheat flour atta bag grocery indian"),
    "Fortune Refined Oil 1L":       img("cooking oil bottle refined sunflower"),
    "TATA Salt 1kg":                img("salt packet grocery kitchen cooking"),
    "Maggi Masala Noodles 12-Pack": img("maggi instant noodles packet food"),
    "Nescafe Classic Coffee 100g":  img("nescafe coffee jar instant beverage"),
    "Amul Pure Ghee 1L":            img("ghee butter jar indian dairy clarified"),
    "Kellogg's Corn Flakes 1kg":    img("corn flakes cereal breakfast bowl"),
    "Red Label Tea 500g":           img("red label tea packet indian chai leaves"),
    "Dabur Honey 500g":             img("honey bottle bee natural sweet dabur"),
    "Saffola Gold Oil 5L":          img("healthy cooking oil heart saffola bottle"),
    "Daawat Basmati Rice 5kg":      img("basmati rice packet grain indian"),
    "Horlicks 500g":                img("horlicks health drink jar malt chocolate"),
    "Nutrichoice Biscuits":         img("digestive biscuits cookies healthy snack"),
    "Cadbury Celebration Box":      img("cadbury chocolate celebration gift box"),
    "Pampers Baby Wipes":           img("baby wipes diapers pampers infant"),

    # BOOKS
    "Atomic Habits - James Clear":  img("atomic habits book self help clear white"),
    "The Psychology of Money":      img("psychology money book personal finance"),
    "Spiderman: Across The Spiderverse Art": img("spiderman comic book art superhero marvel"),
    "Naruto Vol. 1":                img("naruto manga anime comic japanese volume"),
    "One Piece Vol. 100":           img("one piece manga anime comic volume 100"),
    "Harry Potter Box Set":         img("harry potter books collection box set fantasy"),
    "The Alchemist":                img("the alchemist book paulo coelho fiction"),
    "Deep Work - Cal Newport":      img("deep work book productivity focus study"),
    "Sapiens: A Brief History":     img("sapiens book history humanity yuval harari"),
    "Rich Dad Poor Dad":            img("rich dad poor dad finance book kiyosaki"),
    "It Ends With Us":              img("it ends with us novel romance colleen hoover"),
    "Verity - Colleen Hoover":      img("verity thriller novel mystery book"),
    "Ikigai":                       img("ikigai japanese philosophy book mindfulness"),
    "Man's Search for Meaning":     img("mans search for meaning book viktor frankl"),
    "Thinking Fast and Slow":       img("thinking fast slow psychology book kahneman"),

    # BEAUTY & GROOMING
    "Nivea Men Body Wash":          img("nivea men body wash shower gel bottle"),
    "L'Oreal Paris Hair Serum":     img("loreal hair serum bottle beauty haircare"),
    "Lakme Absolute 3D Lipstick":   img("lakme lipstick red makeup beauty cosmetic"),
    "Maybelline Fit Me Foundation": img("maybelline foundation makeup bottle cosmetics"),
    "Philips Cordless Trimmer":     img("philips beard trimmer grooming men electric"),
    "Forest Essentials Facial Cleanser": img("face wash cleanser skincare beauty organic"),
    "Mamaearth Vitamin C Serum":    img("vitamin c serum face glow skincare bottle"),
    "The Body Shop Tea Tree Oil":   img("tea tree oil body shop skincare natural"),
    "Biotique Bio Kelp Shampoo":    img("shampoo bottle hair care wash herbal"),
    "Cetaphil Gentle Skin Cleanser": img("cetaphil face wash gentle cleanser skin"),
    "Neutrogena Sunscreen SPF 50":  img("sunscreen spf 50 sun protection lotion"),
    "Old Spice Aftershave":         img("aftershave cologne men grooming bottle"),
    "Gillette Mach3 Blades":        img("gillette razor shaving blade men grooming"),
    "Dove Repair Shampoo":          img("dove shampoo hair repair conditioner bottle"),
    "Tresemme Hair Spray":          img("hair spray styling tresemme bottle hold"),

    # TOYS & GAMES
    "LEGO Classic Bricks Set":      img("lego colorful bricks building blocks toy"),
    "Barbie Dreamhouse 2024":       img("barbie doll house toy pink girls"),
    "Hot Wheels 20 Car Pack":       img("hot wheels toy cars racing miniature set"),
    "Monopoly Deluxe Board Game":   img("monopoly board game family playing"),
    "Hasbro Jenga Classic":         img("jenga wood blocks stacking tower game"),
    "Fisher-Price Baby Gym":        img("baby gym activity play mat infant"),
    "Nerf Elite 2.0 Commander":     img("nerf gun blaster foam darts toy"),
    "Rubik's Cube 3x3":             img("rubiks cube puzzle colorful 3x3"),
    "Funskool Chess Set":           img("chess set board game pieces strategy"),
    "Remote Control Rock Crawler":  img("remote control rc car offroad toy"),
    "Ludo King Board":              img("ludo board game dice family indoor"),
    "Doctor Pretend Play Kit":      img("doctor toy kit medical pretend play children"),
    "Soft Teddy Bear 30cm":         img("teddy bear plush soft toy brown stuffed"),
    "Kitchen Set for Kids":         img("kids kitchen toy cooking play set"),
    "Pokemon Trading Cards Box":    img("pokemon trading cards game pikachu box"),

    # SPORTS & OUTDOOR
    "Yonex Nanoray 18i Racket":     img("badminton racket yonex sports shuttlecock"),
    "Quechua Arpenaz Backpack":     img("hiking backpack trekking outdoor bag"),
    "Cosco Cricket Tennis Ball":    img("cricket ball sports leather red outdoor"),
    "Decathlon Yoga Mat":           img("yoga mat exercise fitness purple sport"),
    "Adidas Starlancer Football":   img("football soccer ball adidas sport"),
    "Nivea Skipping Rope":          img("skipping rope jump fitness workout"),
    "Vector X Table Tennis Bat":    img("table tennis bat ping pong paddle sport"),
    "Cycling Helmet Pro":           img("cycling helmet bike safety sport road"),
    "Gym Duffel Bag 30L":           img("gym bag duffel sports travel fitness"),
    "Electric Air Pump":            img("electric air pump inflator ball tire"),
    "Dumbbell Set 5kg x 2":         img("dumbbell weight fitness gym workout"),
    "Resistance Bands Set":         img("resistance bands exercise fitness yoga"),
    "Skating Board":                img("skateboard skating sport outdoor"),
    "Badminton Shuttlecocks Gold":  img("badminton shuttlecock feather sport"),
    "Trekking Poles Pair":          img("trekking hiking poles stick mountain"),

    # STATIONERY
    "Parker Vector Ball Pen":       img("parker pen ballpoint writing stationery"),
    "Casio Scientific Calculator":  img("casio scientific calculator math school"),
    "Camel Artist Water Colors":    img("watercolor paint brush art set colorful"),
    "Moleskine Classic Notebook":   img("moleskine notebook journal black writing"),
    "Staedtler Pigment Liner Set":  img("staedtler drawing pen art liner set"),
    "Faber-Castell 24 Color Pencils": img("color pencils faber castell drawing art set"),
    "Staples Highlighters Pack":    img("highlighter marker colorful stationery set"),
    "Post-it Sticky Notes":         img("sticky notes post it yellow paper desk"),
    "White Board Marker 4-Color":   img("whiteboard marker color set stationery"),
    "Scissors & Tape Dispenser":    img("scissors tape dispenser office stationery"),
    "Expanding File Folder":        img("file folder organizer document office"),
    "Correction Tape Pen":          img("correction tape pen white stationery"),
    "Pencil Case Mesh":             img("pencil case pouch stationery school bag"),
    "A4 Printing Paper 500 Sheets": img("a4 paper printing office white sheets"),
    "Sketchbook 120GSM":            img("sketchbook art drawing paper blank white"),
}


def main():
    products = Product.objects.all().order_by('id')
    total = products.count()
    updated = 0
    not_found = []

    print(f"Updating images for {total} products using keyword-based URLs...\n")
    for p in products:
        if p.name in IMAGE_KEYWORDS:
            p.image = IMAGE_KEYWORDS[p.name]
            p.save(update_fields=['image'])
            updated += 1
            print(f"  [OK] {p.name}")
        else:
            not_found.append(p.name)
            print(f"  [--] NOT IN MAP: {p.name}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated}/{total}")
    if not_found:
        print(f"Not found in map ({len(not_found)}): {not_found}")

if __name__ == '__main__':
    main()
