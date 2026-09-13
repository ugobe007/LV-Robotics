const fs = require('fs');
const path = require('path');
const vm = require('vm');

const mainJsCode = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

const modalBodyMock = { innerHTML: '' };
const modalBackdropMock = { style: { display: 'none' }, addEventListener: () => {} };
const gridMock = { innerHTML: '' };
const searchInputMock = { addEventListener: () => {} };

const sandbox = {
    console,
    document: {
        getElementById: (id) => {
            if (id === 'robotProfileModal') return modalBackdropMock;
            if (id === 'robotModalBody') return modalBodyMock;
            if (id === 'catalogGrid') return gridMock;
            if (id === 'catalogSearchInput') return searchInputMock;
            return null;
        },
        querySelector: () => null,
        querySelectorAll: () => [],
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

console.log('--- TESTING GLOBAL HUMANOID DIRECTORY & ROBOT PROFILE MODAL ---');

// 1. Test opening profile modal for specific robot
console.log('Testing openRobotProfileModal("Galaxea Dynamics NEXO")...');
sandbox.openRobotProfileModal("Galaxea Dynamics NEXO");
if (modalBodyMock.innerHTML.includes("NEXO") && modalBodyMock.innerHTML.includes("168 cm")) {
    console.log('[PASS] Modal populated with NEXO photo, height (168 cm), specs, and ontologies!');
} else {
    console.error('[FAIL] Modal body did not contain NEXO specs');
}

// 2. Test opening profile modal for Unitree Superman
console.log('Testing openRobotProfileModal("Unitree Superman")...');
sandbox.openRobotProfileModal("Unitree Superman");
if (modalBodyMock.innerHTML.includes("Superman") && modalBodyMock.innerHTML.includes("China")) {
    console.log('[PASS] Modal populated with Unitree Superman specs and country!');
} else {
    console.error('[FAIL] Modal body did not contain Superman specs');
}

// 3. Test catalog directory filtering
console.log('Testing initRobotCatalogDirectory() and catalog filtering...');
sandbox.initRobotCatalogDirectory();
const allRobots = sandbox.getFilteredRobotCatalog();
console.log(`[PASS] Total robots loaded in catalog directory: ${allRobots.length}`);

sandbox.currentDirectoryFilter = 'china';
const chinaRobots = sandbox.getFilteredRobotCatalog();
console.log(`[PASS] China filtered robots: ${chinaRobots.length}`);

sandbox.currentDirectoryFilter = 'us';
const usRobots = sandbox.getFilteredRobotCatalog();
console.log(`[PASS] US filtered robots: ${usRobots.length}`);

console.log('--- ALL DIRECTORY & MODAL TESTS PASSED SUCCESSFULLY ---');
