import json
import os

def update_mapping():
    mapping_path = os.path.join('resources', 'product_image_mapping.json')
    if not os.path.exists(mapping_path):
        print(f"Error: {mapping_path} not found")
        return

    with open(mapping_path, 'r') as f:
        data = json.load(f)

    mappings = {
        'Yonex Nanoray 18i Racket': 'https://m.media-amazon.com/images/I/71fLHnyZUmL._AC_UF894,1000_QL80_.jpg',
        'Quechua Arpenaz Backpack': 'https://m.media-amazon.com/images/I/81fS-yY-M3L._AC_UY1100_.jpg',
        'Cosco Cricket Tennis Ball': 'https://m.media-amazon.com/images/I/71QtQyiWYJL._AC_UF894,1000_QL80_.jpg',
        'Decathlon Yoga Mat': 'https://m.media-amazon.com/images/I/71Bw7V3WzKL._AC_UF894,1000_QL80_.jpg',
        'Adidas Starlancer Football': 'https://m.media-amazon.com/images/I/71z-D3m8+9L._AC_UF894,1000_QL80_.jpg',
        'Nivia Skipping Rope': 'https://m.media-amazon.com/images/I/71Oor0UD4-L._AC_UF894,1000_QL80_.jpg',
        'Vector X Table Tennis Bat': 'https://m.media-amazon.com/images/I/61cIT2nVDEL._AC_UF894,1000_QL80_.jpg',
        'Cycling Helmet Pro': 'https://m.media-amazon.com/images/I/61oIZws9RHL._AC_UF894,1000_QL80_.jpg',
        'Gym Duffel Bag 30L': 'https://m.media-amazon.com/images/I/61UmVZ3vjpL.jpg',
        'Electric Air Pump': 'https://m.media-amazon.com/images/I/61M6fKMmdOL._AC_UF894,1000_QL80_.jpg',
        'Dumbbell Set 5kg x 2': 'https://rukmini1.flixcart.com/image/1500/1500/xif0q/dumbbell/d/d/n/pvc-set-5kg-x-2-pcs-1-pair-hex-home-gym-5-hoc-original-imahcfgxvqgywaz8.jpeg?q=70',
        'Resistance Bands Set': 'https://m.media-amazon.com/images/I/61758lEkxjL._AC_UF894,1000_QL80_.jpg',
        'Skating Board': 'https://rukmini1.flixcart.com/image/1500/1500/l23mhzk0/skateboard/d/q/o/751-s-skating-board-17-novicz-5-original-imagdjyjrxhhknyg.jpeg?q=70',
        'Badminton Shuttlecocks Gold': 'https://m.media-amazon.com/images/I/81wA47+8RzL._AC_UF894,1000_QL80_.jpg',
        'Trekking Poles Pair': 'https://m.media-amazon.com/images/I/71+F13xNeGL._AC_UF894,1000_QL80_.jpg',
        'Nivea Men Body Wash': 'https://m.media-amazon.com/images/I/61YsNt7fj8L._SL1086_.jpg',
        'L\'Oreal Paris Hair Serum': 'https://rukminim2.flixcart.com/image/832/832/xif0q/hair-serum/1/x/x/-original-imagvh8c8ynvrzbh.jpeg?q=70&crop=false',
        'Lakme Absolute 3D Lipstick': 'https://m.media-amazon.com/images/I/51+pKuAAF8L._AC_UF1000,1000_QL80_.jpg',
        'Maybelline Fit Me Foundation': 'https://m.media-amazon.com/images/I/51ueY1K2BXL.jpg',
        'Philips Cordless Trimmer': 'https://rukminim1.flixcart.com/image/1664/1664/shaver/c/v/h/philips-grooming-kit-qg3030-15-original-imadgqgwduhypn4t.jpeg?q=90',
        'Forest Essentials Facial Cleanser': 'https://m.media-amazon.com/images/I/71j5S0aWtyL._SL1407_.jpg',
        'Mamaearth Vitamin C Serum': 'https://m.media-amazon.com/images/I/51zZo49wleL._SL1201_.jpg',
        'The Body Shop Tea Tree Oil': 'https://m.media-amazon.com/images/I/51lmOq3L+NL._SL1500_.jpg',
        'Biotique Bio Kelp Shampoo': 'https://m.media-amazon.com/images/I/51D0shnB7ZL._SL1000_.jpg',
        'Cetaphil Gentle Skin Cleanser': 'https://rukminim2.flixcart.com/image/832/832/xif0q/face-wash/n/y/s/1000-0-gentle-skin-cleanser-1-lit-cetaphil-original-imahcju8jgxd5xcs.jpeg?q=70&crop=false',
        'Neutrogena Sunscreen SPF 50': 'https://m.media-amazon.com/images/I/71qTUWQDzpL._AC_.jpg',
        'Old Spice Aftershave': 'https://m.media-amazon.com/images/I/715RyTw3FxL._SL1500_.jpg',
        'Gillette Mach3 Blades': 'https://m.media-amazon.com/images/I/71ZIb2Z7beL._SL1500_.jpg',
        'Dove Repair Shampoo': 'https://m.media-amazon.com/images/I/41y1U02xMUL._AC_UF1000,1000_QL80_.jpg',
        'Tresemme Hair Spray': 'https://m.media-amazon.com/images/I/81AS1N4Zh+L._AC_.jpg',
        'Aashirvaad Atta 5kg': 'https://m.media-amazon.com/images/I/91SWDnldaaL._SL1500_.jpg',
        'Fortune Refined Oil 1L': 'https://m.media-amazon.com/images/I/41rbZGGXdaL.jpg',
        'TATA Salt 1kg': 'https://m.media-amazon.com/images/I/51rya9i-ufL.jpg',
        'Maggi Masala Noodles 12-Pack': 'https://m.media-amazon.com/images/I/71T0QfFl+3L._SL1500_.jpg',
        'Nescafe Classic Coffee 100g': 'https://m.media-amazon.com/images/I/41pm0N0xAhL._AC_UF1000,1000_QL80_.jpg',
        'Daawat Rozana Basmati Rice 5kg': 'https://m.media-amazon.com/images/I/711e9Lalv7L._SL1247_.jpg',
        'Surf Excel Matic Liquid 2L': 'https://m.media-amazon.com/images/I/71AfKPJFjoL._SX522_.jpg',
        'Lizol Disinfectant Surface Cleaner 2L': 'https://m.media-amazon.com/images/I/71pfWY9ierL._SL1500_.jpg',
        'Vim Dishwash Gel 750ml': 'https://m.media-amazon.com/images/I/51xEYlRV2NL._SL1000_.jpg',
        'Ariel Matic Front Load Detergent 4kg': 'https://m.media-amazon.com/images/I/51nqdNiUkEL.jpg',
        'Dettol Liquid Handwash Refill 1.5L': 'https://m.media-amazon.com/images/I/515OCNdBF6L._SL1000_.jpg',
        'Colgate Strong Teeth Toothpaste 500g': 'https://m.media-amazon.com/images/I/71eJzZREDML._SL1500_.jpg',
        'Parle-G Gold Biscuits 1kg': 'https://m.media-amazon.com/images/I/71wtbkLMpbL._SL1500_.jpg',
        'Haldiram\'s Bhujia Sev 1kg': 'https://m.media-amazon.com/images/I/71ErNqU8prL._SL1500_.jpg',
        'Amul Pure Ghee 1L': 'https://m.media-amazon.com/images/I/61+MMAWgOLL._SL1000_.jpg'
    }

    data.update(mappings)
    
    with open(mapping_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"Successfully updated {len(mappings)} mappings in {mapping_path}")

if __name__ == "__main__":
    update_mapping()
