// Delete post and media (if in user's folder)
async function deletePostSupabase(postId, mediaUrl) {
    try {
        if (!sbClient) {
            alert('Could not delete post: System not initialized.');
            return false;
        }
        
        debugLog('Attempting to delete post:', postId);
        
        // Delete DB row (RLS ensures ownership)
        const { error } = await sbClient.from('posts').delete().eq('id', postId);
        if (error) {
            debugError('Database delete error:', error);
            if (error.message.includes('not found') || error.message.includes('no rows')) {
                alert('Post not found or already deleted.');
            } else if (error.message.includes('permission') || error.message.includes('not authorized')) {
                alert('You do not have permission to delete this post.');
            } else {
                alert(`Could not delete post: ${error.message}`);
            }
            return false;
        }
        
        // Optionally delete media if hosted in our bucket and path contains user id folder
        if (mediaUrl && mediaUrl.includes('/storage/v1/object/public/community-media/')) {
            try {
                const key = mediaUrl.split('/community-media/')[1];
                if (key) {
                    debugLog('Deleting media file:', key);
                    const { error: delError } = await sbClient.storage.from('community-media').remove([key]);
                    if (delError) {
                        debugError('Media delete error (non-critical):', delError);
                        // Don't alert - DB row was deleted successfully, media is just a bonus cleanup
                    } else {
                        debugLog('Media file deleted successfully');
                    }
                }
            } catch (mediaErr) {
                debugError('Error deleting media file:', mediaErr);
                // Non-critical - post was already deleted from DB
            }
        }
        
        debugLog('Post deleted successfully');
        return true;
    } catch (e) {
        debugError('Delete failed with exception:', e);
        alert(`Could not delete post: ${e.message || 'Unknown error'}`);
        return false;
    }
}

// Particle animation for hero section
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return; // Exit if element doesn't exist
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 10 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Add CSS animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float-particle {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
        }
        25% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2);
            opacity: 0.6;
        }
        50% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8);
            opacity: 0.4;
        }
        75% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1);
            opacity: 0.7;
        }
    }
