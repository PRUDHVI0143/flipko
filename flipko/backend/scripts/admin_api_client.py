import requests
import json

class FlipkoAdminClient:
    def __init__(self, base_url="http://127.0.0.1:8000/api", username=None, password=None):
        self.base_url = base_url
        self.token = self._get_token(username, password)
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def _get_token(self, username, password):
        print(f"Authenticating as {username}...")
        url = f"{self.base_url}/accounts/token/"
        payload = {"username": username, "password": password}
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return response.json().get('access')
        else:
            raise Exception(f"Authentication failed: {response.text}")

    def list_products(self):
        url = f"{self.base_url}/products/"
        response = requests.get(url)
        return response.json().get('results', [])

    def update_product_image(self, product_id, new_image_url):
        print(f"Updating product {product_id} with new image...")
        url = f"{self.base_url}/products/{product_id}/"
        payload = {"image": new_image_url}
        response = requests.patch(url, json=payload, headers=self.headers)
        if response.status_code == 200:
            print(f"Successfully updated: {response.json().get('name')}")
            return response.json()
        else:
            print(f"Failed to update: {response.text}")
            return None

    def update_product_price(self, product_id, new_price):
        print(f"Updating product {product_id} with price {new_price}...")
        url = f"{self.base_url}/products/{product_id}/"
        payload = {"price": str(new_price)}
        response = requests.patch(url, json=payload, headers=self.headers)
        if response.status_code == 200:
            print(f"Successfully updated price for: {response.json().get('name')}")
            return response.json()
        else:
            print(f"Failed to update price: {response.text}")
            return None

# --- Example Usage ---
if __name__ == "__main__":
    # 1. Initialize client (Use your admin credentials)
    try:
        admin = FlipkoAdminClient(
            username="admin", 
            password="password" # This project uses AnyPasswordBackend, so any password works for admin
        )

        # 2. Example: Update a specific product image
        # Let's say product ID 1 is a Laptop
        # admin.update_product_image(1, "https://example.com/new-image.jpg")
        
        print("\nReady to manage Flipko Catalog via API.")
        
    except Exception as e:
        print(e)
