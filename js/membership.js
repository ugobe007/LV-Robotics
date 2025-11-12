// Supabase configuration
const SUPABASE_URL = 'https://tzitghqmrmsxddysxhvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZ2V2dnV2bGV1d2pqbWVmanphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjQwMjksImV4cCI6MjA3NzM0MDAyOX0.sEED3-kLSZE74bHsrJvVhyaH_GEXEVECeZNWpCnFK84';

// Initialize Supabase client (will be loaded from CDN)
let supabase;

// Membership Form Handler
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Supabase client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const form = document.getElementById('membershipForm');
    const formMessage = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            
            // Convert checkboxes to array
            const interests = [];
            document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
                interests.push(checkbox.value);
            });
            
            // Create data object
            const memberData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                location: formData.get('location'),
                experience: formData.get('experience'),
                interests: interests,
                bio: formData.get('bio'),
                skills: formData.get('skills'),
                linkedin: formData.get('linkedin'),
                github: formData.get('github'),
                referral: formData.get('referral'),
                emailConsent: formData.get('emailConsent') === 'on',
                privacyConsent: formData.get('privacyConsent') === 'on',
                submittedAt: new Date().toISOString()
            };

            // Handle profile photo if uploaded
            const profilePhoto = formData.get('profilePhoto');
            if (profilePhoto && profilePhoto.size > 0) {
                // Photo will be handled by backend
                console.log('Profile photo uploaded:', profilePhoto.name);
            }

            try {
                // Handle profile photo upload first (if exists)
                let photoUrl = null;
                if (profilePhoto && profilePhoto.size > 0) {
                    photoUrl = await uploadProfilePhoto(profilePhoto, memberData.email);
                }
                
                // Prepare data for Supabase
                const supabaseData = {
                    first_name: memberData.firstName,
                    last_name: memberData.lastName,
                    email: memberData.email,
                    phone: memberData.phone,
                    location: memberData.location,
                    profile_photo_url: photoUrl,
                    experience_level: memberData.experience,
                    interests: memberData.interests,
                    bio: memberData.bio,
                    skills: memberData.skills,
                    linkedin_url: memberData.linkedin,
                    github_url: memberData.github,
                    referral_source: memberData.referral,
                    email_consent: memberData.emailConsent,
                    privacy_consent: memberData.privacyConsent
                };
                
                // Insert into Supabase
                const { data, error } = await supabase
                    .from('members')
                    .insert([supabaseData])
                    .select();
                
                if (error) {
                    throw error;
                }
                
                console.log('Member successfully registered:', data);
                
                // Redirect to welcome page after successful signup
                setTimeout(() => {
                    window.location.href = 'welcome.html';
                }, 500);
                
            } catch (error) {
                console.error('Error submitting form:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                
                // Handle duplicate email error
                if (error.code === '23505') {
                    showMessage('error', 'This email is already registered. Please use a different email or contact us if you need help.');
                } else {
                    showMessage('error', `Error: ${error.message || 'Something went wrong'}. Please check the console for details.`);
                }
            }
        });
    }

    function showMessage(type, message) {
        formMessage.className = `form-message ${type}`;
        formMessage.textContent = message;
        
        if (type === 'success') {
            // Hide message after 10 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 10000);
        }
    }

    // Upload profile photo to Supabase Storage
    async function uploadProfilePhoto(file, userEmail) {
        try {
            // Create unique filename using timestamp and email
            const fileExt = file.name.split('.').pop();
            const fileName = `${userEmail.replace('@', '_')}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;
            
            // Upload file to Supabase Storage
            const { data, error } = await supabase.storage
                .from('member-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                console.error('Error uploading photo:', error);
                return null;
            }
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('member-photos')
                .getPublicUrl(filePath);
            
            return urlData.publicUrl;
            
        } catch (error) {
            console.error('Error in uploadProfilePhoto:', error);
            return null;
        }
    }

    // File upload preview (optional enhancement)
    const photoInput = document.getElementById('profilePhoto');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    photoInput.value = '';
                    return;
                }
                
                // Validate file type
                if (!file.type.match('image.*')) {
                    alert('Please upload an image file');
                    photoInput.value = '';
                    return;
                }
                
                console.log('Photo selected:', file.name);
            }
        });
    }
});