`;
document.head.appendChild(style);

// Debug mode - disable in production
const DEBUG = true; // Set to true only during development
const debugLog = (...args) => { if (DEBUG) console.log(...args); };
const debugError = (...args) => { if (DEBUG) console.error(...args); };

// Bulletin Board Functionality
// Bulletin Board functionality
// Supabase client setup
const SUPABASE_URL = 'https://tzitghqmrmsxddysxhvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXRnaHFtcm1zeGRkeXN4aHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDAzMjMsImV4cCI6MjA3NzUxNjMyM30.f5rZPAdCOHe6ZXr_TYgmhUkZkcWsSYX_qMLXUgg9dZ8';
let sbClient = null;

// Initialize Supabase with error handling - with retries
async function initializeSupabase() {
    console.log('Initializing Supabase...');
    console.log('SUPABASE_URL:', SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY exists?', !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 0);
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('✗ Supabase credentials not available');
        return false;
    }
    
    // Try up to 10 times with 200ms delay between attempts (total: 2 seconds)
    for (let attempt = 1; attempt <= 10; attempt++) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            try {
                sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✓ Supabase client initialized successfully on attempt', attempt);
                return true;
            } catch (error) {
                console.error(`✗ Supabase initialization error on attempt ${attempt}:`, error);
                return false;
            }
        }
        
        if (attempt < 10) {
            console.log(`⚠ Waiting for Supabase library (attempt ${attempt}/10)...`);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.error('✗ Supabase library failed to load after 10 attempts');
    return false;
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded: Starting initialization...');
    
    // Initialize Supabase
    const supabaseReady = await initializeSupabase();
    
    if (supabaseReady) {
        initAuth();
    } else {
        console.warn('⚠ Supabase not available, some features may not work');
    }
    
    // Initialize particles
    createParticles();
    
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') ? 'rotate(-45deg) translate(7px, -6px)' : 'none';
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                
                // Reset hamburger icon
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }
    
    // Dropdown toggle for mobile
    document.querySelectorAll('.dropdown > .nav-link').forEach(dropdownToggle => {
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = dropdownToggle.parentElement;
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});

async function initAuth() {
    if (!sbClient) {
        console.error('✗ Cannot initialize auth: sbClient is null');
        return;
    }
    
    try {
        const { data } = await sbClient.auth.getSession();
        debugLog('=== INITIAL SESSION CHECK ===');
        debugLog('Session exists:', !!data.session);
        debugLog('User:', data.session?.user?.email || 'Not signed in');
        debugLog('============================');
        
        updateAuthUI(data.session?.user || null);
        
        sbClient.auth.onAuthStateChange((event, session) => {
            debugLog('=== AUTH STATE CHANGED ===');
            debugLog('Event:', event);
            debugLog('Session exists:', !!session);
            debugLog('User:', session?.user?.email || 'Not signed in');
            debugLog('========================');
            
            updateAuthUI(session?.user || null);
            if (document.getElementById('bulletinPosts')) {
                renderPostsFromSupabase();
            }
        });
    } catch (error) {
        console.error('✗ Auth initialization error:', error);
    }
}

function updateAuthUI(user) {
    const signedOut = document.getElementById('authSignedOut');
    const signedIn = document.getElementById('authSignedIn');
    const emailEl = document.getElementById('authUserEmail');
    if (!signedOut || !signedIn) return;
    
    debugLog('>>> Updating UI for user:', user?.email || 'No user');
    
    if (user) {
        signedOut.style.display = 'none';
        signedIn.style.display = 'flex';
        if (emailEl) emailEl.textContent = user.email || 'Signed in';
        debugLog('>>> UI updated: Sign-in controls HIDDEN, user controls VISIBLE');
    } else {
        signedOut.style.display = '';
        signedIn.style.display = 'none';
        debugLog('>>> UI updated: Sign-in controls VISIBLE, user controls HIDDEN');
    }
}

function showSignInModal() {
    let modal = document.getElementById('signInModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'signInModal';
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <button class="modal-close" onclick="closeSignInModal()">&times;</button>
                <div style="padding: 1.5rem;">
                    <h2 style="color: #a8e6a1; margin-bottom: 0.5rem; text-align: center;">Sign In</h2>
                    <p style="color: #e2e8f0; margin-bottom: 1.5rem; text-align: center; font-size: 0.95rem;">Enter your email and password</p>
                    
                    <div style="margin-bottom: 1rem;">
                        <input type="email" id="modalAuthEmail" placeholder="Email address" 
                            style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 2px solid #e2e8f0; background: white; font-size: 1rem; margin-bottom: 0.75rem;">
                        <input type="password" id="modalAuthPassword" placeholder="Password (min 6 characters)" 
                            style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 2px solid #e2e8f0; background: white; font-size: 1rem; margin-bottom: 0.75rem;">
                        <button class="btn btn-primary" onclick="signInWithPassword()" style="width: 100%; font-size: 1rem; padding: 0.85rem;">
                            Continue
                        </button>
                        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.75rem; text-align: center;">
                            New? We'll create your account automatically
                        </p>
                    </div>
                    
                    <div style="background: #1e293b; padding: 1rem; border-radius: 8px; border-left: 3px solid #fbbf24;">
                        <p style="color: #fbbf24; font-size: 0.85rem; margin: 0; font-weight: 600;">⚠️ Having trouble signing in?</p>
                        <p style="color: #cbd5e0; font-size: 0.8rem; margin: 0.5rem 0 0 0;">If you get an error, try using a different email or create a new account with a fresh password.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSignInModal();
        });
        
        // Add enter key support for password field
        modal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const emailFocused = document.activeElement?.id === 'modalAuthEmail';
                const passwordFocused = document.activeElement?.id === 'modalAuthPassword';
                if (emailFocused || passwordFocused) {
                    signInWithPassword();
                }
            }
        });
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.getElementById('modalAuthEmail')?.focus();
    }, 100);
}

function closeSignInModal() {
    const modal = document.getElementById('signInModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.showSignInModal = showSignInModal;
window.closeSignInModal = closeSignInModal;

async function signInWithPassword() {
    if (!sbClient) {
        alert('Authentication not initialized');
        return;
    }
    
    const emailInput = document.getElementById('modalAuthEmail');
    const passwordInput = document.getElementById('modalAuthPassword');
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;
    
    if (!email) {
        alert('Please enter your email');
        emailInput?.focus();
        return;
    }
    
    if (!password) {
        alert('Please enter a password');
        passwordInput?.focus();
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        passwordInput?.focus();
        return;
    }
    
    // Get the button from the modal
    const btn = document.querySelector('#signInModal .btn-primary');
    const originalText = btn?.textContent;
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Please wait...';
    }
    
    try {
        // First, try to sign in with existing credentials
        const { data: signInData, error: signInError } = await sbClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (signInError) {
            debugError('Sign in error:', signInError);
            
            // Handle email not confirmed - simplest solution is to use different email
            if (signInError.message.toLowerCase().includes('email not confirmed')) {
                alert('This email address needs confirmation.\n\nEasiest solution: Sign up with a different email address instead.\n\nOr check your inbox for the original confirmation email from Supabase.');
                closeSignInModal();
                // Clear the fields so they can try with a different email
                if (emailInput) emailInput.value = '';
                if (passwordInput) passwordInput.value = '';
                // Show modal again for retry
                setTimeout(() => showSignInModal(), 500);
                return;
            }
            // Only create new account if the error is specifically about invalid credentials
            // NOT if it's about unconfirmed email or other issues
            else if (signInError.message.toLowerCase().includes('invalid') && 
                signInError.message.toLowerCase().includes('credentials')) {
                
                // Try to sign up as a new user
                debugLog('Attempting to create new account...');
                const { data: signUpData, error: signUpError } = await sbClient.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.href,
                        data: {
                            email: email
                        }
                    }
                });
                
                if (signUpError) {
                    debugError('Sign up error:', signUpError);
                    throw signUpError;
                }
                
                debugLog('Sign up response:', signUpData);
                
                // Check if we got a session (auto-confirmed)
                if (signUpData?.session) {
                    alert('✓ Welcome! Your account has been created and you\'re now signed in.');
                    closeSignInModal();
                    // Session is automatically set by Supabase
                    debugLog('New account created with session');
                } else if (signUpData?.user) {
                    alert('✓ Account created! Please check your email to confirm your account, then sign in again.');
                    closeSignInModal();
                } else {
                    throw new Error('Account creation did not return expected data');
                }
            } else {
                // Some other error - show it to the user
                throw signInError;
            }
        } else if (signInData?.session) {
            // Successful sign in with existing account
            debugLog('Sign in successful:', signInData);
            alert('✓ Welcome back! You\'re now signed in.');
            closeSignInModal();
            // Session is automatically set by Supabase
        } else {
            throw new Error('Sign in did not return a session');
        }
        
        // Wait a moment for the auth state to propagate, then refresh UI
        setTimeout(() => {
            debugLog('Refreshing UI after auth...');
            sbClient.auth.getSession().then(({ data }) => {
                debugLog('Current session after sign in:', data.session);
                updateAuthUI(data.session?.user || null);
            });
        }, 500);
        
    } catch (e) {
        debugError('Authentication error:', e);
        alert(`Error: ${e.message || 'Authentication failed. Please try again.'}`);
    } finally {
        // Re-enable button
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText || 'Continue';
        }
    }
}

window.signInWithPassword = signInWithPassword;

async function oauthSignIn(provider) {
    try {
        if (!sbClient) return;
        const { error } = await sbClient.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.href }
        });
        if (error) throw error;
        // Modal will close when auth state changes
        closeSignInModal();
    } catch (e) {
        debugError('OAuth sign-in error:', e);
        alert('OAuth sign-in failed.');
    }
}

async function signOut() {
    try {
        await sbClient?.auth.signOut();
        debugLog('User signed out');
    } catch (e) {
        debugError('Sign out error:', e);
    }
}
let currentMedia = null;
let currentMediaType = null;

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate MIME type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validImageTypes.includes(file.type)) {
        alert(`Invalid image format: ${file.type}\n\nSupported formats: JPEG, PNG, GIF, WebP, SVG`);
        event.target.value = '';
        return;
    }
    
    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        alert(`Image is too large: ${sizeMB}MB\n\nPlease use an image smaller than ${maxMB}MB.\n\nTip: Use https://tinypng.com to compress.`);
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onerror = () => {
        debugError('Failed to read image file');
        alert('Failed to read image file. Please try again.');
        event.target.value = '';
    };
    reader.onload = function(e) {
        currentMedia = e.target.result;
        currentMediaType = 'image';
        debugLog(`Image loaded: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
        showMediaPreview();
    };
    reader.readAsDataURL(file);
}

async function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate MIME type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validVideoTypes.includes(file.type)) {
        alert(`Invalid video format: ${file.type}\n\nSupported formats: MP4, WebM, QuickTime, AVI`);
        event.target.value = '';
        return;
    }
    
    // Check file size (limit to 50MB for videos)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        alert(`Video is too large: ${sizeMB}MB\n\nPlease use a video smaller than ${maxMB}MB.\n\nTip: Consider uploading a shorter clip or using a compression tool.`);
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onerror = () => {
        debugError('Failed to read video file');
        alert('Failed to read video file. Please try again.');
        event.target.value = '';
    };
    reader.onload = function(e) {
        currentMedia = e.target.result;
        currentMediaType = 'video';
        debugLog(`Video loaded: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        showMediaPreview();
    };
    reader.readAsDataURL(file);
}

