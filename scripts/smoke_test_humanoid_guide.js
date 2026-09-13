const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load main.js in a virtual context
const mainJsCode = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

const sandbox = {
    console,
    document: {
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
        head: { appendChild: () => {} }
    },
    window: { addEventListener: () => {} },
    setTimeout,
    clearTimeout,
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    fetch: async () => { throw new Error('CORS fetch blocked'); }
};

vm.createContext(sandbox);
vm.runInContext(mainJsCode, sandbox);

const rfrLookupRobotUrl = sandbox.rfrLookupRobotUrl;

const testCases = [
    { url: 'https://humanoid.guide/humanoid-robots-database/', expectedName: 'Top 200 Humanoid Robots Database (2026)' },
    { url: 'https://humanoid.guide/product/nexo/', expectedVendor: 'Galaxea Dynamics' },
    { url: 'Galaxea Dynamics NEXO', expectedVendor: 'Galaxea Dynamics' },
    { url: 'Unitree Superman', expectedVendor: 'Unitree Robotics' },
    { url: 'AEI Robot Alice', expectedVendor: 'AEI Robot' },
    { url: '1X NEO', expectedVendor: '1X Technologies' },
    { url: 'Beomni', expectedVendor: 'Beyond Imagination (APA Robotics)' },
    { url: 'https://www.aparobot.com/robots/beomni', expectedVendor: 'Beyond Imagination (APA Robotics)' },
    { url: 'https://raw-unindexed-robot-startup.ai', expectedVendor: 'Raw-unindexed-robot-startup' }
];

console.log('--- RUNNING HUMANOID GUIDE & MASTER LOOKUP SMOKE TESTS ---');

let passed = 0;
for (const tc of testCases) {
    try {
        const promise = rfrLookupRobotUrl(tc.url);
        promise.then(res => {
            if (!res || !res.profile) {
                console.error(`[FAIL] ${tc.url} -> Returned null or missing profile`);
                return;
            }
            const p = res.profile;
            console.log(`[PASS] ${tc.url} -> Found: "${p.name}" (${p.vendor}) | Photo: ${p.photo_url ? 'YES (' + p.photo_url.slice(0, 45) + '...)' : 'NO'} | Height: ${p.specs?.height_cm} | Country: ${p.country || 'N/A'}`);
            passed++;
        });
    } catch (e) {
        console.error(`[FAIL] ${tc.url} -> Exception: ${e.message}`);
    }
}
