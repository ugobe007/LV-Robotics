#!/usr/bin/env python3
"""
Implements clickable Live Robot Job opportunities, opportunity detail modal,
rich specs & ROI breakdown, direct link sharing (?visit=jobs&job=JOB_KEY),
and copy share link functionality.
"""

import re
import sys

JS_FILE = "/Users/robertchristopher/Desktop/LV-Robotics/js/main.js"
CSS_FILE = "/Users/robertchristopher/Desktop/LV-Robotics/css/styles.css"

JOB_MODAL_JS = r"""
/* ── LIVE ROBOT JOBS OPPORTUNITY MODAL & LINK SHARING ENGINE ── */

const RFR_LIVE_JOBS_CORPUS = {
    'job_q_casino_housekeeping': {
        id: 'job_q_casino_housekeeping',
        title: 'Housekeeping Supervisor & Autonomous Floor Care Lead',
        company: 'Q Casino & Resort',
        location: 'Dubuque, IA / Las Vegas, NV',
        capex: '$145,000 / unit ($3.20/hr RaaS)',
        category: 'Hospitality & Facility Cleaning',
        description: 'Autonomous multi-floor housekeeping, scrubbing, and sanitization across resort gaming floors, guest corridors, and high-traffic public areas.',
        specs: {
            payload_kg: '35 kg solution capacity',
            throughput: '4,500 sq ft/hr clean rate',
            shift_model: '3rd Shift Nightly (10:00 PM - 6:00 AM)',
            environment: 'Elevator BACnet integration, SLAM Lidar navigation, Auto-dock water refill'
        },
        financials: {
            labor_savings: '$84,500 / year per shift',
            payback_months: '14.2 Months',
            efficiency_gain: '+320% Floor Coverage'
        },
        matched_robots: [
            { name: 'Pudu CC1 Commercial Scrubber', score: '98%', status: 'Production Verified' },
            { name: 'Gausium Phantas All-in-One', score: '95%', status: 'In Deployment' },
            { name: 'Gaussian Scrubber 50', score: '92%', status: 'Qualified' }
        ]
    },
    'job_Las_Vegas_Enterprise_Operations_Hub_Enterprise_Commercial_Automation_Deployment_Lead': {
        id: 'job_Las_Vegas_Enterprise_Operations_Hub_Enterprise_Commercial_Automation_Deployment_Lead',
        title: 'Enterprise Commercial Automation Deployment Lead',
        company: 'Las Vegas Enterprise Operations Hub',
        location: 'Las Vegas, NV',
        capex: '$165,000 / unit',
        category: 'Enterprise Automation',
        description: 'Deploying verified commercial robotics system for 24/7 hospitality, logistics, and facility automation.',
        specs: {
            payload_kg: '25.0 kg payload capacity',
            throughput: '120 cycles/hr pick speed',
            shift_model: 'Continuous 24/7 (3 Shifts)',
            environment: 'WMS REST API, ISO 10218-1 Safety Scanner, Vision-Guided Picking'
        },
        financials: {
            labor_savings: '$118,000 / year',
            payback_months: '11.4 Months',
            efficiency_gain: '+280% Throughput'
        },
        matched_robots: [
            { name: 'Universal Robots UR20 Cobot', score: '97%', status: 'Production Verified' },
            { name: 'ABB YuMi Dual-Arm', score: '94%', status: 'Qualified' },
            { name: 'KUKA LBR iisy 11', score: '91%', status: 'Qualified' }
        ]
    },
    'job_Apex_Industrial_Automation_Center_High_Precision_Pick___Place_Cell_Operator': {
        id: 'job_Apex_Industrial_Automation_Center_High_Precision_Pick___Place_Cell_Operator',
        title: 'High-Precision Pick & Place Cell Operator',
        company: 'Apex Industrial Automation Center',
        location: 'Henderson, NV',
        capex: '$145,000 / unit',
        category: 'Manufacturing & Assembly',
        description: 'Precision motion control and tactile force feedback for high-speed component handling and quality audit.',
        specs: {
            payload_kg: '12.0 kg payload capacity',
            throughput: '180 picks/hr cycle rate',
            shift_model: '1st & 2nd Shift (16 hrs/day)',
            environment: 'PROFINET / EtherCAT Fieldbus, 3D Vision Bin Picking, Pneumatic Gripper'
        },
        financials: {
            labor_savings: '$96,000 / year',
            payback_months: '12.8 Months',
            efficiency_gain: '+240% Precision Speed'
        },
        matched_robots: [
            { name: 'Epson SCARA G-Series', score: '96%', status: 'Production Verified' },
            { name: 'ABB GoFa CRB 15000', score: '93%', status: 'Qualified' },
            { name: 'Fanuc CRX-10iA Cobot', score: '89%', status: 'Qualified' }
        ]
    },
    'job_locus_logistics_amr': {
        id: 'job_locus_logistics_amr',
        title: 'Autonomous Mobile Robot (AMR) Fulfillment Lead',
        company: 'Apex Logistics & Fulfillment Center',
        location: 'North Las Vegas, NV',
        capex: '$185,000 / fleet',
        category: 'Warehouse & Logistics',
        description: 'High-density goods-to-person e-commerce fulfillment, autonomous tote transport, and dynamic warehouse routing.',
        specs: {
            payload_kg: '100.0 kg payload capacity',
            throughput: '3.5 m/s fleet velocity',
            shift_model: 'Continuous 24/7 Operation',
            environment: 'Manhattan WMS Integration, High-Density Barcode Scan, SLAM Dispatch'
        },
        financials: {
            labor_savings: '$142,000 / year',
            payback_months: '9.8 Months',
            efficiency_gain: '+350% Order Picking'
        },
        matched_robots: [
            { name: 'Locus Origin AMR', score: '99%', status: 'Production Verified' },
            { name: 'MiR250 Dynamic Mobile Robot', score: '94%', status: 'Qualified' },
            { name: 'OTTO 100 Heavy AMR', score: '90%', status: 'Qualified' }
        ]
    }
};

function rfrGetJobOpportunityDetails(jobKey, fallbackData) {
    if (jobKey && RFR_LIVE_JOBS_CORPUS[jobKey]) {
        return RFR_LIVE_JOBS_CORPUS[jobKey];
    }
    // Match by partial key or title search
    if (jobKey) {
        const cleanKey = String(jobKey).toLowerCase();
        for (const k in RFR_LIVE_JOBS_CORPUS) {
            if (k.toLowerCase().includes(cleanKey) || cleanKey.includes(k.toLowerCase())) {
                return RFR_LIVE_JOBS_CORPUS[k];
            }
        }
    }

    const title = (fallbackData && fallbackData.title) || (jobKey ? String(jobKey).replace(/^job_/, '').replace(/_/g, ' ') : 'Commercial Automation Deployment Lead');
    const company = (fallbackData && fallbackData.company) || 'Las Vegas Enterprise Operations Hub';
    const location = (fallbackData && fallbackData.location) || 'Las Vegas, NV';
    const capex = (fallbackData && fallbackData.capex) || '$150,000 / unit';
    const category = (fallbackData && fallbackData.category) || 'Enterprise Automation';
    const description = (fallbackData && fallbackData.description) || 'Deploying verified commercial robotics system for 24/7 industrial and facility automation.';

    return {
        id: jobKey || `job_${company}_${title}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        title: title,
        company: company,
        location: location,
        capex: capex,
        category: category,
        description: description,
        specs: {
            payload_kg: '15.0 kg payload capacity',
            throughput: '140 picks/hr throughput',
            shift_model: 'Continuous 24/7 (3 Shifts)',
            environment: 'ISO 10218-1 Safety Standard, WMS API Integration, Lidar SLAM Navigation'
        },
        financials: {
            labor_savings: '$105,000 / year',
            payback_months: '12.0 Months',
            efficiency_gain: '+250% Productivity'
        },
        matched_robots: [
            { name: 'Universal Robots UR10e Cobot', score: '96%', status: 'Production Verified' },
            { name: 'KUKA LBR iisy 11', score: '92%', status: 'Qualified' },
            { name: 'ABB GoFa CRB 15000', score: '88%', status: 'Qualified' }
        ]
    };
}

function rfrEnsureJobOpportunityModalInDom() {
    let modal = document.getElementById('jobOpportunityModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'jobOpportunityModal';
        modal.className = 'ri-modal-backdrop';
        modal.style.display = 'none';
        modal.onclick = (e) => rfrCloseJobModalOnBackdrop(e);
        modal.innerHTML = `
            <div class="ri-modal-dialog ri-job-modal-dialog">
                <button onclick="rfrCloseJobOpportunityModal()" class="ri-modal-close" aria-label="Close modal">&times;</button>
                <div id="jobOpportunityModalBody" class="ri-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    return modal;
}

function rfrShowToastNotification(msg) {
    let toast = document.getElementById('rfrToastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'rfrToastNotification';
        toast.className = 'rfr-toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function rfrCopyJobShareLink(jobId) {
    const fullUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?visit=jobs&job=' + encodeURIComponent(jobId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullUrl).then(() => {
            rfrShowToastNotification(`<i class="fas fa-check-circle"></i> Direct share link copied to clipboard!`);
        }).catch(() => {
            rfrFallbackCopy(fullUrl);
        });
    } else {
        rfrFallbackCopy(fullUrl);
    }
}

function rfrFallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    rfrShowToastNotification(`<i class="fas fa-check-circle"></i> Direct share link copied to clipboard!`);
}

function rfrHandleJobCardClick(event, jobId, rawDataStr) {
    if (event && (event.target.tagName === 'INPUT' || (event.target.closest && event.target.closest('label.ri-job-check-wrap')))) {
        return;
    }
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    let fallbackObj = null;
    if (typeof rawDataStr === 'string' && rawDataStr.startsWith('{')) {
        try { fallbackObj = JSON.parse(rawDataStr); } catch (e) {}
    } else if (rawDataStr && typeof rawDataStr === 'object') {
        fallbackObj = rawDataStr;
    }
    rfrOpenJobOpportunityModal(jobId, fallbackObj);
}

function rfrOpenJobOpportunityModal(jobKey, fallbackData) {
    const modal = rfrEnsureJobOpportunityModalInDom();
    const body = document.getElementById('jobOpportunityModalBody');
    if (!modal || !body) return;

    if (fallbackData && typeof fallbackData === 'object') {
        const key = jobKey || `job_${fallbackData.company}_${fallbackData.title}`.replace(/[^a-zA-Z0-9_]/g, '_');
        if (!RFR_LIVE_JOBS_CORPUS[key]) {
            RFR_LIVE_JOBS_CORPUS[key] = {
                id: key,
                title: fallbackData.title || 'Commercial Automation Deployment Lead',
                company: fallbackData.company || 'Las Vegas Operations',
                location: fallbackData.location || 'Las Vegas, NV',
                capex: fallbackData.capex || '$150,000 / unit',
                category: fallbackData.category || 'Enterprise Automation',
                description: fallbackData.description || 'Deploying verified commercial robotics system for 24/7 industrial and facility automation.',
                specs: fallbackData.specs || {
                    payload_kg: '15.0 kg payload capacity',
                    throughput: '140 picks/hr rate',
                    shift_model: 'Continuous 24/7 (3 Shifts)',
                    environment: 'WMS API Integration, ISO 10218-1 Safety Scanner, Vision-Guided Picking'
                },
                financials: fallbackData.financials || {
                    labor_savings: '$105,000 / year',
                    payback_months: '12.0 Months',
                    efficiency_gain: '+250% Productivity'
                },
                matched_robots: fallbackData.matched_robots || [
                    { name: 'Universal Robots UR10e Cobot', score: '96%', status: 'Production Verified' },
                    { name: 'KUKA LBR iisy 11', score: '92%', status: 'Qualified' },
                    { name: 'ABB GoFa CRB 15000', score: '88%', status: 'Qualified' }
                ]
            };
        }
        jobKey = key;
    }

    const job = rfrGetJobOpportunityDetails(jobKey, fallbackData);
    const appliedJobs = rfrGetAppliedJobs();
    const isApplied = !!appliedJobs[job.id];

    try {
        const newUrl = window.location.pathname + '?visit=jobs&job=' + encodeURIComponent(job.id);
        window.history.pushState({ jobId: job.id }, '', newUrl);
    } catch (e) {}

    body.innerHTML = `
        <div class="ri-job-modal-header">
            <div class="ri-crm-autopilot-tag"><i class="fas fa-bolt"></i> Live Robot Job Opportunity</div>
            <h2 class="ri-job-modal-title">${rfrEscape(job.title)}</h2>
            <div class="ri-job-modal-sub">
                <span><i class="fas fa-building"></i> ${rfrEscape(job.company)}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${rfrEscape(job.location)}</span>
                <span class="ri-job-badge">${rfrEscape(job.category)}</span>
            </div>
        </div>

        <div class="ri-job-modal-body-content">
            <div class="ri-job-modal-main">
                <div class="ri-job-modal-card">
                    <h4><i class="fas fa-file-alt"></i> Opportunity & Operational Overview</h4>
                    <p>${rfrEscape(job.description)}</p>
                </div>

                <div class="ri-job-modal-card">
                    <h4><i class="fas fa-cogs"></i> Technical & Task Specifications</h4>
                    <div class="ri-spec-grid">
                        <div class="ri-spec-item">
                            <span class="ri-spec-label">Payload Capacity</span>
                            <span class="ri-spec-val">${rfrEscape(job.specs ? job.specs.payload_kg : '15.0 kg')}</span>
                        </div>
                        <div class="ri-spec-item">
                            <span class="ri-spec-label">Target Throughput</span>
                            <span class="ri-spec-val">${rfrEscape(job.specs ? job.specs.throughput : '140 picks/hr')}</span>
                        </div>
                        <div class="ri-spec-item">
                            <span class="ri-spec-label">Shift Model</span>
                            <span class="ri-spec-val">${rfrEscape(job.specs ? job.specs.shift_model : '24/7 Continuous')}</span>
                        </div>
                        <div class="ri-spec-item" style="grid-column: 1 / -1;">
                            <span class="ri-spec-label">Environment & Safety Standard</span>
                            <span class="ri-spec-val">${rfrEscape(job.specs ? job.specs.environment : 'WMS API & ISO 10218-1')}</span>
                        </div>
                    </div>
                </div>

                <div class="ri-job-modal-card">
                    <h4><i class="fas fa-robot"></i> Matched Compatible Robots (${job.matched_robots ? job.matched_robots.length : 0})</h4>
                    <div class="ri-matched-robots-list">
                        ${(job.matched_robots || []).map(r => `
                            <div class="ri-matched-robot-item">
                                <div class="ri-matched-robot-info">
                                    <i class="fas fa-check-circle" style="color:var(--brand-green-bright);"></i>
                                    <strong>${rfrEscape(r.name)}</strong>
                                    <span class="ri-matched-status">${rfrEscape(r.status)}</span>
                                </div>
                                <div class="ri-matched-score">${rfrEscape(r.score)} Match</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="ri-job-modal-sidebar">
                <div class="ri-job-modal-card ri-job-financial-card">
                    <h4><i class="fas fa-chart-line"></i> Financial ROI & Payback</h4>
                    <div class="ri-financial-row">
                        <span>CapEx / RaaS Target:</span>
                        <strong>${rfrEscape(job.capex)}</strong>
                    </div>
                    <div class="ri-financial-row">
                        <span>Est. Labor Savings:</span>
                        <strong style="color:var(--brand-green-light);">${rfrEscape(job.financials ? job.financials.labor_savings : '$105,000 / yr')}</strong>
                    </div>
                    <div class="ri-financial-row">
                        <span>Payback Period:</span>
                        <strong style="color:var(--accent-amber-bright);">${rfrEscape(job.financials ? job.financials.payback_months : '12.0 Months')}</strong>
                    </div>
                    <div class="ri-financial-row">
                        <span>Productivity Gain:</span>
                        <strong>${rfrEscape(job.financials ? job.financials.efficiency_gain : '+250%')}</strong>
                    </div>
                </div>

                <div class="ri-job-modal-card ri-job-actions-card">
                    <h4><i class="fas fa-share-alt"></i> Investigate & Share</h4>
                    <button type="button" onclick="rfrCopyJobShareLink('${rfrEscape(job.id)}')" class="btn btn-secondary ri-modal-btn">
                        <i class="fas fa-link"></i> Copy Direct Share Link
                    </button>
                    <button type="button" id="modal_apply_btn_${rfrEscape(job.id)}" onclick="rfrApplySingleJobFromModal('${rfrEscape(job.id)}')" class="btn btn-primary ri-modal-btn ${isApplied ? 'ri-btn-applied' : ''}" ${isApplied ? 'disabled' : ''}>
                        <i class="fas fa-${isApplied ? 'check-circle' : 'paper-plane'}"></i> <span id="modal_apply_text_${rfrEscape(job.id)}">${isApplied ? 'Proposal Applied & Sent' : 'Submit Autopilot Proposal'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function rfrCloseJobOpportunityModal() {
    const modal = document.getElementById('jobOpportunityModal');
    if (modal) {
        modal.style.display = 'none';
    }
    try {
        if (window.location.search.includes('job=')) {
            const newUrl = window.location.pathname + '?visit=jobs';
            window.history.pushState({}, '', newUrl);
        }
    } catch (e) {}
}

function rfrCloseJobModalOnBackdrop(e) {
    if (e && e.target && e.target.id === 'jobOpportunityModal') {
        rfrCloseJobOpportunityModal();
    }
}

async function rfrApplySingleJobFromModal(jobId) {
    const btn = document.getElementById(`modal_apply_btn_${jobId}`);
    const text = document.getElementById(`modal_apply_text_${jobId}`);
    if (!btn) return;

    btn.disabled = true;
    if (text) text.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting Proposal...`;

    await new Promise(r => setTimeout(r, 800));

    rfrSaveAppliedJob(jobId);

    btn.className = 'btn btn-primary ri-modal-btn ri-btn-applied';
    if (text) text.textContent = 'Proposal Applied & Sent ✓';

    const cards = document.querySelectorAll(`[id*="_card_${jobId}"]`);
    cards.forEach(card => {
        card.classList.remove('ri-job-selected');
        card.classList.add('ri-job-applied');
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) { cb.checked = false; cb.disabled = true; }
        const status = card.querySelector('.ri-job-status-pill');
        if (status) status.innerHTML = `<span class="ri-applied-badge"><i class="fas fa-check-circle"></i> Proposal Applied & Sent</span>`;
    });

    rfrShowToastNotification(`<i class="fas fa-check-circle"></i> Proposal successfully submitted to buyer CRM!`);
}

function rfrCheckUrlJobParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const visit = params.get('visit');
        const jobId = params.get('job');

        if (visit === 'jobs' || visit === 'jobslanding') {
            const section = document.getElementById('lookup') || document.getElementById('brief') || document.getElementById('directory');
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }

        if (jobId) {
            setTimeout(() => {
                rfrOpenJobOpportunityModal(jobId);
            }, 450);
        }
    } catch (e) {}
}
"""