function addLink() {
    const url = prompt('Enter the URL:');
    if (url && url.trim() !== '') {
        currentMedia = url.trim();
        currentMediaType = 'link';
        showMediaPreview();
    }
}

function showMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    let previewHTML = '';
    
    if (currentMediaType === 'image') {
        previewHTML = `
            <div class="post-media">
                <img src="${currentMedia}" alt="Preview">
                <button onclick="clearMedia()" style="margin-top: 0.5rem;" class="media-btn">✕ Remove</button>
            </div>
        `;
    } else if (currentMediaType === 'video') {
        previewHTML = `
            <div class="post-media">
                <video controls src="${currentMedia}"></video>
                <button onclick="clearMedia()" style="margin-top: 0.5rem;" class="media-btn">✕ Remove</button>
            </div>
        `;
    } else if (currentMediaType === 'link') {
        previewHTML = `
            <div class="post-media">
                <a href="${currentMedia}" target="_blank" rel="noopener">🔗 ${currentMedia}</a>
                <button onclick="clearMedia()" style="margin-top: 0.5rem;" class="media-btn">✕ Remove</button>
            </div>
        `;
    }
    
    preview.innerHTML = previewHTML;
}

function clearMedia() {
    currentMedia = null;
    currentMediaType = null;
    document.getElementById('mediaPreview').innerHTML = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('videoUpload').value = '';
}

let lastPostAt = 0;
let isSubmittingPost = false;
async function addPost() {
    const textArea = document.getElementById('bulletinText');
    const postsContainer = document.getElementById('bulletinPosts');
    const postText = textArea.value.trim();
    
    if (postText === '' && !currentMedia) {
        alert('Please write something or add media before posting!');
        return;
    }

    if (postText.length > 1000) {
        alert('Post too long (max 1000 characters).');
        return;
    }

    // Check if user is authenticated when posting media
    if (currentMedia && sbClient) {
        const { data: sessionData } = await sbClient.auth.getSession();
        debugLog('Session check before posting:', sessionData);
        if (!sessionData?.session?.user) {
            // User not signed in - offer choice
            const choice = confirm('💡 Sign up to save your uploads forever!\n\nWithout signing up, your post will only be visible in your browser.\n\nClick OK to sign up now, or Cancel to post without saving.');
            if (choice) {
                showSignInModal();
                if (postBtn) {
                    postBtn.disabled = false;
                    postBtn.textContent = 'Post';
                }
                isSubmittingPost = false;
                return;
            } else {
                // User chose to post without signing up - will use localStorage
                debugLog('User chose to post without signing up');
            }
        } else {
            debugLog('User is authenticated, media will be uploaded to cloud');
        }
    }

    const nowTs = Date.now();
    if (nowTs - lastPostAt < 10000) {
        alert('You are posting too fast. Please wait a few seconds.');
        return;
    }

    if (isSubmittingPost) return;
    isSubmittingPost = true;
    const postBtn = document.querySelector('.post-form .btn.btn-primary');
    if (postBtn) {
        postBtn.disabled = true;
        postBtn.textContent = 'Posting...';
    }
    
    const post = document.createElement('div');
    post.className = 'bulletin-post';
    post.style.animation = 'fadeInUp 0.5s ease';
    
    const now = new Date();
    const timeString = 'Just now';
    
    let mediaHTML = '';
    let thumbnailHTML = '';
    let uploadedUrl = null;
    
    if (currentMedia && currentMediaType === 'image') {
        debugLog('Adding image to post:', currentMedia.substring(0, 50));
        // Upload to Supabase Storage if possible
        uploadedUrl = await tryUploadToSupabase(currentMedia, 'image');
        const url = uploadedUrl || currentMedia;
        // Add error handler for images that fail to load
        mediaHTML = `<img src="${url}" alt="Post image" onerror="this.style.display='none'; this.parentElement.querySelector('.media-error')?.style.display='block';">
                      <div class="media-error" style="display:none; padding:1rem; background:#fee; text-align:center; color:#c00;">⚠️ Image failed to load</div>`;
        thumbnailHTML = `<img src="${url}" alt="Post thumbnail" class="post-thumbnail" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23eee%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImage not available%3C/text%3E%3C/svg%3E'">`;
    } else if (currentMedia && currentMediaType === 'video') {
        debugLog('Adding video to post');
        uploadedUrl = await tryUploadToSupabase(currentMedia, 'video');
        const url = uploadedUrl || currentMedia;
        // Add error handler for videos that fail to load
        mediaHTML = `<video controls src="${url}" onerror="this.style.display='none'; this.parentElement.querySelector('.media-error')?.style.display='block';"></video>
                      <div class="media-error" style="display:none; padding:1rem; background:#fee; text-align:center; color:#c00;">⚠️ Video failed to load</div>`;
        thumbnailHTML = `<video src="${url}" class="post-thumbnail" muted onerror="this.style.display='none';"></video>`;
    } else if (currentMedia && currentMediaType === 'link') {
        debugLog('Adding link to post:', currentMedia);
        // Validate URL format
        let displayUrl = currentMedia;
        try {
            const urlObj = new URL(currentMedia);
            displayUrl = urlObj.hostname || currentMedia;
        } catch (e) {
            debugLog('Invalid URL format:', currentMedia);
        }
        mediaHTML = `<a href="${currentMedia}" target="_blank" rel="noopener noreferrer">🔗 ${displayUrl}</a>`;
        thumbnailHTML = `<div class="post-text-preview">🔗 Link</div>`;
    }
    
    // If no media, show text preview in thumbnail
    if (!thumbnailHTML && postText) {
        const preview = postText.length > 50 ? postText.substring(0, 50) + '...' : postText;
        thumbnailHTML = `<div class="post-text-preview">${preview}</div>`;
    }
    
    // Store full content in data attributes
    post.setAttribute('data-text', postText);
    post.setAttribute('data-media', mediaHTML);
    const { data: sessionData } = sbClient ? await sbClient.auth.getSession() : { data: null };
    const userId = sessionData?.session?.user?.id || 'User';
    post.setAttribute('data-user-id', userId);
    post.setAttribute('data-time', timeString);
    
    post.innerHTML = `
        ${thumbnailHTML}
        <div class="post-author-badge">Member</div>
    `;
    
    // Add click handler to open modal
    post.addEventListener('click', () => openPostModal(post));
    
    // Remove one empty placeholder if exists
    const emptyPost = postsContainer.querySelector('.empty-post');
    if (emptyPost) {
        emptyPost.remove();
    }
    
    // Insert new post at the beginning (optimistic UI)
    postsContainer.insertBefore(post, postsContainer.firstChild);
    updatePostCounter();
    textArea.value = '';

    // Persist to Supabase (works for authenticated AND anonymous users)
    let persisted = false;
    const mediaTypeToSave = currentMediaType;
    persisted = await savePostSupabase({
        text: postText,
        mediaType: mediaTypeToSave,
        media: uploadedUrl || currentMedia
    });
    
    // Clear media AFTER saving
    clearMedia();
    
    // If Supabase save failed, save to localStorage as fallback
    if (!persisted) {
        debugLog('Saving post locally (Supabase save failed)');
        savePostLocal({ 
            text: postText, 
            mediaType: mediaTypeToSave, 
            media: uploadedUrl || currentMedia 
        });
    }
    lastPostAt = nowTs;

    // Re-render from Supabase to avoid duplicates and ensure canonical view
    await renderPostsFromSupabase();
    
    // Refresh gallery if new image post was added
    if (mediaTypeToSave === 'image' && persisted) {
        debugLog('Refreshing gallery with new image');
        await loadGalleryFromSupabase();
    }

    if (postBtn) {
        postBtn.disabled = false;
        postBtn.textContent = 'Post';
    }
    isSubmittingPost = false;
}

