import os
import sys
import requests
import re
from io import BytesIO

# Setup Django Environment
sys.path.append(r"c:\Users\prudh\Desktop\flipko\flipko\backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flipko.settings")
import django
django.setup()

from django.core.files import File
from products.models import Category, Product

def populate_manga():
    cat, created = Category.objects.get_or_create(
        slug='comics-manga',
        defaults={'name': 'Comics & Manga'}
    )

    mangas = [
        ("Berserk: The Golden Age Arc", 1499.00, "Dark fantasy epic following Guts, a lone mercenary.", "https://images.unsplash.com/photo-1612036782180-6f0b6ce8470b?w=600&auto=format&fit=crop"),
        ("One Piece: East Blue Saga", 599.00, "Join Monkey D. Luffy on his quest to become the Pirate King.", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop"),
        ("Naruto: Uzumaki Chronicles", 499.00, "The story of a mischievous ninja who struggles for recognition.", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop"),
        ("Attack on Titan: Fall of Shiganshina", 899.00, "Humanity fights for survival against man-eating giants.", "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&auto=format&fit=crop"),
        ("Death Note: Black Edition Vol 1", 1299.00, "A high school student discovers a supernatural notebook.", "https://images.unsplash.com/photo-1618336753174-835698b67104?w=600&auto=format&fit=crop"),
        ("My Hero Academia: Origin", 650.00, "In a world where 80% of the population has superpowers.", "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=600&auto=format&fit=crop"),
        ("Demon Slayer: Cruelty", 750.00, "A kindhearted boy selling charcoal for a living finds his family slaughtered.", "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&auto=format&fit=crop"),
        ("Jujutsu Kaisen: Ryomen Sukuna", 699.00, "A boy swallows a cursed talisman to save his friends.", "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=600&auto=format&fit=crop"),
        ("Fullmetal Alchemist: Brotherhood Box", 4999.00, "Two brothers search for a Philosopher's Stone to restore their bodies.", "https://images.unsplash.com/photo-1626025437642-0b05076ca301?w=600&auto=format&fit=crop"),
        ("Tokyo Ghoul: Tragedy", 850.00, "A college student is attacked by a ghoul, a monster that feeds on human flesh.", "https://images.unsplash.com/photo-1599508704512-2f19efd1eede?w=600&auto=format&fit=crop"),
        ("Chainsaw Man: Dog and Chainsaw", 599.00, "A poor young man makes a contract with a chainsaw devil.", "https://images.unsplash.com/photo-1608681283626-d6682fedcf5a?w=600&auto=format&fit=crop"),
        ("Hunter x Hunter: Day of Departure", 799.00, "A young boy discovers that his father is a legendary Hunter.", "https://images.unsplash.com/photo-1614583225154-5fc2da81fc89?w=600&auto=format&fit=crop"),
        ("Vagabond: The Way of the Samurai", 1999.00, "A fictionalized account of the life of Japanese swordsman Musashi Miyamoto.", "https://images.unsplash.com/photo-1559814421-2fcbc6dc5a6d?w=600&auto=format&fit=crop"),
        ("JoJo's Bizarre Adventure: Phantom Blood", 1499.00, "The multi-generational tale of the heroic Joestar family.", "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?w=600&auto=format&fit=crop"),
        ("Dragon Ball Z: The Saiyan Invasion", 550.00, "Goku learns of his extraterrestrial heritage as Earth is threatened.", "https://images.unsplash.com/photo-1618336753174-835698b67104?w=600&auto=format&fit=crop"),
    ]

    for title, price, desc, url in mangas:
        if not Product.objects.filter(name=title).exists():
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    img_io = BytesIO(response.content)
                    slug_base = re.sub(r'[^a-z0-9]', '-', title.lower())
                    slug_base = re.sub(r'-+', '-', slug_base).strip('-')
                    
                    p = Product(
                        category=cat,
                        name=title,
                        price=price,
                        description=desc,
                        stock=50,
                        slug=slug_base
                    )
                    p.image.save(f"{slug_base}.jpg", File(img_io), save=False)
                    p.save()
                    print(f"Created: {title}")
                else:
                    print(f"Failed to fetch image for: {title} (HTTP {response.status_code})")
            except Exception as e:
                print(f"Error creating {title}: {e}")
        else:
            print(f"Skipped existing: {title}")

if __name__ == "__main__":
    populate_manga()
    print("Done!")