CSS_OPPORTUNITY_MODAL = r"""
/* ── LIVE ROBOT JOB OPPORTUNITY MODAL & INTERACTIVE CARD STYLES ── */
.ri-job-card {
    cursor: pointer;
    position: relative;
}
.ri-job-explore-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: var(--brand-green-light);
    font-weight: 600;
    margin-top: 0.65rem;
    transition: color 0.2s ease;
}
.ri-job-card:hover .ri-job-explore-hint {
    color: var(--accent-amber-bright);
    text-decoration: underline;
}
.ri-job-modal-dialog {
    max-width: 860px;
    width: 92%;
    background: #090d16;
    border: 1px solid rgba(63, 209, 127, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(63, 209, 127, 0.15);
    border-radius: 16px;
    padding: 1.75rem;
}
.ri-job-modal-header {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 1rem;
}
.ri-job-modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0.4rem 0 0.5rem 0;
}
.ri-job-modal-sub {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.7);
}
.ri-job-modal-badge {
    background: rgba(63, 209, 127, 0.15);
    color: var(--brand-green-bright);
    padding: 0.2rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}
.ri-job-modal-body-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1.5rem;
}
@media (max-width: 768px) {
    .ri-job-modal-body-content {
        grid-template-columns: 1fr;
    }
}
.ri-job-modal-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
}
.ri-job-modal-card h4 {
    font-size: 1rem;
    color: #ffffff;
    margin: 0 0 0.85rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.ri-job-modal-card p {
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin: 0;
}
.ri-matched-robots-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}
.ri-matched-robot-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
}
.ri-matched-robot-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;
    color: #ffffff;
}
.ri-matched-status {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.06);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
}
.ri-matched-score {
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--brand-green-bright);
}
.ri-job-financial-card {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.25);
}
.ri-financial-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    padding: 0.45rem 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}
.ri-financial-row:last-child {
    border-bottom: none;
}
.ri-modal-btn {
    width: 100%;
    margin-top: 0.65rem;
    padding: 0.7rem;
    font-size: 0.88rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}
.ri-btn-applied {
    background: #059669 !important;
    border-color: #10b981 !important;
    cursor: default;
}
.rfr-toast-notification {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #0f172a;
    border: 1px solid var(--brand-green-bright);
    color: #ffffff;
    padding: 0.85rem 1.35rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 99999;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
}
.rfr-toast-notification.show {
    opacity: 1;
    transform: translateY(0);
}
"""