// Update post counter
function updatePostCounter() {
    const postsContainer = document.getElementById('bulletinPosts');
    if (!postsContainer) return;
    
    const totalPosts = postsContainer.querySelectorAll('.bulletin-post:not(.empty-post)').length;
    const galleryTitle = document.querySelector('.gallery-title');
    if (galleryTitle) {
        galleryTitle.textContent = `📸 Latest Community Posts (${totalPosts}/50)`;
    }
}

// Persistence helpers
function getSavedPosts() {
    try {
        return JSON.parse(localStorage.getItem('lvrobotics_posts') || '[]');
    } catch {
        return [];
    }
}

function savePostLocal(newPost) {
    const posts = getSavedPosts();
    const now = new Date();
    const postWithMeta = {
        text: newPost.text || '',
        mediaType: newPost.mediaType || null,
        media: newPost.media || null,
        user_id: 'You',
        time: 'Just now',
        createdAt: now.toISOString()
    };
    posts.unshift(postWithMeta);
    localStorage.setItem('lvrobotics_posts', JSON.stringify(posts.slice(0, 50)));
}

function renderSavedPosts() {
    const postsContainer = document.getElementById('bulletinPosts');
    if (!postsContainer) return;

    const saved = getSavedPosts();
    if (!saved.length) return;

    // Clear existing non-empty posts but keep empty placeholders for later removal as we fill
    postsContainer.querySelectorAll('.bulletin-post:not(.empty-post)').forEach(el => el.remove());

    saved.forEach(p => {
        const post = document.createElement('div');
        post.className = 'bulletin-post';
        post.style.animation = 'fadeInUp 0.5s ease';

        let mediaHTML = '';
        let thumbnailHTML = '';

        if (p.media && p.mediaType === 'image') {
            mediaHTML = `<img src="${p.media}" alt="Post image">`;
            thumbnailHTML = `<img src="${p.media}" alt="Post thumbnail" class="post-thumbnail">`;
        } else if (p.media && p.mediaType === 'video') {
            mediaHTML = `<video controls src="${p.media}"></video>`;
            thumbnailHTML = `<video src="${p.media}" class="post-thumbnail" muted></video>`;
        } else if (p.media && p.mediaType === 'link') {
            mediaHTML = `<a href="${p.media}" target="_blank" rel="noopener">🔗 ${p.media}</a>`;
            thumbnailHTML = `<div class="post-text-preview">🔗 Link</div>`;
        }

        if (!thumbnailHTML && p.text) {
            const preview = p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text;
            thumbnailHTML = `<div class="post-text-preview">${preview}</div>`;
        }

        post.setAttribute('data-text', p.text || '');
        post.setAttribute('data-media', mediaHTML);
        post.setAttribute('data-user-id', p.user_id || 'User');
        post.setAttribute('data-time', p.time || '');

        post.innerHTML = `
            ${thumbnailHTML}
            <div class="post-author-badge">Member</div>
        `;

        post.addEventListener('click', () => openPostModal(post));

        const emptyPost = postsContainer.querySelector('.empty-post');
        if (emptyPost) emptyPost.remove();

        postsContainer.appendChild(post);
    });

    updatePostCounter();
}

