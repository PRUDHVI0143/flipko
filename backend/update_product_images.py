import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flipko.settings')
django.setup()

from products.models import Product

# ================================================================
# HIGH-FIDELITY PRODUCT IMAGE MAP
# ================================================================
PRODUCT_IMAGE_MAP = {
    # ── MOBILES ──
    "Apple iPhone 15 Pro":       "https://www.apple.com/v/iphone/home/bu/images/overview/select/iphone_15_pro__fba5ot874p6u_large.jpg",
    "Samsung Galaxy S24 Ultra":  "https://m.media-amazon.com/images/I/71RVuBy6q4L._SL1500_.jpg",
    "Google Pixel 8 Pro":        "https://m.media-amazon.com/images/I/71Rre6P1GEL._SL1500_.jpg",
    "OnePlus 12":                "https://m.media-amazon.com/images/I/71A9W-9wEGL._SL1500_.jpg",
    "Xiaomi 14":                 "https://m.media-amazon.com/images/I/51p1Z1Gq2UL._SL1500_.jpg",
    "Nothing Phone (2)":         "https://m.media-amazon.com/images/I/718NIdbES8L._SL1500_.jpg",
    "Vivo V30 Pro":              "https://m.media-amazon.com/images/I/61iVfK5p2WL._SL1500_.jpg",
    "OPPO Reno 11":              "https://m.media-amazon.com/images/I/71fVf5O0UFL._SL1500_.jpg",

    # ── ELECTRONICS ──
    "Apple MacBook Air M2":      "https://m.media-amazon.com/images/I/71f5Eu5lJSL._SL1500_.jpg",
    "Sony WH-1000XM5":           "https://m.media-amazon.com/images/I/51skS6iAtxL._SL1500_.jpg",
    "Dell XPS 13":               "https://m.media-amazon.com/images/I/71p-9Hk7nAL._SL1500_.jpg",
    "GoPro Hero 12":             "https://m.media-amazon.com/images/I/61z9P6X6zUL._SL1500_.jpg",
    "Sony Alpha 7 IV":           "https://m.media-amazon.com/images/I/71p-9Hk7nAL._SL1500_.jpg",

    # ── FASHION ──
    "Nike Air Jordan 1":          "https://m.media-amazon.com/images/I/71v9T7nL4XL._UL1500_.jpg",
    "Levi's Men's 511 Slim Jeans": "https://m.media-amazon.com/images/I/81shQ-EKL1L._UL1500_.jpg",
    "Ray-Ban Aviator Classic":    "https://m.media-amazon.com/images/I/61I07yC6WKL._AC_SL1500_.jpg",
    "Adidas Originals Superstar":  "https://m.media-amazon.com/images/I/71Xm+T7O+cL._UL1500_.jpg",

    # ── BOOKS ──
    "Atomic Habits - James Clear": "https://m.media-amazon.com/images/I/81bgE7F74ML._SL1500_.jpg",
    "The Psychology of Money":     "https://m.media-amazon.com/images/I/71g2ednj0JL._SL1500_.jpg",
    "Harry Potter Box Set":        "https://m.media-amazon.com/images/I/71Vj6D6S3NL._SL1500_.jpg",
    "Naruto Vol. 1":               "https://m.media-amazon.com/images/I/912x9psZByL.jpg",
    "One Piece Vol. 100":          "https://m.media-amazon.com/images/I/91m9Vq96-ZL._SL1500_.jpg",

    # ── TOYS ──
    "LEGO Classic Bricks Set":     "https://m.media-amazon.com/images/I/91M2vN+8O9L._SL1500_.jpg",
    "Barbie Dreamhouse 2024":      "https://m.media-amazon.com/images/I/81fH+0y8uSL._SL1500_.jpg",
    "Rubik's Cube 3x3":            "https://m.media-amazon.com/images/I/71l-9+8E6jL._SL1500_.jpg",
}

# Fallback categories for products not explicitly mapped
CATEGORY_FALLBACKS = {
    "mobiles": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    "electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80",
    "fashion": "https://images.unsplash.com/photo-1445205174239-1739707bc8b0?auto=format&fit=crop&w=800&q=80",
    "home-kitchen": "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80",
    "grocery": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    "books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    "beauty-grooming": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
    "toys-games": "https://images.unsplash.com/photo-1531279554141-1da1747854e1?auto=format&fit=crop&w=800&q=80",
    "sports-outdoor": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    "stationery": "https://images.unsplash.com/photo-1456735190827-d1262f71b39a?auto=format&fit=crop&w=800&q=80",
}

def update_images():
    products = Product.objects.all()
    updated = 0
    for product in products:
        if product.name in PRODUCT_IMAGE_MAP:
            product.image = PRODUCT_IMAGE_MAP[product.name]
            product.save()
            updated += 1
        else:
            # Category fallback
            cat_slug = product.category.slug
            if cat_slug in CATEGORY_FALLBACKS:
                product.image = CATEGORY_FALLBACKS[cat_slug]
                product.save()
                updated += 1
    
    print(f"Total: {products.count()} products. Updated: {updated} with high-fidelity visuals.")

if __name__ == "__main__":
    update_images()
