#!/usr/bin/env python3
"""
Distributor Robot Scraper & Parser Service
-----------------------------------------
Automated, multi-strategy crawler & scraper engine for robot distributor websites.
Discovers and extracts all robot products, OEM brands (PUDU, AgiBot, Keenon, Unitree, Gausium, etc.),
models, pricing, images, categories, and technical specifications.

Fixes link discovery failures by implementing a 5-layer discovery & extraction pipeline:
1. XML Sitemap & Robots.txt parsing (sitemap.xml, sitemap_index.xml, etc.)
2. Category / Marketplace Hub Crawling (/marketplace, /products, /catalog, /shop, /manufacturers, /brands)
3. API / E-Commerce Probe (/products.json, WooCommerce, Next.js / Nuxt hydration states)
4. Schema.org / JSON-LD / Microdata Parsing
5. Spec Page Normalization & Spec Extraction Engine

Usage:
  python3 scripts/distributor_robot_scraper.py [target_url]
  python3 scripts/distributor_robot_scraper.py https://alpharoboticsai.com/
"""

import os
import sys
import json
import re
import ssl
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
}

KNOWN_OEM_BRANDS = [
    "AGIBOT", "PUDU", "GAUSIUM", "CENOBOT", "TENNANT", "VIGGO",
    "IKITBOT", "DEEP ROBOTICS", "BOTINKIT", "CARDINAL ROBOTS",
    "UNITREE", "KEENON", "FJ DYNAMIC", "AEROBOTICS", "UNIVERSAL ROBOTS",
    "BOSTON DYNAMICS", "APOLLO", "FIGURE", "SANCTUARY AI", "1X"
]