// Try upload to Supabase Storage from a data URL
async function tryUploadToSupabase(dataUrl, kind) {
    try {
        if (!sbClient || !dataUrl.startsWith('data:')) {
            debugError('Supabase client not available or invalid data URL');
            return null;
        }
        
        // Get user ID if authenticated, otherwise use "anonymous"
        const { data: sessionData } = await sbClient.auth.getSession();
        const userId = sessionData?.session?.user?.id || 'anonymous';
        
        // Safely parse base64 data URL
        const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
        if (!mimeMatch) {
            debugError('Invalid base64 data URL format');
            return null;
        }
        const mime = mimeMatch[1];
        const base64String = dataUrl.split(',')[1];
        
        // Validate base64 string exists and is not empty
        if (!base64String || base64String.length === 0) {
            debugError('Empty base64 data in file');
            alert('Error processing media file. Please try again.');
            return null;
        }
        
        // Estimate binary size from base64 (base64 is ~33% larger than binary)
        // If base64 is suspiciously large, check file size
        const estimatedSize = (base64String.length * 3) / 4;
        const maxBytes = kind === 'image' ? (10 * 1024 * 1024) : (50 * 1024 * 1024);
        if (estimatedSize > maxBytes) {
            const sizeMB = (estimatedSize / (1024 * 1024)).toFixed(2);
            const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
            alert(`Processed file is too large: ${sizeMB}MB\n\nPlease use a file smaller than ${maxMB}MB.`);
            return null;
        }
        
        const ext = mime.split('/')[1] || (kind === 'image' ? 'png' : 'mp4');
        const fileName = `${userId}/post_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        
        // Convert base64 to binary with error handling
        let bin, buf;
        try {
            bin = atob(base64String);
            buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        } catch (decodeError) {
            debugError('Failed to decode base64 data:', decodeError);
            alert('Error processing media file (corrupted or invalid format). Please try uploading again.');
            return null;
        }
        
        const file = new File([buf], fileName, { type: mime });
        
        debugLog(`Attempting to upload to community-media bucket... (${(file.size / (1024 * 1024)).toFixed(2)}MB)`, fileName);
        const { error } = await sbClient.storage.from('community-media').upload(fileName, file, { upsert: false });
        
        if (error) {
            debugError('Supabase upload error:', error);
            
            // Network connectivity issues
            if (error.message.includes('net') || error.message.includes('connection') || error.message.includes('timeout')) {
                alert('Network error: Could not connect to server.\n\nThe photo/video will be saved temporarily in your browser.\n\nPlease check your internet connection and try again.');
                return dataUrl; // Return the data URL to save locally as fallback
            }
            
            // If bucket doesn't exist, explain the issue
            if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
                alert('Storage bucket not set up yet.\n\nThe photo/video will be saved temporarily in your browser.\n\nTo enable permanent cloud storage, please create the "community-media" bucket in your Supabase dashboard.');
                // Save locally as fallback
                return dataUrl; // Return the data URL to save locally
            }
            
            // Permission denied or other upload errors
            if (error.message.includes('permissions') || error.message.includes('not authorized')) {
                alert('Permission denied: You do not have permission to upload.\n\nPlease make sure you are signed in and try again.');
                return null;
            }
            
            // File too large on server side
            if (error.message.includes('413') || error.message.includes('too large') || error.message.includes('payload')) {
                alert(`Upload failed: File is too large.\n\nError: ${error.message}`);
                return null;
            }
            
            // Rate limiting or server errors
            if (error.message.includes('429') || error.message.includes('rate') || error.message.includes('5')) {
                alert('Server busy: Please wait a moment and try again.');
                return null;
            }
            
            debugError('Detailed error:', { message: error.message, status: error.status, statusText: error.statusText });
            alert(`Upload failed: ${error.message || 'Unknown error occurred'}`);
            return null;
        }
        
        try {
            const { data } = sbClient.storage.from('community-media').getPublicUrl(fileName);
            debugLog('Successfully uploaded to Supabase:', data.publicUrl);
            return data.publicUrl;
        } catch (urlError) {
            debugError('Failed to get public URL:', urlError);
            alert('Upload completed but could not generate public URL. Please try again.');
            return null;
        }
    } catch (e) {
        debugError('Upload failed with exception:', e);
        const errorMsg = e.message || 'Unknown error';
        
        // Check for specific error types
        if (e.name === 'TypeError' && errorMsg.includes('network')) {
            alert('Network error: Could not connect to upload server.\n\nPlease check your internet connection.');
            return dataUrl;
        }
        
        alert(`Failed to upload media: ${errorMsg}\n\nThe file will be saved temporarily in your browser.`);
        return dataUrl; // Return data URL as fallback
    }
}

// Save post to Supabase table
async function savePostSupabase(post) {
    try {
        debugLog('💾 Attempting to save post to database:', post);
        if (!sbClient) {
            debugError('❌ Supabase client not initialized');
            return false;
        }
        const { data: sessionData } = await sbClient.auth.getSession();
        const userId = sessionData?.session?.user?.id || null;
        debugLog('👤 User ID:', userId || 'anonymous');
        const insertData = {
            text: post.text || '',  // Always send text, empty string if null
            media_url: post.media || null,
            media_type: post.mediaType || null,
            user_id: userId
        };
        debugLog('📤 Inserting data:', insertData);
        const { data, error } = await sbClient.from('posts').insert(insertData);
        if (error) {
            debugError('❌ Supabase insert error:', error);
            debugError('❌ Error details:', JSON.stringify(error));
            alert(`Failed to save post: ${error.message || 'Unknown error'}\n\nPlease try again or contact support.`);
            return false;
        }
        debugLog('✅ Post saved successfully!', data);
        return true;
    } catch (e) {
        debugError('❌ savePostSupabase failed:', e);
        return false;
    }
}

// Load posts from Supabase, fallback to local
async function renderPostsFromSupabase() {
    const postsContainer = document.getElementById('bulletinPosts');
    if (!postsContainer) {
        debugLog('❌ No bulletinPosts container found');
        return;
    }
    
    debugLog('📋 Loading posts from database...');
    
    try {
        if (!sbClient) {
            debugLog('⚠️ Supabase client not available, using local storage');
            renderSavedPosts();
            return;
        }
        
        debugLog('🔍 Fetching posts from Supabase...');
        const { data, error } = await sbClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        debugLog('📦 Query result:', { data, error });
        
        if (error) {
            debugError('Database error:', error);
            // If table doesn't exist (404) or other DB error, use local storage
            if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('404')) {
                debugLog('Posts table not found or not accessible, using local storage');
            }
            renderSavedPosts();
            return;
        }

        // Clear current non-empty posts
        postsContainer.querySelectorAll('.bulletin-post:not(.empty-post)').forEach(el => el.remove());

        const { data: sessionData } = await sbClient.auth.getSession();
        const currentUserId = sessionData?.session?.user?.id;

        // Deduplicate by (user_id, media_url or text), keeping latest due to sort
        const seenKeys = new Set();
        const unique = [];
        (data || []).forEach(p => {
            const key = `${p.user_id || ''}|${p.media_url || p.text || ''}`;
            if (seenKeys.has(key)) return;
            seenKeys.add(key);
            unique.push(p);
        });

        unique.forEach(p => {
            debugLog('Rendering post:', p); // Debug: see the post data
            const post = document.createElement('div');
            post.className = 'bulletin-post';
            post.style.animation = 'fadeInUp 0.5s ease';
            post.dataset.postId = p.id;
            post.dataset.userId = p.user_id || '';
            let mediaHTML = '';
            let thumbnailHTML = '';
            
            // Helper function to convert photo IDs to full Unsplash URLs
            const getImageUrl = (url) => {
                if (!url) return url;
                if (url.startsWith('http')) return url;
                if (url.startsWith('/')) return url; // Support local/relative paths
                // If it doesn't start with http or /, assume it's an Unsplash photo ID
                return `https://images.unsplash.com/photo-${url}?w=800&q=80`;
            };
            
            if (p.media_url && p.media_type === 'image') {
                const imageUrl = getImageUrl(p.media_url);
                // Add error handler for images that fail to load
                mediaHTML = `<img src="${imageUrl}" alt="Post image" onerror="this.style.display='none'; this.parentElement.querySelector('.media-error')?.style.display='block';">
                              <div class="media-error" style="display:none; padding:1rem; background:#fee; text-align:center; color:#c00;">⚠️ Image failed to load</div>`;
                thumbnailHTML = `<img src="${imageUrl}" alt="Post thumbnail" class="post-thumbnail" style="background: #f0f0f0;" onerror="this.style.background='#e0e0e0'; this.style.opacity='0.5'; console.log('Image failed:', this.src);">`;
                debugLog('Image post - URL:', imageUrl); // Debug
            } else if (p.media_url && p.media_type === 'video') {
                // Add error handler for videos that fail to load
                mediaHTML = `<video controls src="${p.media_url}" onerror="this.style.display='none'; this.parentElement.querySelector('.media-error')?.style.display='block';"></video>
                              <div class="media-error" style="display:none; padding:1rem; background:#fee; text-align:center; color:#c00;">⚠️ Video failed to load</div>`;
                thumbnailHTML = `<video src="${p.media_url}" class="post-thumbnail" muted onerror="this.style.display='none';"></video>`;
            } else if (p.media_url && p.media_type === 'link') {
                // Validate and display URL
                let displayUrl = p.media_url;
                try {
                    const urlObj = new URL(p.media_url);
                    displayUrl = urlObj.hostname || p.media_url;
                } catch (e) {
                    debugLog('Invalid URL format:', p.media_url);
                }
                mediaHTML = `<a href="${p.media_url}" target="_blank" rel="noopener noreferrer">🔗 ${displayUrl}</a>`;
                thumbnailHTML = `<div class="post-text-preview">🔗 Link</div>`;
            }
            if (!thumbnailHTML && p.text) {
                const preview = p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text;
                thumbnailHTML = `<div class="post-text-preview">${preview}</div>`;
            }
            debugLog('MediaHTML:', mediaHTML); // Debug: see what media HTML is created
            post.setAttribute('data-text', p.text || '');
            post.setAttribute('data-media', mediaHTML);
            post.setAttribute('data-user-id', p.user_id || 'User');
            post.setAttribute('data-time', new Date(p.created_at).toLocaleString());
            const canDelete = currentUserId && p.user_id === currentUserId;
            post.innerHTML = `
                ${thumbnailHTML}
                <div class="post-author-badge">Member${canDelete ? ' · <button class="media-btn" data-delete="1">Delete</button>' : ''}</div>
            `;
            
            // Add click handler to open modal (but not for delete button)
            post.addEventListener('click', (e) => {
                // Don't open modal if clicking delete button
                if (e.target.closest('[data-delete="1"]')) return;
                openPostModal(post);
            });
            
            if (canDelete) {
                const delBtn = post.querySelector('button[data-delete="1"]');
                delBtn?.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await deletePostSupabase(p.id, p.media_url);
                    post.remove();
                    updatePostCounter();
                });
            }
            const emptyPost = postsContainer.querySelector('.empty-post');
            if (emptyPost) emptyPost.remove();
            postsContainer.appendChild(post);
        });
        updatePostCounter();
    } catch (e) {
        debugError('Fetch posts failed:', e);
        renderSavedPosts();
    }
}

