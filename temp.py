import urllib.request
import json

payload = {
    "sessionId": "test-session-123",
    "friendPhone": "8962244848",
    "friendName": "Mohit",
    "question": "Test question?",
    "options": ["A", "B", "C", "D"],
    "playerName": "Mohit"
}

req = urllib.request.Request(
    "https://kbc.harjani.me/api/phone-friend/send",
    data=json.dumps(payload).encode('utf-8'),
    headers={
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("STATUS:", resp.status)
    print("SUCCESS:", data.get('success'))
    print("DELIVERED:", data.get('delivered'))
    print("GATEWAY:", data.get('gateway'))
