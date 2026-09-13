const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainJsPath = path.join(__dirname, '../js/main.js');
const mainJsCode = fs.readFileSync(mainJsPath, 'utf8');

const windowMock = {
    addEventListener: () => {}
};
windowMock.window = windowMock;

class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

const mockElement = {
    appendChild: () => {},
    setAttribute: () => {},
    style: {}
};

// Set up a browser-like sandbox to evaluate main.js functions directly
const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    Date,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    encodeURIComponent,
    decodeURIComponent,
    window: windowMock,
    IntersectionObserver: MockIntersectionObserver,
    document: {
        addEventListener: () => {},
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => mockElement,
        head: mockElement
    },
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    }
};

vm.createContext(sandbox);
vm.runInContext(mainJsCode, sandbox);

console.log('🧪 Running ABB & YuMi Taxonomy & CRM Integration Verification Tests...');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// Test 1: ABB Mobile Robots URL direct lookup
const mobileRobotsResult = sandbox.rfrLookupRobotUrl('https://www.abb.com/global/en/areas/robotics/products/mobile-robots');
mobileRobotsResult.then(res => {
    assert(res.source === 'indexed_ontology', 'Mobile Robots URL resolves via indexed OEM ontology');
    assert(res.profile.name.includes('Flexley AMR'), 'Mobile Robots URL resolves to Flexley AMR profile');
    assert(res.profile.matched_jobs.some(j => j.category.includes('AMR') || j.category.includes('Logistics')), 'Mobile Robots matched jobs are AMR/Logistics jobs');

    // Test 2: ABB YuMi URL direct lookup
    return sandbox.rfrLookupRobotUrl('https://new.abb.com/products/robotics/collaborative-robots/yumi');
}).then(res => {
    assert(res.source === 'indexed_ontology', 'YuMi URL resolves via indexed OEM ontology');
    assert(res.profile.name.includes('YuMi'), 'YuMi URL resolves to YuMi Dual-Arm profile');
    assert(res.profile.matched_jobs.some(j => j.category.includes('Assembly') || j.category.includes('Electronics')), 'YuMi matched jobs are precision assembly jobs, NOT AMR');

    // Test 3: Mixed URL with YuMi model keyword (e.g. mobile-robots page with YuMi selection)
    return sandbox.rfrLookupRobotUrl('https://www.abb.com/global/en/areas/robotics/products/mobile-robots?selected=yumi');
}).then(res => {
    assert(res.profile.name.includes('YuMi'), 'Product selection of YuMi overrides mobile-robots path hint');
    assert(!res.profile.matched_jobs.some(j => j.category === 'No amr jobs'), 'No invalid "No amr jobs" message');

    // Test 4: First-time raw URL synthesis for YuMi (resolves via catalog/taxonomy)
    const rawYuMiProfile = sandbox.rfrSynthesizeOntologyFromDomain('https://custom-integrator.de/solutions/yumi-assembly-cell');
    assert(rawYuMiProfile.name.includes('YuMi'), 'Raw URL with YuMi resolves to YuMi Collaborative Robot Arm');
    assert(rawYuMiProfile.matched_jobs.length >= 2, 'Raw YuMi synthesis produces valid matched jobs');

    // Test 5: First-time raw URL synthesis for AMR
    const rawAmrProfile = sandbox.rfrSynthesizeOntologyFromDomain('https://nextgen-amr-oem.com/products/mobile-robots');
    assert(rawAmrProfile.name.includes('Autonomous Mobile Robot'), 'Raw URL with mobile-robots synthesizes as AMR');
    assert(rawAmrProfile.matched_jobs.some(j => j.category.includes('AMR') || j.category.includes('Warehouse')), 'Raw AMR synthesis produces AMR logistics jobs');

    // Test 6: CRM HTML generator non-empty fallback
    const crmHtml = sandbox.rfrBuildJobsCrmHtml([], 'lookup');
    assert(crmHtml.includes('ri-jobs-block') && crmHtml.includes('Automate Job Applications'), 'rfrBuildJobsCrmHtml never returns empty CRM');

    console.log(`\n🎉 Test Suite Completed: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}).catch(err => {
    console.error('💥 Test Execution Error:', err);
    process.exit(1);
});