// Render posts on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bulletinPosts')) {
        renderPostsFromSupabase();
    }
});

// Open post in modal
function openPostModal(postElement) {
    debugLog('Opening modal for post:', postElement);
    const text = postElement.getAttribute('data-text');
    const media = postElement.getAttribute('data-media');
    const author = postElement.getAttribute('data-user-id');
    const time = postElement.getAttribute('data-time');
    
    debugLog('Post data:', { text, media, author, time });
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('postModal');
    if (!modal) {
        debugLog('Creating new modal');
        modal = document.createElement('div');
        modal.id = 'postModal';
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closePostModal()">&times;</button>
                <div class="modal-header">
                    <span class="modal-author"></span>
                    <span class="modal-time"></span>
                </div>
                <div class="modal-media"></div>
                <div class="modal-text"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePostModal();
        });
    }
    
    // Update modal content
    modal.querySelector('.modal-author').textContent = author;
    modal.querySelector('.modal-time').textContent = time;
    // Safely inject media content using innerHTML only for trusted HTML from our system
    const mediaDiv = modal.querySelector('.modal-media');
    mediaDiv.innerHTML = ''; // Clear first
    if (media) {
        // Media HTML is constructed by our code only from database URLs, so it's safe
        mediaDiv.innerHTML = media;
    }
    modal.querySelector('.modal-text').textContent = text || '';
    
    debugLog('Showing modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Make closePostModal available globally
window.closePostModal = closePostModal;

// Add enter key support for posting
document.getElementById('bulletinText')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        addPost();
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.photo-card, .event-card, .workshop-card, .competition-item, .founder-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Form submission handling
document.querySelector('.partner-form form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // In a real application, you would send this data to a server
    debugLog('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your interest! We will get back to you soon.');
    
    // Reset form
    e.target.reset();
});

