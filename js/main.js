// Delete post and media (if in user's folder)
async function deletePostSupabase(postId, mediaUrl) {
    try {
        if (!sbClient) return;
        // Delete DB row (RLS ensures ownership)
        const { error } = await sbClient.from('posts').delete().eq('id', postId);
        if (error) throw error;
        // Optionally delete media if hosted in our bucket and path contains user id folder
        if (mediaUrl && mediaUrl.includes('/storage/v1/object/public/community-media/')) {
            const key = mediaUrl.split('/community-media/')[1];
            if (key) {
                await sbClient.storage.from('community-media').remove([key]);
            }
        }
    } catch (e) {
        console.error('Delete failed:', e);
        alert('Could not delete post.');
    }
}

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

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
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

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

// Initialize particles
createParticles();

// Bulletin Board Functionality
// Bulletin Board functionality
// Supabase client setup
const SUPABASE_URL = 'https://tzitghqmrmsxddysxhvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXRnaHFtcm1zeGRkeXN4aHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDAzMjMsImV4cCI6MjA3NzUxNjMyM30.f5rZPAdCOHe6ZXr_TYgmhUkZkcWsSYX_qMLXUgg9dZ8';
let sbClient = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        initAuth();
    }
});

async function initAuth() {
    const { data } = await sbClient.auth.getSession();
    console.log('=== INITIAL SESSION CHECK ===');
    console.log('Session exists:', !!data.session);
    console.log('User:', data.session?.user?.email || 'Not signed in');
    console.log('============================');
    
    updateAuthUI(data.session?.user || null);
    
    sbClient.auth.onAuthStateChange((event, session) => {
        console.log('=== AUTH STATE CHANGED ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        console.log('User:', session?.user?.email || 'Not signed in');
        console.log('========================');
        
        updateAuthUI(session?.user || null);
        if (document.getElementById('bulletinPosts')) {
            renderPostsFromSupabase();
        }
    });
}

function updateAuthUI(user) {
    const signedOut = document.getElementById('authSignedOut');
    const signedIn = document.getElementById('authSignedIn');
    const emailEl = document.getElementById('authUserEmail');
    if (!signedOut || !signedIn) return;
    
    console.log('>>> Updating UI for user:', user?.email || 'No user');
    
    if (user) {
        signedOut.style.display = 'none';
        signedIn.style.display = 'flex';
        if (emailEl) emailEl.textContent = user.email || 'Signed in';
        console.log('>>> UI updated: Sign-in controls HIDDEN, user controls VISIBLE');
    } else {
        signedOut.style.display = '';
        signedIn.style.display = 'none';
        console.log('>>> UI updated: Sign-in controls VISIBLE, user controls HIDDEN');
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
            console.error('Sign in error:', signInError);
            
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
                console.log('Attempting to create new account...');
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
                    console.error('Sign up error:', signUpError);
                    throw signUpError;
                }
                
                console.log('Sign up response:', signUpData);
                
                // Check if we got a session (auto-confirmed)
                if (signUpData?.session) {
                    alert('✓ Welcome! Your account has been created and you\'re now signed in.');
                    closeSignInModal();
                    // Session is automatically set by Supabase
                    console.log('New account created with session');
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
            console.log('Sign in successful:', signInData);
            alert('✓ Welcome back! You\'re now signed in.');
            closeSignInModal();
            // Session is automatically set by Supabase
        } else {
            throw new Error('Sign in did not return a session');
        }
        
        // Wait a moment for the auth state to propagate, then refresh UI
        setTimeout(() => {
            console.log('Refreshing UI after auth...');
            sbClient.auth.getSession().then(({ data }) => {
                console.log('Current session after sign in:', data.session);
                updateAuthUI(data.session?.user || null);
            });
        }, 500);
        
    } catch (e) {
        console.error('Authentication error:', e);
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
        console.error('OAuth sign-in error:', e);
        alert('OAuth sign-in failed.');
    }
}

async function signOut() {
    try {
        await sbClient?.auth.signOut();
        console.log('User signed out');
    } catch (e) {
        console.error('Sign out error:', e);
    }
}
let currentMedia = null;
let currentMediaType = null;

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if user is signed in - force a fresh session check
    if (sbClient) {
        const { data: sessionData, error } = await sbClient.auth.getSession();
        console.log('Session check for image upload:', sessionData, error);
        
        const isAuthenticated = sessionData?.session?.user != null;
        console.log('Is authenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            event.target.value = ''; // Clear the file input
            const shouldSignIn = confirm('Sign in to upload images and save them permanently.\n\nClick OK to sign in, or Cancel to continue without uploading.');
            if (shouldSignIn) {
                showSignInModal();
            }
            return;
        }
        console.log('User authenticated, proceeding with image upload');
    } else {
        console.error('Supabase client not initialized');
        alert('Authentication system not ready. Please refresh the page.');
        event.target.value = '';
        return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('Image is too large. Please use an image smaller than 10MB.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentMedia = e.target.result;
        currentMediaType = 'image';
        showMediaPreview();
    };
    reader.readAsDataURL(file);
}