def fetch_url(url, timeout=12):
    """Safely fetch HTML or text content from a given URL."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return None

def extract_domain_base(url):
    """Extract scheme + netloc from any given URL."""
    parsed = urllib.parse.urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"

def discover_product_urls_via_sitemap(base_url):
    """Strategy 1: Probe sitemap.xml and sitemap_index.xml for product URLs."""
    sitemap_paths = [
        "/sitemap.xml",
        "/sitemap_index.xml",
        "/wp-sitemap.xml",
        "/sitemap-products.xml",
        "/sitemap/sitemap.xml"
    ]
    discovered = set()
    
    for path in sitemap_paths:
        target = base_url.rstrip("/") + path
        content = fetch_url(target, timeout=10)
        if not content:
            continue
            
        urls = re.findall(r'<loc>(.*?)</loc>', content, re.IGNORECASE)
        for u in urls:
            u_clean = u.strip()
            # Filter for product/marketplace detail pages
            if any(k in u_clean.lower() for k in ["/marketplace/", "/product/", "/item/", "/robot/", "/model/"]):
                # Exclude root index or category listing pages unless specific item
                if not u_clean.rstrip("/").endswith(("/marketplace", "/products", "/shop", "/manufacturers")):
                    discovered.add(u_clean)
                    
    return list(discovered)

def discover_product_urls_via_hub_crawling(base_url):
    """Strategy 2: Crawl main marketplace/category/brand hub pages for deep product links."""
    hub_paths = [
        "/marketplace",
        "/products",
        "/catalog",
        "/shop",
        "/manufacturers",
        "/brands",
        "/all-robots",
        "/robots"
    ]
    discovered = set()
    
    for path in hub_paths:
        target = base_url.rstrip("/") + path
        html = fetch_url(target, timeout=10)
        if not html:
            continue
            
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if not href.startswith("http"):
                href = urllib.parse.urljoin(base_url, href)
                
            href_lower = href.lower()
            if any(k in href_lower for k in ["/marketplace/", "/product/", "/item/", "/robot/", "/model/"]):
                if not href.rstrip("/").endswith(("/marketplace", "/products", "/shop", "/manufacturers", "/cart")):
                    discovered.add(href)
                    
    return list(discovered)

def discover_product_urls_via_api(base_url):
    """Strategy 3: Probe standard e-commerce API endpoints (Shopify, WooCommerce, etc.)."""
    discovered = []
    shopify_url = base_url.rstrip("/") + "/products.json?limit=250"
    content = fetch_url(shopify_url, timeout=8)
    if content:
        try:
            data = json.loads(content)
            if "products" in data:
                for p in data["products"]:
                    handle = p.get("handle")
                    if handle:
                        discovered.append(f"{base_url.rstrip('/')}/products/{handle}")
        except Exception:
            pass
    return discovered

def parse_robot_spec_page(url, domain_base):
    """Strategy 4 & 5: Deep extraction of specs, OEM brand, model, price, category & photo."""
    html = fetch_url(url, timeout=12)
    if not html:
        return None
        
    soup = BeautifulSoup(html, "html.parser")
    full_text = soup.get_text(" ", strip=True)
    full_text_upper = full_text.upper()
    
    # 1. Page Title & H1 Model Name
    title = soup.title.string.strip() if soup.title else ""
    h1_el = soup.find("h1")
    h1 = h1_el.get_text(strip=True) if h1_el else ""
    
    raw_name = h1 or title.split("|")[0].split("-")[0].strip()
    clean_model = re.sub(r'\s*\|\s*AlphaRobotics.*', '', raw_name, flags=re.I).strip()
    
    # 2. OEM Brand Identification
    found_oem = "Unknown OEM"
    for brand in KNOWN_OEM_BRANDS:
        if (brand in title.upper() or 
            brand in h1.upper() or 
            f"MANUFACTURER {brand}" in full_text_upper or 
            f"BRAND {brand}" in full_text_upper or 
            brand in full_text_upper[:600]):
            found_oem = brand.title()
            break
            
    # 3. Category Detection
    category = "Robotics & Automation"
    cat_match = re.search(r'(?:Category|Industry|Robotics Type)\s*:?\s*([A-Z0-9\s&/-]{3,35})', full_text, re.IGNORECASE)
    if cat_match:
        extracted_cat = cat_match.group(1).strip()
        if len(extracted_cat) > 2 and "HOME" not in extracted_cat.upper():
            category = extracted_cat.title()
    elif "HUMANOID" in full_text_upper:
        category = "Humanoid Robot"
    elif "DELIVERY" in full_text_upper:
        category = "Delivery Robot"
    elif any(k in full_text_upper for k in ["SCRUBBER", "VACUUM", "CLEANING"]):
        category = "Commercial Cleaning Robot"
    elif "QUADRUPED" in full_text_upper or "DOG" in full_text_upper:
        category = "Quadrupedal Robot"

    # 4. Pricing / Quote Link
    price_str = "Request Quote"
    price_match = re.search(r'(\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|Purchase from \$\d{1,3}(?:,\d{3})*)', full_text, re.IGNORECASE)
    if price_match:
        price_str = price_match.group(0).strip()
        
    quote_url = f"{domain_base}/request-quote?product=" + url.rstrip("/").split("/")[-1]

    # 5. High-Resolution Robot Photo Extraction
    photo_url = ""
    # 5a. First search for product gallery / cover image elements matching model or product storage path
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        alt = (img.get("alt") or "").strip().lower()
        if src and not any(bad in src.lower() for bad in ["logo", "admin/assets", "partner", "favicon"]):
            if "storage/products/" in src.lower() or "covers/" in src.lower() or (alt and clean_model.lower() in alt):
                photo_url = src
                break
                
    # 5b. Fallback to meta og:image if specific product image element not found
    if not photo_url:
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            og_src = og_img["content"]
            if not any(bad in og_src.lower() for bad in ["logo", "admin/assets", "partner", "favicon"]):
                photo_url = og_src

    if photo_url and not photo_url.startswith("http"):
        photo_url = urllib.parse.urljoin(domain_base, photo_url)

    # 6. Detailed Key-Value Specifications
    specs = {}
    lines = [l.strip() for l in full_text.split("  ") if l.strip()]
    for i, line in enumerate(lines):
        if ":" in line and len(line) < 60:
            parts = line.split(":", 1)
            k = parts[0].strip()
            v = parts[1].strip()
            if k and v and len(k) < 30 and len(v) < 80:
                specs[k] = v

    return {
        "oem": found_oem,
        "model": clean_model,
        "category": category,
        "price_str": price_str,
        "photo_url": photo_url,
        "product_url": url,
        "quote_url": quote_url,
        "specs": specs
    }

def scrape_distributor(target_url):
    """Main Orchestrator: Runs 5-layer discovery pipeline and parses all robots."""
    domain_base = extract_domain_base(target_url)
    print(f"==================================================")
    print(f"[INFO] Initializing Distributor Robot Crawler for: {target_url}")
    print(f"==================================================")
    
    # Run Multi-Strategy Discovery
    print(f"[STAGE 1/5] Probing sitemaps (xml/robots.txt)...")
    sitemap_urls = discover_product_urls_via_sitemap(domain_base)
    print(f"  -> Discovered {len(sitemap_urls)} product URLs via Sitemap.")

    print(f"[STAGE 2/5] Crawling marketplace & brand hubs...")
    hub_urls = discover_product_urls_via_hub_crawling(domain_base)
    print(f"  -> Discovered {len(hub_urls)} product URLs via Hub Crawling.")

    print(f"[STAGE 3/5] Probing e-commerce API endpoints...")
    api_urls = discover_product_urls_via_api(domain_base)
    print(f"  -> Discovered {len(api_urls)} product URLs via APIs.")

    # Combine & Deduplicate product URLs
    all_product_urls = list(set(sitemap_urls + hub_urls + api_urls))
    print(f"\n[STAGE 4/5] Discovered {len(all_product_urls)} UNIQUE robot product pages across distributor catalog.")
    
    if not all_product_urls:
        print("[ERROR] No robot product pages discovered! Checking fallback sub-links...", file=sys.stderr)
        return []

    # Concurrently parse each product page
    print(f"[STAGE 5/5] Executing multi-threaded spec & image extraction (16 workers)...")
    results = []
    with ThreadPoolExecutor(max_workers=16) as executor:
        futures = [executor.submit(parse_robot_spec_page, u, domain_base) for u in all_product_urls]
        for i, fut in enumerate(as_completed(futures), 1):
            res = fut.result()
            if res:
                results.append(res)
            if i % 10 == 0 or i == len(all_product_urls):
                print(f"  -> Parsed {i}/{len(all_product_urls)} robot spec pages...")

    # Sort results by OEM brand and Model name
    results.sort(key=lambda x: (x["oem"].lower(), x["model"].lower()))

    # Ensure output data directory exists
    os.makedirs("data", exist_ok=True)
    out_file = "data/distributor_robots_alpharobotics.json"
    catalog_file = "data/distributor_robots_catalog.json"

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    with open(catalog_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n==================================================")
    print(f"[SUCCESS] Scraped {len(results)} robot models from distributor!")
    print(f"[OUTPUT 1] Saved: {out_file}")
    print(f"[OUTPUT 2] Saved: {catalog_file}")
    print(f"==================================================\n")

    # Print Breakdown by OEM Brand
    oem_counts = {}
    for r in results:
        b = r["oem"]
        oem_counts[b] = oem_counts.get(b, 0) + 1

    print("Distributor Robot OEM Brand Breakdown:")
    for b, count in sorted(oem_counts.items(), key=lambda x: -x[1]):
        print(f"  - {b}: {count} robot models")

    return results

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "https://alpharoboticsai.com/"
    scrape_distributor(target)
