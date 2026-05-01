import urllib.request
import json

try:
    data = json.dumps({
        'username': 'testuser99',
        'password': 'Password123!'
    }).encode('utf-8')
    req = urllib.request.Request('http://127.0.0.1:8080/api/token/', data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as res:
        print("STATUS:", res.status)
        print("BODY:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", str(e))
