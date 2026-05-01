import requests
try:
    url = "https://m.media-amazon.com/images/I/91L9EF-OEGL.jpg"
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    print(f"Status: {r.status_code}, Length: {len(r.content)}")
    if r.status_code == 200:
        with open("test_img.jpg", "wb") as f:
            f.write(r.content)
            print("Saved test_img.jpg")
except Exception as e:
    print(f"Error: {e}")
