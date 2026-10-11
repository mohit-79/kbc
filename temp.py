import urllib.request

urls = [
    ("Default (Madhur/Google)", "https://kbc.harjani.me/api/tts?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0"),
    ("Swara", "https://kbc.harjani.me/api/tts?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0&voice=swara"),
    ("RJ", "https://kbc.harjani.me/api/tts?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0&voice=rj")
]

for label, u in urls:
    req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req) as r:
            data = r.read()
            print(f"{label}: Status {r.status}, Length: {len(data)} bytes, Content-Type: {r.headers.get('content-type')}")
    except Exception as e:
        print(f"{label} error:", e)