// Add hover effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Logo animation on hover
const logo = document.getElementById('logo');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.animation = 'none';
        logo.style.transform = 'rotate(360deg) scale(1.1)';
    });
    
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'rotate(0deg) scale(1)';
        setTimeout(() => {
            logo.style.animation = 'float 3s ease-in-out infinite';
        }, 500);
    });
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '+';
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.classList.contains('animated')) {
                statNumber.classList.add('animated');
                const target = parseInt(statNumber.textContent);
                animateCounter(statNumber, target);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Add dynamic year to footer
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.textContent = `© ${currentYear} LV Robotics. All rights reserved.`;
}

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = 'none';
            alert('🤖 You found the secret robot code! 🤖');
        }, 2000);
    }
});

// Add rainbow animation
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Community Highlights - Load gallery images from Supabase
async function loadFallbackGallery() {
    // Show placeholder gallery with local images
    const container = document.getElementById('galleryContainer');
    const indicatorsContainer = document.getElementById('galleryIndicators');
    
    if (!container || !indicatorsContainer) return;
    
    debugLog('Loading fallback gallery with placeholder images...');
    
    const fallbackImages = [
        { src: 'images/Anybots.jpg', alt: 'Anybots - Community Robots' },
        { src: 'images/unitree_running.jpg', alt: 'Unitree Robot in Motion' },
        { src: 'images/Humanoid_bending.jpg', alt: 'Humanoid Robot Demo' },
        { src: 'images/Robot_Vegas.png', alt: 'Robot Vegas Project' },
        { src: 'images/humanoid.jpg', alt: 'Humanoid Showcase' },
    ];
    
    // CRITICAL: Clear loading message and reset container
    container.innerHTML = '';
    container.style.display = 'flex';
    // Force height calculation: aspect-ratio 16:9 based on width
    const width = container.offsetWidth;
    container.style.height = (width * 9 / 16) + 'px';
    indicatorsContainer.innerHTML = '';
    
    fallbackImages.forEach((imageData, index) => {
        const slide = document.createElement('a');
        slide.href = 'community.html';
        slide.className = 'gallery-slide';
        slide.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
        if (index === 0) slide.classList.add('active');
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;
        img.className = 'gallery-image';
        
        slide.appendChild(img);
        container.appendChild(slide);
        
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.dataset.slide = index;
        if (index === 0) indicator.classList.add('active');
        indicatorsContainer.appendChild(indicator);
    });
    
    initializeGalleryRotation();
    debugLog('Fallback gallery loaded with ' + fallbackImages.length + ' placeholder images');
}

