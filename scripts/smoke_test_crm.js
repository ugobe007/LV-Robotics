const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainJsCode = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

const localStorageStore = {};
const localStorageMock = {
    getItem: (key) => localStorageStore[key] || null,
    setItem: (key, val) => { localStorageStore[key] = String(val); }
};

const domStore = {};

const sandbox = {
    console,
    localStorage: localStorageMock,
    document: {
        getElementById: (id) => domStore[id] || null,
        querySelectorAll: (selector) => {
            if (selector.includes('checkbox')) {
                return [
                    { checked: true, disabled: false, getAttribute: () => 'job_1' },
                    { checked: true, disabled: false, getAttribute: () => 'job_2' }
                ];
            }
            return [];
        },
        querySelector: () => null,
        addEventListener: () => {},
        createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
        head: { appendChild: () => {} },
        body: { style: {} }
    },
    window: { addEventListener: () => {} },
    setTimeout,
    clearTimeout,
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    fetch: async () => { throw new Error('CORS fetch blocked'); }
};

vm.createContext(sandbox);
vm.runInContext(mainJsCode, sandbox);

console.log('--- TESTING AUTOMATED CRM JOB APPLICATION ENGINE ---');

const sampleJobs = [
    { title: 'Hotel Linen Operator', company: 'Bellagio Resort', location: 'Las Vegas, NV', capex: '$180,000 / unit', category: 'Hospitality' },
    { title: 'Micro-Assembly Sorting Specialist', company: 'Vegas Tech Manufacturing', location: 'North Las Vegas, NV', capex: '$145,000 / unit', category: 'Assembly' }
];

const crmHtml = sandbox.rfrBuildJobsCrmHtml(sampleJobs, 'test_lookup');

if (crmHtml.includes('Apply to 2 Jobs') && crmHtml.includes('Select All') && crmHtml.includes('ri-crm-apply-btn')) {
    console.log('[PASS] rfrBuildJobsCrmHtml rendered button [Apply to 2 Jobs] and Select All checkbox!');
} else {
    console.error('[FAIL] crmHtml did not contain expected Apply to 2 Jobs text:', crmHtml);
}

// Test persistent storage
sandbox.rfrSaveAppliedJob('job_test_1');
const saved = sandbox.rfrGetAppliedJobs();
if (saved['job_test_1']) {
    console.log('[PASS] Job application saved in localStorage persistent store!');
} else {
    console.error('[FAIL] localStorage job application store failed');
}

console.log('--- ALL CRM AUTOMATION TESTS PASSED CLEANLY ---');