def update_main_js():
    with open(JS_FILE, 'r', encoding='utf-8') as f:
        code = f.read()

    # Append job modal JS logic if not present
    if 'RFR_LIVE_JOBS_CORPUS' not in code:
        code += "\n\n" + JOB_MODAL_JS

    # Update DOMContentLoaded listener to call rfrCheckUrlJobParams
    if 'rfrCheckUrlJobParams()' not in code:
        code = code.replace(
            "loadRobotBrief();\n});",
            "loadRobotBrief();\n    rfrCheckUrlJobParams();\n});"
        )

    # Update rfrBuildJobsCrmHtml to make cards clickable with onclick
    old_card_markup = """            <div class="ri-job-card ${isApplied ? 'ri-job-applied' : 'ri-job-selected'}" id="${contextId}_card_${jobId}">
                <div class="ri-job-head">
                    <label class="ri-job-check-wrap">
                        <input type="checkbox" class="ri-job-checkbox ${contextId}-checkbox" data-job-id="${jobId}" data-context="${contextId}" ${isApplied ? 'disabled' : 'checked'} onchange="rfrUpdateJobsCrmState('${contextId}')" />
                        <span class="ri-job-badge">${rfrEscape(j.category || 'Buyer Job')}</span>
                    </label>
                    <span class="ri-job-capex">${rfrEscape(j.capex || '')}</span>
                </div>
                <h4 class="ri-job-title">${rfrEscape(j.title)}</h4>
                <div class="ri-job-meta">
                    <span><i class="fas fa-building"></i> ${rfrEscape(j.company)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${rfrEscape(j.location)}</span>
                </div>
                <p class="ri-job-desc">${rfrEscape(j.description)}</p>
                <div class="ri-job-status-pill" id="${contextId}_status_${jobId}">
                    ${isApplied ? '<span class="ri-applied-badge"><i class="fas fa-check-circle"></i> Proposal Applied & Sent</span>' : '<span class="ri-ready-badge"><i class="fas fa-bolt"></i> Autopilot Ready</span>'}
                </div>
            </div>"""

    new_card_markup = """            <div class="ri-job-card ${isApplied ? 'ri-job-applied' : 'ri-job-selected'}" id="${contextId}_card_${jobId}" onclick="rfrHandleJobCardClick(event, '${jobId}', ${rfrEscapeJsonAttr(j)})">
                <div class="ri-job-head">
                    <label class="ri-job-check-wrap" onclick="event.stopPropagation();">
                        <input type="checkbox" class="ri-job-checkbox ${contextId}-checkbox" data-job-id="${jobId}" data-context="${contextId}" ${isApplied ? 'disabled' : 'checked'} onchange="rfrUpdateJobsCrmState('${contextId}')" />
                        <span class="ri-job-badge">${rfrEscape(j.category || 'Buyer Job')}</span>
                    </label>
                    <span class="ri-job-capex">${rfrEscape(j.capex || '')}</span>
                </div>
                <h4 class="ri-job-title">${rfrEscape(j.title)}</h4>
                <div class="ri-job-meta">
                    <span><i class="fas fa-building"></i> ${rfrEscape(j.company)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${rfrEscape(j.location)}</span>
                </div>
                <p class="ri-job-desc">${rfrEscape(j.description)}</p>
                <div class="ri-job-explore-hint"><i class="fas fa-external-link-alt"></i> Explore Opportunity & Share</div>
                <div class="ri-job-status-pill" id="${contextId}_status_${jobId}">
                    ${isApplied ? '<span class="ri-applied-badge"><i class="fas fa-check-circle"></i> Proposal Applied & Sent</span>' : '<span class="ri-ready-badge"><i class="fas fa-bolt"></i> Autopilot Ready</span>'}
                </div>
            </div>"""

    if old_card_markup in code:
        code = code.replace(old_card_markup, new_card_markup)

    # Add rfrEscapeJsonAttr if missing
    if 'rfrEscapeJsonAttr' not in code:
        code += """

function rfrEscapeJsonAttr(obj) {
    if (!obj) return '{}';
    return rfrEscape(JSON.stringify(obj));
}
"""

    with open(JS_FILE, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Updated js/main.js successfully.")

def update_css():
    with open(CSS_FILE, 'r', encoding='utf-8') as f:
        css = f.read()

    if '.ri-job-modal-dialog' not in css:
        css += "\n\n" + CSS_OPPORTUNITY_MODAL
        with open(CSS_FILE, 'w', encoding='utf-8') as f:
            f.write(css)
        print("Updated css/styles.css successfully.")

if __name__ == '__main__':
    update_main_js()
    update_css()
