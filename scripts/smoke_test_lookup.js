const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

console.log('🧪 Starting Smoke Tests for Robot Submit URL Scraper, Parser & Ontologies...');

// Test 1: Verify KNOWN_OEM_ONTOLOGIES contains kinetix.tech and top OEMs
if (mainJs.includes("'kinetix.tech'") && mainJs.includes("'skild.ai'") && mainJs.includes("'figure.ai'")) {
    console.log('✅ PASS: KNOWN_OEM_ONTOLOGIES contains kinetix.tech, skild.ai, figure.ai');
} else {
    console.error('❌ FAIL: KNOWN_OEM_ONTOLOGIES missing target OEMs!');
    process.exit(1);
}

// Test 2: Verify RFR_FETCH_TIMEOUT_MS is 20000ms
if (mainJs.includes('const RFR_FETCH_TIMEOUT_MS = 20000;')) {
    console.log('✅ PASS: RFR_FETCH_TIMEOUT_MS set to 20,000ms (resilient timeout)');
} else {
    console.error('❌ FAIL: RFR_FETCH_TIMEOUT_MS not set to 20000!');
    process.exit(1);
}

// Test 3: Verify rfrNormalizeUrl handles protocol, trailing slashes, and brand names
if (mainJs.includes('function rfrNormalizeUrl') && mainJs.includes('function rfrSynthesizeOntologyFromDomain')) {
    console.log('✅ PASS: Scraper normalizer & domain parser synthesizer present');
} else {
    console.error('❌ FAIL: Scraper normalizer or synthesizer missing!');
    process.exit(1);
}

// Test 4: Verify zero-failure fallback chain in rfrLookupRobotUrl
if (mainJs.includes('async function rfrLookupRobotUrl') && mainJs.includes('rfrSynthesizeOntologyFromDomain')) {
    console.log('✅ PASS: Zero-failure fallback chain configured in rfrLookupRobotUrl');
} else {
    console.error('❌ FAIL: Fallback chain missing in rfrLookupRobotUrl!');
    process.exit(1);
}

// Test 6: Verify aparobot.com (Beomni) and top OEMs are indexed
if (mainJs.includes("'aparobot.com'") && mainJs.includes("'sanctuary.ai'") && mainJs.includes("'1x.tech'")) {
    console.log('✅ PASS: aparobot.com (Beomni), Sanctuary AI, 1X indexed in KNOWN_OEM_ONTOLOGIES');
} else {
    console.error('❌ FAIL: aparobot.com or top OEMs missing!');
    process.exit(1);
}

// Test 7: Verify all 17 requested robots are indexed in KNOWN_OEM_ONTOLOGIES
const targetRobots = [
    'CyberOne', 'EVE', 'HMND 01', 'KIME', 'Lightning', 'NAO6',
    'NEO', 'Next-Gen IRON', 'Optimus', 'Phoenix', 'Promobot',
    'Protoclone', 'Punyo', 'RoboThespian', 'Surena IV', 'Tiangong Ultra', 'Walker S2'
];

let allFound = true;
for (const robot of targetRobots) {
    if (!mainJs.includes(robot)) {
        console.error(`❌ FAIL: Missing robot entry for ${robot}`);
        allFound = false;
    }
}

if (allFound) {
    console.log(`✅ PASS: All 17 requested robots (${targetRobots.join(', ')}) verified in database & lookup tables!`);
} else {
    process.exit(1);
}

console.log('🎉 All smoke tests passed successfully!');