async function loadGalleryFromSupabase() {
    const container = document.getElementById('galleryContainer');
    const indicatorsContainer = document.getElementById('galleryIndicators');
    
    if (!container || !indicatorsContainer) {
        debugLog('Gallery containers not found');
        return;
    }
    
    // Wait for Supabase to be ready (with timeout)
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max
    while (!sbClient && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!sbClient) {
        debugLog('Supabase client not initialized after timeout, showing fallback gallery');
        loadFallbackGallery();
        return;
    }
    
    try {
        debugLog('Fetching gallery images from Supabase...');
        
        // Fetch image posts, sorted by newest first, limit to 50
        const { data, error } = await sbClient
            .from('posts')
            .select('id, media_url, media_type, text, created_at')
            .eq('media_type', 'image')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            debugError('Error fetching gallery images:', error);
            loadFallbackGallery();
            return;
        }
        
        debugLog('Gallery query result:', { data, error });
        
        if (!data || data.length === 0) {
            debugLog('⚠️ No image posts found in Supabase, showing fallback');
            // Debug: fetch all posts to see what media_types exist
            const { data: allPosts } = await sbClient
                .from('posts')
                .select('id, media_url, media_type, text, created_at')
                .order('created_at', { ascending: false })
                .limit(10);
            debugLog('📊 All recent posts for debugging:', allPosts);
            debugLog('📊 Media types found:', allPosts?.map(p => p.media_type));
            loadFallbackGallery();
            return;
        }
        
        debugLog(`Found ${data.length} image posts for gallery`);
        
        // CRITICAL: Clear loading message and reset container
        container.innerHTML = '';
        container.style.display = 'flex';
        // Force height calculation: aspect-ratio 16:9 based on width
        const width = container.offsetWidth;
        container.style.height = (width * 9 / 16) + 'px';
        indicatorsContainer.innerHTML = '';
        
        debugLog('=== GALLERY DEBUG INFO ===');
        debugLog('Container dimensions:', {
            width: container.offsetWidth,
            height: container.offsetHeight,
            computed: window.getComputedStyle(container)
        });
        
        data.forEach((post, index) => {
            // Create slide
            const slide = document.createElement('a');
            slide.href = 'community.html';
            slide.className = 'gallery-slide';
            slide.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
            if (index === 0) slide.classList.add('active');
            
            const img = document.createElement('img');
            // Handle different URL formats
            let imageUrl = post.media_url;
            if (imageUrl) {
                if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    // Assume it's an Unsplash photo ID
                    imageUrl = `https://images.unsplash.com/photo-${imageUrl}?w=800&q=80`;
                }
                // If it starts with / or http, use as-is
            }
            img.src = imageUrl;
            img.alt = `Community Highlight ${index + 1}`;
            img.className = 'gallery-image';
            img.style.cssText = 'display: block; width: 100%; height: 100%; object-fit: cover;';
            
            // Add error handling with retry
            img.onerror = function() {
                debugError('Failed to load image:', imageUrl);
                // Try one more time with cache buster
                if (!this.dataset.retried) {
                    this.dataset.retried = true;
                    this.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'cache=' + Math.random();
                } else {
                    // Show placeholder with post text
                    this.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #94a3b8;
                        text-align: center;
                        padding: 2rem;
                        font-size: 0.9rem;
                    `;
                    placeholder.textContent = post.text || 'Community highlight';
                    slide.appendChild(placeholder);
                }
            };
            
            img.onload = function() {
                debugLog('Image loaded successfully:', imageUrl);
            };
            
            slide.appendChild(img);
            container.appendChild(slide);
            
            // Create indicator
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            indicator.dataset.slide = index;
            if (index === 0) indicator.classList.add('active');
            indicatorsContainer.appendChild(indicator);
        });
        
        // Initialize rotation with the new slides
        initializeGalleryRotation();
        debugLog('Gallery rotation initialized with ' + data.length + ' images');
        
    } catch (err) {
        debugError('Exception loading gallery:', err);
        loadFallbackGallery();
    }
}

// Community Highlights - Auto-rotating gallery
let galleryRotationInterval = null; // Store interval ID to prevent duplicates

function initializeGalleryRotation() {
    const slides = Array.from(document.querySelectorAll('.gallery-slide'));
    const indicators = Array.from(document.querySelectorAll('.indicator'));
    
    debugLog(`🎬 Gallery rotation START: Found ${slides.length} slides and ${indicators.length} indicators`);
    
    if (slides.length === 0) {
        debugError('🎬 Gallery rotation FAILED: No slides found!');
        return;
    }
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Set first slide as active
    debugLog('🎬 Removing active class from all slides...');
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    debugLog('🎬 Setting first slide to active');
    slides[0].classList.add('active');
    
    if (indicators.length > 0) {
        indicators.forEach(ind => ind.classList.remove('active'));
        indicators[0].classList.add('active');
    }
    
    // Verify first slide is now active
    const firstSlideActive = slides[0].classList.contains('active');
    const firstIndicatorActive = indicators.length > 0 ? indicators[0].classList.contains('active') : null;
    debugLog(`🎬 Verification: First slide active=${firstSlideActive}, First indicator active=${firstIndicatorActive}`);
    
    function showSlide(n) {
        debugLog(`🎬 ROTATE: Activating slide ${n}/${totalSlides}`);
        
        // Show which slide is becoming inactive
        const activeBeforeCount = slides.filter(s => s.classList.contains('active')).length;
        debugLog(`  - Slides with active class before: ${activeBeforeCount}`);
        
        // Remove active class from all slides
        slides.forEach((slide, idx) => {
            const hadActive = slide.classList.contains('active');
            slide.classList.remove('active');
            if (hadActive) debugLog(`  - Removed active from slide ${idx}`);
        });
        
        // Remove active class from all indicators
        indicators.forEach((indicator, idx) => {
            const hadActive = indicator.classList.contains('active');
            indicator.classList.remove('active');
            if (hadActive) debugLog(`  - Removed active from indicator ${idx}`);
        });
        
        // Add active class to current slide
        slides[n].classList.add('active');
        debugLog(`  - Added active to slide ${n}`);
        
        // Add active class to indicator
        if (indicators[n]) {
            indicators[n].classList.add('active');
            debugLog(`  - Added active to indicator ${n}`);
        }
        
        // Verify
        const activeAfterCount = slides.filter(s => s.classList.contains('active')).length;
        debugLog(`  - Slides with active class after: ${activeAfterCount} (should be 1)`);
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        debugLog(`🎬 nextSlide() called - moving to slide ${currentSlide}`);
        showSlide(currentSlide);
    }
    
    // Clear any existing interval to prevent duplicates
    if (galleryRotationInterval) {
        clearInterval(galleryRotationInterval);
        debugLog('🎬 Cleared previous rotation interval');
    }
    
    // Auto-rotate: Start rotating after 3 seconds, then every 5 seconds
    debugLog('🎬 Starting auto-rotate timer (first rotation in 3 seconds)');
    setTimeout(() => {
        debugLog('🎬 TIMER FIRED: First auto-rotation executing');
        nextSlide();
        
        galleryRotationInterval = setInterval(() => {
            debugLog('🎬 INTERVAL FIRED: Regular rotation executing');
            nextSlide();
        }, 5000);
        debugLog('🎬 Rotation interval started (repeats every 5 seconds)');
    }, 3000);
    
    // Allow clicking indicators to navigate
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            debugLog(`🎬 Indicator clicked: Navigation to slide ${index}`);
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    debugLog(`🎬 Gallery rotation READY with ${totalSlides} slides`);
}

// Initialize gallery from Supabase when DOM is ready
async function initializeGallery() {
    console.log('📸 Initializing gallery...');
    
    // Wait for Supabase to be ready
    let attempts = 0;
    while (!sbClient && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!sbClient) {
        console.warn('⚠️ Supabase not ready after 5 seconds, using fallback');
        loadFallbackGallery();
        return;
    }
    
    console.log('✅ Supabase ready, loading gallery...');
    try {
        await loadGalleryFromSupabase();
    } catch (err) {
        console.error('Gallery initialization error:', err);
        loadFallbackGallery();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeGallery();
    });
} else {
    initializeGallery();
}

debugLog('🤖 LV Robotics website loaded successfully!');
debugLog('💡 Tip: Try the Konami code for a surprise!');
