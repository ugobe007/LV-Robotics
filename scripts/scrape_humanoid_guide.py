#!/usr/bin/env python3
"""
Scraper script for humanoid.guide/humanoid-robots-database/
Extracts 200+ robot photos, specs, pricing, compute, capabilities, and manufacturer metadata.
"""

import json
import re
import ssl
import sys
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

DATABASE_URL = "https://humanoid.guide/humanoid-robots-database/"

def fetch_html(url, timeout=12):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return None

def parse_product_page(item):
    url = item["product_link"]
    html = fetch_html(url)
    if not html:
        return item

    soup = BeautifulSoup(html, "html.parser")
    
    # High-res photo extraction
    og_img = soup.find("meta", property="og:image")
    if og_img and og_img.get("content"):
        item["photo_url"] = og_img["content"]

    # Price extraction
    price_text = ""
    for el in soup.find_all(text=re.compile(r"\bUSD\b|\$", re.I)):
        parent = el.parent
        p_txt = parent.get_text(" ", strip=True) if parent else ""
        if len(p_txt) < 40 and any(c.isdigit() for c in p_txt):
            price_text = p_txt
            break
    item["price_str"] = price_text

    # Table specifications extraction
    specs = {}
    for table in soup.find_all("table"):
        for tr in table.find_all("tr"):
            tds = tr.find_all(["td", "th"])
            if len(tds) >= 2:
                k = tds[0].get_text(strip=True)
                v = tds[1].get_text(strip=True)
                if k and v:
                    specs[k] = v

    item["specs"] = specs
    
    # Normalized key fields
    item["height_cm"] = specs.get("Height [cm]", specs.get("Height", "N/A"))
    item["weight_kg"] = specs.get("Weight [kg]", specs.get("Weight", "N/A"))
    item["dof_overall"] = specs.get("Degrees of freedom, overall", specs.get("Degrees of Freedom", "N/A"))
    item["dof_hands"] = specs.get("Degrees of freedom, hands", "N/A")
    item["payload_kg"] = specs.get("Strength [kg]", specs.get("Payload [kg]", "N/A"))
    item["runtime_hours"] = specs.get("Runtime pr charge (hours)", specs.get("Battery Life", "N/A"))
    item["compute"] = specs.get("CPU/GPU", "N/A")
    item["country"] = specs.get("Nationality", "N/A")
    item["status"] = specs.get("Availability", "N/A")
    item["website"] = specs.get("Website", "N/A")
    item["target_markets"] = specs.get("Main market", "N/A")
    item["ai_llm"] = specs.get("LLM integration", "N/A")
    item["safe_with_humans"] = specs.get("Safe with humans", "N/A")

    return item

def scrape_humanoid_guide():
    print(f"[INFO] Fetching database index from {DATABASE_URL}...")
    index_html = fetch_html(DATABASE_URL, timeout=15)
    if not index_html:
        print("[ERROR] Could not fetch database index page.", file=sys.stderr)
        return []

    soup = BeautifulSoup(index_html, "html.parser")
    cards = soup.find_all("article", class_=re.compile("wpgb-post|type-humanoid_robot", re.I))

    product_items = []
    seen_links = set()

    for c in cards:
        img_el = c.find("img", src=re.compile(r"uploads/.*?\.(webp|jpg|png|jpeg)", re.I))
        photo_url = img_el["src"] if img_el else ""
        if not photo_url and c.find("img"):
            photo_url = c.find("img").get("src") or c.find("img").get("data-src") or ""

        product_link = ""
        for a in c.find_all("a", href=True):
            if "/product/" in a["href"]:
                product_link = a["href"]
                break

        if not product_link or product_link in seen_links:
            continue
        seen_links.add(product_link)

        text = c.get_text("\n", strip=True)
        lines = [l.strip() for l in text.split("\n") if l.strip() and "score" not in l.lower()]

        oem = lines[0] if len(lines) > 0 else "Unknown OEM"
        model = lines[1] if len(lines) > 1 else (lines[0] if lines else "Unknown Model")

        product_items.append({
            "oem": oem,
            "model": model,
            "photo_url": photo_url,
            "product_link": product_link,
            "specs": {}
        })

    print(f"[INFO] Discovered {len(product_items)} unique robot models. Scraping individual spec pages...")

    results = []
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [executor.submit(parse_product_page, item) for item in product_items]
        for i, fut in enumerate(as_completed(futures), 1):
            res = fut.result()
            results.append(res)
            if i % 25 == 0 or i == len(product_items):
                print(f"[PROGRESS] Parsed {i}/{len(product_items)} robot spec pages...")

    # Sort by OEM name then model
    results.sort(key=lambda x: (x["oem"].lower(), x["model"].lower()))

    # Ensure output directory exists
    os.makedirs("data", exist_ok=True)
    out_path = "data/humanoid_guide_robots.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Saved {len(results)} robot specs & photos to {out_path}")
    return results

if __name__ == "__main__":
    scrape_humanoid_guide()
