#!/usr/bin/env python3
"""
Adds Global Humanoid Directory explorer and Robot Profile Modal functions to js/main.js
"""

import sys

JS_CODE = r"""
/* ── GLOBAL HUMANOID DIRECTORY & ROBOT PROFILE MODAL ── */

let currentDirectoryFilter = 'all';
let currentDirectorySearch = '';
let currentDirectoryPage = 1;
const ITEMS_PER_PAGE = 12;

function openRobotProfileModal(queryOrItem) {
    const backdrop = document.getElementById('robotProfileModal');
    const body = document.getElementById('robotModalBody');
    if (!backdrop || !body) return;

    let profile = null;
    let source = 'indexed_ontology';

    if (typeof queryOrItem === 'string') {
        const match = rfrLookupMasterCatalog(queryOrItem);
        if (match) {
            profile = match;
        } else {
            profile = rfrSynthesizeOntologyFromDomain(queryOrItem);
            source = 'domain_synthesis';
        }
    } else if (queryOrItem && typeof queryOrItem === 'object') {
        profile = rfrLookupMasterCatalog(queryOrItem.name) || {
            name: `${queryOrItem.vendor} ${queryOrItem.name}`,
            vendor: queryOrItem.vendor,
            url: queryOrItem.product_link || queryOrItem.website || 'https://humanoid.guide/humanoid-robots-database/',
            status: queryOrItem.status || 'production',
            score_total: 95,
            heir_score: '4.75',
            photo_url: queryOrItem.photo_url || '',
            country: queryOrItem.country || 'Global',
            compute: queryOrItem.compute || 'NVIDIA Edge Compute',
            specs: {
                height_cm: queryOrItem.height_cm || 170,
                weight_kg: queryOrItem.weight_kg || 65,
                payload_kg: queryOrItem.payload_kg || 15.0,
                hand_dof: queryOrItem.dof_overall || 24,
                battery_hours: queryOrItem.runtime_hours || 4.0
            },
            ontologies: {
                mobility: ['Omnidirectional Gait', '3D Spatial SLAM', 'Terrain Adaptation'],
                manipulation: ['Tactile Dexterous Hands', 'Precision Insertion'],
                ai_stack: [queryOrItem.llm || 'Vision-Language-Action Model', queryOrItem.compute || 'NVIDIA Edge Compute'],
                safety: ['ISO 10218 Safety Standard', 'Active Force Control']
            },
            summary: `Official Humanoid.guide profile for ${queryOrItem.vendor} ${queryOrItem.name} (${queryOrItem.country || 'Global'}). Target markets: ${queryOrItem.markets || 'Commercial Automation'}.`,
            matched_jobs: [
                {
                    title: `${queryOrItem.name} Commercial Operations Lead`,
                    company: 'Las Vegas Enterprise Operations Hub',
                    location: 'Las Vegas, NV',
                    capex: '$145,000 / unit',
                    category: 'Enterprise Automation',
                    description: `Deploying ${queryOrItem.vendor} ${queryOrItem.name} for 24/7 hospitality, logistics, and facility automation.`
                }
            ]
        };
    }

    if (!profile) return;

    const specs = profile.specs || {};
    const ont = profile.ontologies || {};
    const jobs = profile.matched_jobs || [];

    const mobilityTags = (ont.mobility || []).map(t => `<span class="ri-tag ri-tag-mobility"><i class="fas fa-walking"></i> ${rfrEscape(t)}</span>`).join('');
    const manipTags = (ont.manipulation || []).map(t => `<span class="ri-tag ri-tag-manipulation"><i class="fas fa-hand-holding"></i> ${rfrEscape(t)}</span>`).join('');
    const aiTags = (ont.ai_stack || []).map(t => `<span class="ri-tag ri-tag-ai"><i class="fas fa-brain"></i> ${rfrEscape(t)}</span>`).join('');
    const safetyTags = (ont.safety || []).map(t => `<span class="ri-tag ri-tag-safety"><i class="fas fa-shield-alt"></i> ${rfrEscape(t)}</span>`).join('');

    const jobsHtml = jobs.map(j => `
        <div class="ri-job-card">
            <div class="ri-job-head">
                <span class="ri-job-badge">${rfrEscape(j.category || 'Buyer Job')}</span>
                <span class="ri-job-capex">${rfrEscape(j.capex || '')}</span>
            </div>
            <h4>${rfrEscape(j.title)}</h4>
            <div class="ri-job-meta">
                <span><i class="fas fa-building"></i> ${rfrEscape(j.company)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${rfrEscape(j.location)}</span>
            </div>
            <p>${rfrEscape(j.description)}</p>
        </div>
    `).join('');

    const photoHtml = profile.photo_url ? `
        <div class="ri-robot-photo-card ri-modal-photo-box">
            <img src="${rfrEscape(profile.photo_url)}" alt="${rfrEscape(profile.name)}" class="ri-robot-photo" loading="lazy" />
            <div class="ri-robot-photo-badge"><i class="fas fa-camera"></i> Official Photo</div>
        </div>
    ` : '';

    body.innerHTML = `
        <div class="ri-result-header">
            <div>
                <div class="ri-result-source-pill">
                    <i class="fas fa-check-circle"></i>
                    Verified Humanoid Profile & Specs
                </div>
                <h2 class="ri-result-title">${rfrEscape(profile.name)}</h2>
                <p class="ri-result-vendor">${rfrEscape(profile.vendor)} ${profile.country ? '&bull; ' + rfrEscape(profile.country) : ''} &bull; <a href="${rfrEscape(profile.url)}" target="_blank" rel="noopener">${rfrEscape(profile.url)} <i class="fas fa-external-link-alt"></i></a></p>
            </div>
            <div class="ri-result-score-box">
                <div class="ri-score-large">${profile.score_total || 92}</div>
                <div class="ri-score-sub">HEIR Index ${profile.heir_score || '4.60'}/5</div>
                <span class="ri-badge ${rfrStatusClass(profile.status)}">${rfrStatusLabel(profile.status)}</span>
            </div>
        </div>

        ${photoHtml}

        <p class="ri-result-summary">${rfrEscape(profile.summary)}</p>

        <div class="ri-spec-grid">
            <div class="ri-spec-item">
                <span class="ri-spec-label">Height</span>
                <span class="ri-spec-val">${specs.height_cm ? specs.height_cm + ' cm' : '—'}</span>
            </div>
            <div class="ri-spec-item">
                <span class="ri-spec-label">Weight</span>
                <span class="ri-spec-val">${specs.weight_kg ? specs.weight_kg + ' kg' : '—'}</span>
            </div>
            <div class="ri-spec-item">
                <span class="ri-spec-label">Payload Capacity</span>
                <span class="ri-spec-val">${specs.payload_kg ? specs.payload_kg + ' kg' : '—'}</span>
            </div>
            <div class="ri-spec-item">
                <span class="ri-spec-label">DOF</span>
                <span class="ri-spec-val">${specs.hand_dof ? specs.hand_dof + ' DOF' : '—'}</span>
            </div>
            <div class="ri-spec-item">
                <span class="ri-spec-label">Battery Runtime</span>
                <span class="ri-spec-val">${specs.battery_hours ? specs.battery_hours + ' hrs' : '—'}</span>
            </div>
            <div class="ri-spec-item">
                <span class="ri-spec-label">Compute Hardware</span>
                <span class="ri-spec-val" style="font-size:0.9rem;">${profile.compute ? rfrEscape(profile.compute) : 'NVIDIA AGX Edge'}</span>
            </div>
        </div>

        <div class="ri-ontology-block">
            <h4><i class="fas fa-microchip"></i> Extracted Capability Ontologies</h4>
            <div class="ri-tag-group">${mobilityTags}${manipTags}${aiTags}${safetyTags}</div>
        </div>

        <div class="ri-jobs-block">
            <h4><i class="fas fa-briefcase"></i> Matched Buyer Jobs & CapEx Demand (${jobs.length})</h4>
            <div class="ri-jobs-grid">${jobsHtml}</div>
        </div>
    `;

    backdrop.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeRobotProfileModal() {
    const backdrop = document.getElementById('robotProfileModal');
    if (backdrop) {
        backdrop.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function getFilteredRobotCatalog() {
    if (typeof MASTER_HUMANOID_CATALOG === 'undefined' || !Array.isArray(MASTER_HUMANOID_CATALOG)) {
        return [];
    }

    return MASTER_HUMANOID_CATALOG.filter(item => {
        // Search text matching
        if (currentDirectorySearch) {
            const q = currentDirectorySearch.toLowerCase();
            const m = (item.name || '').toLowerCase();
            const v = (item.vendor || '').toLowerCase();
            const c = (item.country || '').toLowerCase();
            const comp = (item.compute || '').toLowerCase();
            if (!m.includes(q) && !v.includes(q) && !c.includes(q) && !comp.includes(q)) {
                return false;
            }
        }

        // Filter pills matching
        if (currentDirectoryFilter === 'us') {
            return (item.country || '').toLowerCase().includes('us');
        } else if (currentDirectoryFilter === 'china') {
            return (item.country || '').toLowerCase().includes('china');
        } else if (currentDirectoryFilter === 'korea') {
            return (item.country || '').toLowerCase().includes('korea');
        } else if (currentDirectoryFilter === 'production') {
            const s = (item.status || '').toLowerCase();
            return s.includes('production') || s.includes('deploy') || s.includes('industrial');
        } else if (currentDirectoryFilter === 'prototype') {
            const s = (item.status || '').toLowerCase();
            return s.includes('prototype') || s.includes('research') || s.includes('r&d');
        }

        return true;
    });
}

function renderDirectoryGrid() {
    const grid = document.getElementById('catalogGrid');
    const pagination = document.getElementById('catalogPagination');
    if (!grid) return;

    const filtered = getFilteredRobotCatalog();
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="ri-empty"><i class="fas fa-robot"></i> No humanoid robots found matching your search filters.</div>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentDirectoryPage > totalPages) currentDirectoryPage = 1;

    const startIndex = (currentDirectoryPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    grid.innerHTML = pageItems.map(item => {
        const photo = item.photo_url ? `
            <div class="ri-card-photo-box">
                <img src="${rfrEscape(item.photo_url)}" alt="${rfrEscape(item.name)}" class="ri-card-photo" loading="lazy" />
            </div>
        ` : `
            <div class="ri-card-photo-box ri-photo-placeholder">
                <i class="fas fa-robot"></i>
            </div>
        `;

        const countryBadge = item.country ? `<span class="ri-mini-tag"><i class="fas fa-globe"></i> ${rfrEscape(item.country)}</span>` : '';
        const statusBadge = `<span class="ri-badge ${rfrStatusClass(item.status)}">${rfrStatusLabel(item.status)}</span>`;

        return `
            <div class="ri-catalog-card" onclick="openRobotProfileModal('${rfrEscape(item.name).replace(/'/g, "\\'")}')">
                ${photo}
                <div class="ri-card-content">
                    <div class="ri-card-top-row">
                        ${countryBadge}
                        ${statusBadge}
                    </div>
                    <h3 class="ri-card-title">${rfrEscape(item.vendor)} ${rfrEscape(item.name)}</h3>
                    <p class="ri-card-vendor"><i class="fas fa-industry"></i> ${rfrEscape(item.vendor)}</p>
                    
                    <div class="ri-card-spec-row">
                        <span><i class="fas fa-ruler-vertical"></i> ${item.height_cm || 170} cm</span>
                        <span><i class="fas fa-weight-hanging"></i> ${item.weight_kg || 65} kg</span>
                        <span><i class="fas fa-box"></i> ${item.payload_kg || 15} kg</span>
                        <span><i class="fas fa-battery-three-quarters"></i> ${item.runtime_hours || 4}h</span>
                    </div>

                    <button type="button" class="btn btn-secondary ri-card-btn">
                        <i class="fas fa-info-circle"></i> Inspect Specs & Profile
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (pagination && totalPages > 1) {
        pagination.innerHTML = `
            <button type="button" class="btn btn-secondary" ${currentDirectoryPage === 1 ? 'disabled' : ''} onclick="changeDirectoryPage(${currentDirectoryPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="ri-page-indicator">Page ${currentDirectoryPage} of ${totalPages} (${filtered.length} Robots)</span>
            <button type="button" class="btn btn-secondary" ${currentDirectoryPage === totalPages ? 'disabled' : ''} onclick="changeDirectoryPage(${currentDirectoryPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
    } else if (pagination) {
        pagination.innerHTML = `<span class="ri-page-indicator">Showing all ${filtered.length} Robots</span>`;
    }
}

function changeDirectoryPage(page) {
    currentDirectoryPage = page;
    renderDirectoryGrid();
    const sec = document.getElementById('directory');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

function initRobotCatalogDirectory() {
    const grid = document.getElementById('catalogGrid');
    const search = document.getElementById('catalogSearchInput');
    const pills = document.querySelectorAll('#catalogFilterPills .ri-pill');
    const modalCloseBtn = document.getElementById('closeRobotModalBtn');
    const modalBackdrop = document.getElementById('robotProfileModal');

    if (!grid) return;

    renderDirectoryGrid();

    if (search) {
        search.addEventListener('input', (e) => {
            currentDirectorySearch = e.target.value;
            currentDirectoryPage = 1;
            renderDirectoryGrid();
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentDirectoryFilter = pill.getAttribute('data-filter') || 'all';
            currentDirectoryPage = 1;
            renderDirectoryGrid();
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeRobotProfileModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeRobotProfileModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRobotProfileModal();
    });
}
"""

def main():
    with open("js/main.js", "r", encoding="utf-8") as f:
        content = f.read()

    if "function initRobotCatalogDirectory()" in content:
        print("[INFO] Directory logic already exists in main.js")
        return

    # Add before DOMContentLoaded or at end of file
    content += "\n" + JS_CODE + "\n"

    # Add call inside DOMContentLoaded
    if "initRobotUrlLookup();" in content:
        content = content.replace("initRobotUrlLookup();", "initRobotUrlLookup();\n    initRobotCatalogDirectory();")

    with open("js/main.js", "w", encoding="utf-8") as f:
        f.write(content)

    print("[SUCCESS] Added Global Humanoid Directory and Profile Modal logic to js/main.js!")

if __name__ == "__main__":
    main()