async function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if user is signed in - force a fresh session check
    if (sbClient) {
        const { data: sessionData, error } = await sbClient.auth.getSession();
        console.log('Session check for video upload:', sessionData, error);
        
        const isAuthenticated = sessionData?.session?.user != null;
        console.log('Is authenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
            event.target.value = ''; // Clear the file input
            const shouldSignIn = confirm('Sign in to upload videos and save them permanently.\n\nClick OK to sign in, or Cancel to continue without uploading.');
            if (shouldSignIn) {
                showSignInModal();
            }
            return;
        }
        console.log('User authenticated, proceeding with video upload');
    } else {
        console.error('Supabase client not initialized');
        alert('Authentication system not ready. Please refresh the page.');
        event.target.value = '';
        return;
    }
    
    // Check file size (limit to 50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
        alert('Video is too large. Please use a video smaller than 50MB.');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentMedia = e.target.result;
        currentMediaType = 'video';
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
        console.log('Session check before posting:', sessionData);
        if (!sessionData?.session?.user) {
            const shouldSignIn = confirm('Sign in to post images or videos and save them permanently.\n\nClick OK to sign in, or Cancel to post text only.');
            if (shouldSignIn) {
                showSignInModal();
                if (postBtn) {
                    postBtn.disabled = false;
                    postBtn.textContent = 'Post';
                }
                isSubmittingPost = false;
                return;
            } else {
                // User chose to continue without media
                clearMedia();
            }
        } else {
            console.log('User is authenticated, media will be uploaded');
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
        console.log('Adding image to post:', currentMedia.substring(0, 50));
        // Upload to Supabase Storage if possible
        uploadedUrl = await tryUploadToSupabase(currentMedia, 'image');
        const url = uploadedUrl || currentMedia;
        mediaHTML = `<img src="${url}" alt="Post image">`;
        thumbnailHTML = `<img src="${url}" alt="Post thumbnail" class="post-thumbnail">`;
    } else if (currentMedia && currentMediaType === 'video') {
        console.log('Adding video to post');
        uploadedUrl = await tryUploadToSupabase(currentMedia, 'video');
        const url = uploadedUrl || currentMedia;
        mediaHTML = `<video controls src="${url}"></video>`;
        thumbnailHTML = `<video src="${url}" class="post-thumbnail" muted></video>`;
    } else if (currentMedia && currentMediaType === 'link') {
        console.log('Adding link to post:', currentMedia);
        mediaHTML = `<a href="${currentMedia}" target="_blank" rel="noopener">🔗 ${currentMedia}</a>`;
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

    // Persist: Supabase then localStorage as fallback (SAVE BEFORE CLEARING!)
    const persisted = await savePostSupabase({
        text: postText,
        mediaType: currentMediaType,
        media: uploadedUrl || currentMedia
    });
    
    // Clear media AFTER saving
    clearMedia();
    if (!persisted) {
        // Only save text posts to localStorage as fallback
        // Media posts require Supabase to work properly
        if (!currentMedia) {
            savePostLocal({ text: postText, mediaType: currentMediaType, media: uploadedUrl || currentMedia });
        } else {
            alert('Failed to upload media. Please make sure you are signed in and try again.');
            // Remove the optimistic post since upload failed
            post.remove();
            updatePostCounter();
            if (postBtn) {
                postBtn.disabled = false;
                postBtn.textContent = 'Post';
            }
            isSubmittingPost = false;
            return;
        }
    }
    lastPostAt = nowTs;

    // Re-render from Supabase to avoid duplicates and ensure canonical view
    await renderPostsFromSupabase();

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
            console.warn('Supabase client not available or invalid data URL');
            return null;
        }
        const { data: sessionData } = await sbClient.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) {
            console.warn('User not authenticated - cannot upload to Supabase storage');
            return null;
        }
        const mime = dataUrl.substring(5, dataUrl.indexOf(';'));
        const ext = mime.split('/')[1] || (kind === 'image' ? 'png' : 'mp4');
        const fileName = `${userId}/post_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const base64 = dataUrl.split(',')[1];
        const bin = atob(base64);
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        const file = new File([buf], fileName, { type: mime });
        
        console.log('Attempting to upload to community-media bucket...');
        const { error } = await sbClient.storage.from('community-media').upload(fileName, file, { upsert: false });
        
        if (error) {
            console.error('Supabase upload error:', error);
            
            // If bucket doesn't exist, explain the issue
            if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
                alert('Storage bucket not set up yet.\n\nThe photo/video will be saved temporarily in your browser.\n\nTo enable permanent cloud storage, please create the "community-media" bucket in your Supabase dashboard.');
                // Save locally as fallback
                return dataUrl; // Return the data URL to save locally
            }
            
            alert(`Upload failed: ${error.message}`);
            return null;
        }
        
        const { data } = sbClient.storage.from('community-media').getPublicUrl(fileName);
        console.log('Successfully uploaded to Supabase:', data.publicUrl);
        return data.publicUrl;
    } catch (e) {
        console.error('Upload failed:', e);
        alert('Failed to upload media. The file will be saved temporarily in your browser.');
        return dataUrl; // Return data URL as fallback
    }
}

// Save post to Supabase table
async function savePostSupabase(post) {
    try {
        console.log('💾 Attempting to save post to database:', post);
        if (!sbClient) {
            console.error('❌ Supabase client not initialized');
            return false;
        }
        const { data: sessionData } = await sbClient.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        console.log('👤 User ID:', userId);
        if (!userId) {
            console.error('❌ No user ID - user not signed in');
            return false;
        }
        const insertData = {
            text: post.text || null,
            media_url: post.media || null,
            media_type: post.mediaType || null,
            user_id: userId
        };
        console.log('📤 Inserting data:', insertData);
        const { data, error } = await sbClient.from('posts').insert(insertData);
        if (error) {
            console.error('❌ Supabase insert error:', error);
            return false;
        }
        console.log('✅ Post saved successfully!', data);
        return true;
    } catch (e) {
        console.error('❌ savePostSupabase failed:', e);
        return false;
    }
}

// Load posts from Supabase, fallback to local
async function renderPostsFromSupabase() {
    const postsContainer = document.getElementById('bulletinPosts');
    if (!postsContainer) {
        console.log('❌ No bulletinPosts container found');
        return;
    }
    
    console.log('📋 Loading posts from database...');
    
    try {
        if (!sbClient) {
            console.log('⚠️ Supabase client not available, using local storage');
            renderSavedPosts();
            return;
        }
        
        console.log('🔍 Fetching posts from Supabase...');
        const { data, error } = await sbClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        console.log('📦 Query result:', { data, error });
        
        if (error) {
            console.error('Database error:', error);
            // If table doesn't exist (404) or other DB error, use local storage
            if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('404')) {
                console.log('Posts table not found or not accessible, using local storage');
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
            console.log('Rendering post:', p); // Debug: see the post data
            const post = document.createElement('div');
            post.className = 'bulletin-post';
            post.style.animation = 'fadeInUp 0.5s ease';
            post.dataset.postId = p.id;
            post.dataset.userId = p.user_id || '';
            let mediaHTML = '';
            let thumbnailHTML = '';
            if (p.media_url && p.media_type === 'image') {
                mediaHTML = `<img src="${p.media_url}" alt="Post image">`;
                thumbnailHTML = `<img src="${p.media_url}" alt="Post thumbnail" class="post-thumbnail">`;
                console.log('Image post - URL:', p.media_url); // Debug
            } else if (p.media_url && p.media_type === 'video') {
                mediaHTML = `<video controls src="${p.media_url}"></video>`;
                thumbnailHTML = `<video src="${p.media_url}" class="post-thumbnail" muted></video>`;
            } else if (p.media_url && p.media_type === 'link') {
                mediaHTML = `<a href="${p.media_url}" target="_blank" rel="noopener">🔗 ${p.media_url}</a>`;
                thumbnailHTML = `<div class="post-text-preview">🔗 Link</div>`;
            }
            if (!thumbnailHTML && p.text) {
                const preview = p.text.length > 50 ? p.text.substring(0, 50) + '...' : p.text;
                thumbnailHTML = `<div class="post-text-preview">${preview}</div>`;
            }
            console.log('MediaHTML:', mediaHTML); // Debug: see what media HTML is created
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
        console.error('Fetch posts failed:', e);
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
    console.log('Opening modal for post:', postElement);
    const text = postElement.getAttribute('data-text');
    const media = postElement.getAttribute('data-media');
    const author = postElement.getAttribute('data-user-id');
    const time = postElement.getAttribute('data-time');
    
    console.log('Post data:', { text, media, author, time });
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('postModal');
    if (!modal) {
        console.log('Creating new modal');
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
    modal.querySelector('.modal-media').innerHTML = media || '';
    modal.querySelector('.modal-text').textContent = text || '';
    
    console.log('Showing modal');
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
    console.log('Form submitted:', data);
    
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

console.log('🤖 LV Robotics website loaded successfully!');
console.log('💡 Tip: Try the Konami code for a surprise!');
