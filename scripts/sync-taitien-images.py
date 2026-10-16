"""Download the four reviewed application images from Taitien's public media API.

Use only manufacturer-published image sizes; do not synthesize or edit the images.
Product/category images reuse the verified catalog, see src/data/visuals.ts.
"""
import hashlib
import json
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
SELECTION = {
    "communications": (6932, "通信网络设备与数据中心", "Network equipment and data center"),
    "automotive": (6122, "汽车电子应用", "Automotive electronics application"),
    "industrial": (6132, "工业自动化应用", "Industrial automation application"),
    "consumer": (6136, "智能手机与消费电子应用", "Smartphone and consumer electronics application"),
}


def fetch(url):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; SimacityProductCatalog/1.0)"})
    with urlopen(request, timeout=45) as response:
        return response.read(), response.headers.get_content_type()


images = {}
for application, (media_id, alt_zh, alt_en) in SELECTION.items():
    source_page = f"https://www.taitien.com/wp-json/wp/v2/media/{media_id}"
    raw, _ = fetch(source_page)
    media = json.loads(raw)
    details = media["media_details"]
    published = details.get("sizes", {}).get("large") or {
        "source_url": media["source_url"],
        "width": details["width"],
        "height": details["height"],
    }
    source_image = published["source_url"]
    if not source_image.startswith("https://www.taitien.com/wp-content/uploads/"):
        raise ValueError(f"Unexpected image host: {application}")
    image, content_type = fetch(source_image)
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise ValueError(f"Not an image: {application} ({content_type})")
    digest = hashlib.sha256(image).hexdigest()
    suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[content_type]
    path = f"applications/{application}-{digest[:10]}{suffix}"
    target = ROOT / "public" / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(image)
    images[application] = {
        "path": path,
        "alt": [alt_zh, alt_en],
        "width": published["width"],
        "height": published["height"],
        "mediaId": media_id,
        "sourceTitle": media["title"]["rendered"],
        "sourcePage": source_page,
        "sourceImage": source_image,
        "originalImage": media["source_url"],
        "bytes": len(image),
        "sha256": digest,
    }
    print(f"{application}: {published['width']}x{published['height']}, {len(image)} bytes", flush=True)

manifest = {
    "fetchedAt": datetime.now(ZoneInfo("Asia/Shanghai")).date().isoformat(),
    "images": images,
}
(ROOT / "src/data/application-images.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
)
