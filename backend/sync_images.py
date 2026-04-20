import os
import django
import json
import urllib.request
from django.core.files.base import ContentFile
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# Precise Mapping based on exact DB names
final_mapping = {
    "ASUS Vivobook 15 Intel Core i3 11th Gen": "https://m.media-amazon.com/images/I/71J6MdOepuL._AC_UF1000,1000_QL80_.jpg",
    "SONY Alpha ILCE-6100L Mirrorless Camera": "https://shopatsc.com/cdn/shop/products/ILCE-6100L_B_IN5-1.jpg?v=1645091396",
    "Philips HL7756/00 750W Mixer Grinder": "https://m.media-amazon.com/images/I/51--Asj2vkL.jpg",
    "Bajaj Flora 3L Instant Water Heater": "https://m.media-amazon.com/images/I/51Wv6nI76ML._AC_UF1000,1000_QL80_.jpg",
    "IFB 20 L Solo Microwave Oven": "https://www.ifbappliances.com/media/catalog/product/2/0/20pm-mec2.png",
    "Pigeon by Stovekraft Cruise 1800W Induction Cooktop": "https://www.jiomart.com/images/product/original/rvlqon5isv/pigeon-prime-1800-w-induction-cooktop-push-button-black-new-lauch-product-images-orvlqon5isv-p606046931-0-202311021430.jpg?im=Resize=(1000,1000)",
    "Dyson V11 Absolute Pro Cord-Free Vacuum Cleaner": "https://dyson-h.assets.sh/is/image/dyson/370258-01-1?$pdp-main$&fmt=png-alpha&resMode=bichub",
    "LEGO Classic Creative Bricks 484-Piece Set": "https://mothercare.in/cdn/shop/products/9373864_1.jpg?v=1691238477",
    "Barbie Dreamhouse Playset": "https://m.media-amazon.com/images/I/81fSjL3-v7L.jpg",
    "Nerf N-Strike Elite Disruptor Blaster": "https://m.media-amazon.com/images/I/81tXv+v46XL._AC_UF1000,1000_QL80_.jpg",
    "Hot Wheels 20-Car Gift Pack": "https://m.media-amazon.com/images/I/71LAnitI1-L.jpg",
    "Maggi 2-Minute Masala Noodles (Pack of 12)": "https://m.media-amazon.com/images/I/71nN0XmOn+L.jpg",
    "Amul Butter 500g": "https://m.media-amazon.com/images/I/51vL07iJCML.jpg",
    "Bournvita Health Drink 1kg": "https://m.media-amazon.com/images/I/61Cg-mXpM9L.jpg",
    "Lay's Classic Salted Chips 52g (Pack of 16)": "https://m.media-amazon.com/images/I/713v9Sg8vVL.jpg",
    "Red Bull Energy Drink 250ml (Pack of 24)": "https://jayswines.com/wp-content/uploads/2020/10/buy-redbull-online-250ml.jpg",
    "Dettol Hand Sanitiser 500ml (Pack of 2)": "https://rawabihypermarket.com/uploads/product_images/featured_image/432449.jpg",
    "Savlon Antiseptic Liquid 1000ml": "https://betapharm.ng/wp-content/uploads/2024/11/images-13.jpeg",
    "Himalaya Purifying Neem Face Wash 200ml": "https://bk.shajgoj.com/storage/2018/10/Himalaya-Purifying-Neem-Face-Wash-150ml_sku5092.jpg",
    "Cetaphil Moisturising Lotion 250ml": "https://static.thcdn.com/images/large/original/productimg/1600/1600/13908200-9465005275335373.jpg",
    "Funskool Monopoly Board Game": "https://www.maziply.com/cdn/shop/files/monopoly-board-game-main_1024x.jpg?v=1698936214",
    "Funskool Scrabble Board Game": "https://www.bigw.com.au/medias/sys_master/images/images/ha3/h34/10766932934686.jpg",
    "Philips Avent Natural Baby Bottle 4oz (Pack of 2)": "https://static.beautytocare.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product/p/h/philips-avent-natural-response-airfree-vent-baby-bottle-1m-bear-260ml_1.png",
    "Pampers Active Baby Diapers M (76 Count)": "https://sweets-essentials.com/cdn/shop/files/12201419-1.jpg?v=1753193514",
    "Huggies Wonder Pants Medium (72 Count)": "https://media.nedigital.sg/fairprice/fpol/media/images/product/XL/13239894_XL1_20231005.jpg",
    "Johnson's Baby Powder 400g": "https://assets.healthylife.com.au/product-images/63250.jpg",
    "Mamaearth Gentle Cleansing Baby Shampoo 400ml": "https://www.trucare.com.np/wp-content/uploads/2023/04/Mamaearth-Gentle-Cleansing-Shampoo-For-Babies-200Ml.jpg",
    "WOW Skin Science Baby Body Wash 200ml": "https://staranddaisy.in/wp-content/uploads/2023/09/Body-Wash-p18923-main-1.jpg",
    "Maybelline Fit Me Matte + Poreless Foundation (120)": "https://www.cvs.com/bizcontent/merchandising/productimages/large/41554433449.jpg",
    "Lakme Absolute Matte Revolution Lip Color (Pink)": "https://www.harishfoodzone.com/jb-content/uploads/2020/10/Lakmé-Cushion-Matte-Lipstick-Pink-Prom.jpg",
    "MAC Retro Matte Lipstick (Ruby Woo)": "https://a.cdnsbn.com/images/products/xl/03299083002-1.jpg",
    "NYX Professional Makeup Soft Matte Lip Cream": "https://highfy.pk/cdn/shop/files/soft_matte_lip_cream_-_londonjpg224.jpg?v=1706771620&width=1445",
    "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50+ 88ml": "https://images.ctfassets.net/hpl1ps3eket1/3gvOmpDS45fg0SxzNSd7Ta/6b313d46e5c98599788ffa2cc7ff3222/NTG_086800687900_27315134_UltraSheer_Dry-Touch_Sunscreen_SPF50_00000.jpg",
    "Biotique Bio Coconut Whitening & Brightening Cream 50g": "https://m.media-amazon.com/images/I/51yh2XXDhAL._SL1000_.jpg",
    "Olay Regenerist Micro-Sculpting Cream 50g": "https://media.allure.com/photos/5926f6cb8f06243ddd840eb1/master/pass/Regenerist%20Micro-Sculpting%20Cream.jpg",
    "TRESemme Keratin Smooth Shampoo 580ml": "http://uwidirect.com/cdn/shop/files/022400393711_lg.jpg?v=1741088662",
    "Pantene Pro-V Total Damage Care Shampoo 650ml": "https://www.ohsogo.com/cdn/shop/files/711kXnNwVYL._SL1500_a1015294-145f-4eac-9125-701a6a4be27e.jpg?v=1709203052&width=1500",
    "Dove Intense Repair Shampoo 650ml": "https://assets.unileversolutions.com/v1/714677.jpg",
    "Apple iPhone 14 (Blue, 128 GB)": "https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_UF1000,1000_QL80_.jpg",
    "SAMSUNG Galaxy S23 5G (Green, 256 GB)": "https://m.media-amazon.com/images/I/61VfL-3stJL._AC_UF1000,1000_QL80_.jpg"
}

def download_image(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read()
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

def main():
    print(f"Processing {len(final_mapping)} items...")
    for name, url in final_mapping.items():
        try:
            p = Product.objects.filter(name=name).first()
            if not p:
                # Fallback to substring if exact fails (e.g. extra spaces)
                p = Product.objects.filter(name__icontains=name.strip()).first()
            
            if p:
                print(f"Updating: {p.name}")
                img_data = download_image(url)
                if img_data:
                    if p.image:
                        p.image.delete(save=False)
                    
                    ext = url.split('.')[-1].split('?')[0].lower()
                    if ext not in ['jpg', 'jpeg', 'png', 'webp']: ext = 'jpg'
                    
                    file_name = f"{slugify(p.name)}_{p.id}.{ext}"
                    p.image.save(file_name, ContentFile(img_data), save=True)
                    print(f"SUCCESS: {p.name}")
                else:
                    print(f"FAILED: Download failed for {p.name}")
            else:
                print(f"NOT FOUND: {name}")
        except Exception as e:
            print(f"ERROR: {name} -> {e}")

if __name__ == '__main__':
    main()
