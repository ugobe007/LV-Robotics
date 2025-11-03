/**
 * SUPABASE CLIENT VERIFICATION SCRIPT
 * 
 * This script tests:
 * 1. Supabase library loading
 * 2. Client initialization
 * 3. Authentication status
 * 4. Database connectivity
 * 5. Storage connectivity
 * 
 * HOW TO USE:
 * 1. Open DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 * 5. Review results for ✓ or ✗ indicators
 */

// ================================================================
// HELPER FUNCTIONS
// ================================================================

const testResults = [];

function logTest(name, status, message = '') {
    const icon = status ? '✓' : '✗';
    const color = status ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;';
    const fullMessage = message ? ` - ${message}` : '';
    console.log(`%c${icon} ${name}${fullMessage}`, color);
    testResults.push({ name, status, message });
}

function logSection(title) {
    console.log(`\n%c${'='.repeat(60)}`, 'color: blue; font-weight: bold;');
    console.log(`%c${title}`, 'color: blue; font-weight: bold; font-size: 14px;');
    console.log(`%c${'='.repeat(60)}`, 'color: blue; font-weight: bold;');
}

function logInfo(message) {
    console.log(`ℹ️  ${message}`);
}

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================================================================
// SECTION 1: LIBRARY LOADING
// ================================================================

logSection('1. LIBRARY LOADING');

// Check if Supabase library is loaded
const supabaseLoaded = typeof window.supabase !== 'undefined';
logTest('Supabase library loaded', supabaseLoaded, 
    supabaseLoaded ? `Version available` : 'Not found on window.supabase');

// Check if createClient is available
const createClientAvailable = typeof window.supabase?.createClient === 'function';
logTest('Supabase.createClient function available', createClientAvailable);

// Check if main.js loaded
const mainJsLoaded = typeof window.initializeSupabase !== 'undefined' || typeof sbClient !== 'undefined';
logTest('Main.js executed', mainJsLoaded);

// ================================================================
// SECTION 2: CLIENT INITIALIZATION
// ================================================================

logSection('2. CLIENT INITIALIZATION');

// Check if sbClient exists (global from main.js)
try {
    const sbClientExists = typeof sbClient !== 'undefined';
    const sbClientInitialized = sbClientExists && sbClient !== null;
    
    logTest('sbClient variable defined', sbClientExists);
    logTest('sbClient initialized', sbClientInitialized, 
        sbClientInitialized ? 'Instance created' : 'Variable is null or undefined');
    
    if (sbClientInitialized) {
        logTest('sbClient has auth property', 
            typeof sbClient.auth !== 'undefined' && sbClient.auth !== null);
        logTest('sbClient has storage property', 
            typeof sbClient.storage !== 'undefined' && sbClient.storage !== null);
        logTest('sbClient has from method (query builder)', 
            typeof sbClient.from === 'function');
    }
} catch (error) {
    logTest('sbClient check', false, error.message);
}

// ================================================================
// SECTION 3: AUTHENTICATION STATUS
// ================================================================

logSection('3. AUTHENTICATION STATUS');

