#!/usr/bin/env python3
"""
Appends directory grid and modal CSS styles to css/styles.css
"""

CSS = r"""

/* ============================================
   Global Humanoid Directory & Profile Modal Styles
   ============================================ */
.ri-directory-controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2rem;
}
.ri-search-wrap {
    position: relative;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
}
.ri-search-icon {
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--brand-green-light);
    font-size: 1.1rem;
}
.ri-search-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(63, 209, 127, 0.3);
    color: #fff;
    font-size: 1rem;
    padding: 0.9rem 1.25rem 0.9rem 3.2rem;
    border-radius: 999px;
    outline: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ri-search-input:focus {
    border-color: var(--brand-green-bright);
    box-shadow: 0 0 0 3px rgba(63, 209, 127, 0.2);
}
.ri-filter-pills {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6rem;
}
.ri-pill {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    padding: 0.45rem 1rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}
.ri-pill:hover {
    background: rgba(63, 209, 127, 0.15);
    border-color: var(--brand-green-bright);
    color: #fff;
}
.ri-pill.active {
    background: var(--brand-green-bright);
    border-color: var(--brand-green-bright);
    color: #050807;
    font-weight: 700;
}

.ri-catalog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}
.ri-catalog-card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(63, 209, 127, 0.2);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.25 ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.ri-catalog-card:hover {
    transform: translateY(-5px);
    border-color: var(--brand-green-bright);
    box-shadow: 0 12px 30px rgba(63, 209, 127, 0.15);
}
.ri-card-photo-box {
    position: relative;
    width: 100%;
    height: 220px;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.ri-card-photo {
    max-height: 210px;
    width: auto;
    object-fit: contain;
    padding: 0.5rem;
    transition: transform 0.3s ease;
}
.ri-catalog-card:hover .ri-card-photo {
    transform: scale(1.05);
}
.ri-photo-placeholder {
    font-size: 3.5rem;
    color: rgba(63, 209, 127, 0.3);
}
.ri-card-content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    flex: 1;
}
.ri-card-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
}
.ri-mini-tag {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}
.ri-card-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 0.2rem 0;
    line-height: 1.3;
}
.ri-card-vendor {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}
.ri-card-spec-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem 0.6rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    font-size: 0.78rem;
    color: var(--brand-green-light);
    margin-bottom: 1rem;
    margin-top: auto;
}
.ri-card-spec-row span {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}
.ri-card-btn {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.85rem;
    justify-content: center;
    border-radius: 8px;
}

.ri-catalog-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.25rem;
    margin-top: 1rem;
}
.ri-page-indicator {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    font-weight: 600;
}

/* Modal Dialog */
.ri-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(5, 8, 7, 0.85);
    backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    box-sizing: border-box;
}
.ri-modal-dialog {
    position: relative;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(63, 209, 127, 0.35);
    border-radius: 20px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2.25rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}
.ri-modal-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    font-size: 1.5rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    z-index: 10;
}
.ri-modal-close:hover {
    background: rgba(239, 68, 68, 0.4);
}
.ri-modal-photo-box {
    margin: 1rem 0 1.5rem 0;
    max-height: 320px;
}

/* Leaderboard Rows Enhancement */
.ri-row-clickable {
    cursor: pointer;
    transition: background 0.2s ease;
}
.ri-row-clickable:hover {
    background: rgba(63, 209, 127, 0.08);
}
.ri-bench-thumb {
    width: 42px;
    height: 42px;
    object-fit: contain;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2px;
    flex-shrink: 0;
}
.ri-bench-thumb-placeholder {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(63, 209, 127, 0.4);
    font-size: 1.1rem;
    flex-shrink: 0;
}
.ri-robot {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}
.ri-robot-info {
    display: flex;
    flex-direction: column;
}
"""

def main():
    with open("css/styles.css", "r", encoding="utf-8") as f:
        content = f.read()

    if "Global Humanoid Directory & Profile Modal Styles" in content:
        print("[INFO] Directory CSS already added")
        return

    content += CSS

    with open("css/styles.css", "w", encoding="utf-8") as f:
        f.write(content)

    print("[SUCCESS] Appended Global Humanoid Directory and Profile Modal CSS to css/styles.css!")

if __name__ == "__main__":
    main()