(async () => {
    try {
        if (sbClient && typeof sbClient.auth?.getSession === 'function') {
            const { data, error } = await sbClient.auth.getSession();
            
            if (error) {
                logTest('Get session', false, error.message);
            } else if (data.session) {
                logTest('User authenticated', true, `Email: ${data.session.user.email}`);
                logInfo(`User ID: ${data.session.user.id}`);
                logInfo(`Auth timestamp: ${new Date(data.session.created_at * 1000).toLocaleString()}`);
            } else {
                logTest('User authenticated', false, 'No active session');
                logInfo('This is OK for public/gallery pages');
            }
        } else {
            logTest('Auth method available', false, 'sbClient.auth.getSession not found');
        }
    } catch (error) {
        logTest('Authentication check', false, error.message);
    }
    
    // ================================================================
    // SECTION 4: DATABASE CONNECTIVITY
    // ================================================================
    
    logSection('4. DATABASE CONNECTIVITY');
    
    try {
        if (sbClient && typeof sbClient.from === 'function') {
            // Test 1: Query posts table
            const { data: posts, error: postsError } = await sbClient
                .from('posts')
                .select('*')
                .limit(1);
            
            if (postsError) {
                logTest('Posts table accessible', false, postsError.message);
            } else {
                logTest('Posts table accessible', true, `${Array.isArray(posts) ? posts.length : 0} records found`);
            }
            
            // Test 2: Query members table
            const { data: members, error: membersError } = await sbClient
                .from('members')
                .select('*')
                .limit(1);
            
            if (membersError) {
                logTest('Members table accessible', false, membersError.message);
            } else {
                logTest('Members table accessible', true, `${Array.isArray(members) ? members.length : 0} records found`);
            }
            
            // Test 3: Query admin_users table
            const { data: admins, error: adminsError } = await sbClient
                .from('admin_users')
                .select('*')
                .limit(1);
            
            if (adminsError) {
                logTest('Admin users table accessible', false, adminsError.message);
            } else {
                logTest('Admin users table accessible', true, `${Array.isArray(admins) ? admins.length : 0} records found`);
            }
            
            // Test 4: Count gallery images
            const { data: galleryImages, error: galleryError } = await sbClient
                .from('posts')
                .select('*')
                .eq('media_type', 'image');
            
            if (galleryError) {
                logTest('Gallery images', false, galleryError.message);
            } else {
                logTest('Gallery images accessible', true, `${Array.isArray(galleryImages) ? galleryImages.length : 0} images found`);
            }
            
        } else {
            logTest('Database query method', false, 'sbClient.from() not available');
        }
    } catch (error) {
        logTest('Database connectivity', false, error.message);
    }
    
    // ================================================================
    // SECTION 5: STORAGE CONNECTIVITY
    // ================================================================
    
    logSection('5. STORAGE CONNECTIVITY');
    
    try {
        if (sbClient && typeof sbClient.storage !== 'undefined') {
            // Test 1: List files in community-media bucket
            const { data: communityFiles, error: communityError } = await sbClient
                .storage
                .from('community-media')
                .list('', { limit: 5 });
            
            if (communityError) {
                logTest('Community media storage accessible', false, communityError.message);
            } else {
                logTest('Community media storage accessible', true, 
                    `${communityFiles.length} items found`);
                if (communityFiles.length > 0) {
                    logInfo(`Sample file: ${communityFiles[0].name}`);
                }
            }
            
            // Test 2: List files in member-photos bucket
            const { data: memberPhotos, error: memberError } = await sbClient
                .storage
                .from('member-photos')
                .list('', { limit: 5 });
            
            if (memberError) {
                logTest('Member photos storage accessible', false, memberError.message);
            } else {
                logTest('Member photos storage accessible', true, 
                    `${memberPhotos.length} items found`);
            }
        } else {
            logTest('Storage API available', false, 'sbClient.storage not found');
        }
    } catch (error) {
        logTest('Storage connectivity', false, error.message);
    }
    
    // ================================================================
    // SECTION 6: FUNCTION AVAILABILITY
    // ================================================================
    
    logSection('6. FUNCTION AVAILABILITY');
    
    logTest('loadGalleryFromSupabase function', 
        typeof loadGalleryFromSupabase !== 'undefined', 
        'Gallery loading function available');
    logTest('initAuth function', 
        typeof initAuth !== 'undefined', 
        'Auth initialization function available');
    logTest('initializeBulletinBoard function', 
        typeof initializeBulletinBoard !== 'undefined', 
        'Bulletin board function available');
    
    // ================================================================
    // SECTION 7: SUMMARY
    // ================================================================
    
    logSection('SUMMARY & RECOMMENDATIONS');
    
    const passedTests = testResults.filter(t => t.status).length;
    const totalTests = testResults.length;
    const passPercentage = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n✓ Passed: ${passedTests}/${totalTests} tests (${passPercentage}%)\n`);
    
    if (passPercentage === 100) {
        console.log('%c🎉 ALL TESTS PASSED! Your Supabase setup is working correctly.', 
            'color: green; font-weight: bold; font-size: 14px;');
    } else if (passPercentage >= 75) {
        console.log('%c⚠️  MOST TESTS PASSED. Some features may have issues.', 
            'color: orange; font-weight: bold; font-size: 14px;');
    } else {
        console.log('%c❌ MULTIPLE TESTS FAILED. Please review the errors above.', 
            'color: red; font-weight: bold; font-size: 14px;');
    }
    
    // ================================================================
    // TROUBLESHOOTING GUIDE
    // ================================================================
    
    logSection('TROUBLESHOOTING');
    
    const failedTests = testResults.filter(t => !t.status);
    
    if (failedTests.length > 0) {
        console.log('\nIssues found:\n');
        failedTests.forEach((test, index) => {
            console.log(`${index + 1}. ${test.name}`);
            if (test.message) {
                console.log(`   Error: ${test.message}`);
            }
        });
        
        console.log('\n📝 Common solutions:\n');
        console.log('• Supabase library not loaded → Check script defer attribute');
        console.log('• sbClient not initialized → Check main.js for initialization errors');
        console.log('• Table not accessible → Check RLS policies in Supabase dashboard');
        console.log('• Storage error → Ensure buckets exist and RLS policies allow access');
        console.log('• No active session → This is OK for public pages. Login to test auth.');
    } else {
        console.log('\n✓ Everything looks good! No issues detected.');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Test completed at:', new Date().toLocaleString());
    console.log('='.repeat(60) + '\n');
    
})();