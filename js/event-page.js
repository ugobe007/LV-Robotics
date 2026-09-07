// Event page logic extracted from inline script for CSP compatibility.
const urlParams = new URLSearchParams(window.location.search);
const eventSlug = urlParams.get('slug');

const EVENT_SUPABASE_URL = 'https://ubanpswucfkdvixityoe.supabase.co';
const EVENT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYW5wc3d1Y2ZrZHZpeGl0eW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDk2MjgsImV4cCI6MjA5NjQyNTYyOH0.KogBL-y8tq5VkAucR6WABmr6D3yLXlx1vNvRJu7FpPY';
const FALLBACK_EVENTS = {
    'foundational-models': {
        slug: 'foundational-models',
        title: 'Foundational Models',
        short_description: 'LV Robotics: Foundation Models Are Changing How We Build Robots',
        reason_to_attend: 'Explore how vision-language-action (VLA) models and physical foundation models decouple physical intelligence from specific hardware.',
        description: 'For most of robotics history, intelligent automation was built forward: Task -> Program -> Robot -> Action. Whenever a robot needed to perform a new task, engineers had to write new code, gather fresh demonstrations, retrain architecture, and test.\n\nToday that paradigm is shifting. Robot foundation models, Vision-Language-Action (VLA) models, and world models are decoupling physical intelligence from specific tasks—and even from specific hardware embodiments.\n\nJoin us as we explore DeepMind Gemini Robotics 2, Stanford SimToolReal, PI\'s pi0.7, and OS3 physical intelligence.',
        start_date: '2026-09-17T17:30:00-07:00',
        end_date: '2026-09-17T19:30:00-07:00',
        location_type: 'in_person',
        location_name: 'Desert Research Institute',
        location_address: '755 East Flamingo Rd, Las Vegas, NV',
        organizer_name: 'Las Vegas Robotics Meetup',
        registration_required: true,
        registration_url: 'https://www.meetup.com/las-vegas-robotics-meetup/events/316423143/',
        category: 'Meetup',
        status: 'published',
        image_url: 'images/marcus_sophia.jpg'
    },
    'emotional-ai-loops-do-you-get-me': {
        slug: 'emotional-ai-loops-do-you-get-me',
        title: 'Emotional AI Loops: do you "get" me?',
        short_description: 'Join the Las Vegas Robotics Meetup for an afternoon exploring emotional AI, empathy loops, and human-robot relationships.',
        reason_to_attend: 'A timely conversation on emotional intelligence, trust, and what human-centered robotics should feel like in practice.',
        description: 'Hello LV Robotics!\n\nApologies on the delay. We\'ve been busy building LV Robotics and will share updates at our event.\n\nAs AI advances into the realm of realism are we ready for equally real emotions and behaviors from robots? Will they show and feel true emotions or politely mimic them for our benefit? For the next LV Robotics event we will explore how empathy, trust, and emotional intelligence will redefine human-robot relationships.\n\nJoin us for our first lunch time event at DRI. Yes, this a new time so hopefully many of you can escape work for this.\n\nBob & Darius',
        start_date: '2026-08-20T18:30:00-07:00',
        end_date: '2026-08-20T20:30:00-07:00',
        location_type: 'in_person',
        location_name: 'Desert Research Institute',
        location_address: '755 East Flamingo Rd, Las Vegas, NV',
        organizer_name: 'Las Vegas Robotics Meetup',
        registration_required: true,
        registration_url: 'https://www.meetup.com/las-vegas-robotics-meetup/events/315718402/',
        category: 'Meetup',
        status: 'published',
        image_url: 'images/marcus_sophia.jpg'
    }
};

let eventSbClient;
const EVENT_SB_MAX_RETRIES = 60;

function initSupabaseForEventPage(attempt = 0) {
    if (typeof window.supabase !== 'undefined') {
        eventSbClient = window.supabase.createClient(EVENT_SUPABASE_URL, EVENT_SUPABASE_ANON_KEY);
        loadEvent();
    } else {
        if (attempt >= EVENT_SB_MAX_RETRIES) {
            showEventNotFound('Could not load event services. Please refresh and try again.');
            return;
        }
        setTimeout(() => initSupabaseForEventPage(attempt + 1), 100);
    }
}

window.addEventListener('load', initSupabaseForEventPage);

function getEventContentRoot() {
    return document.getElementById('eventContent');
}

function showEventNotFound(message) {
    const root = getEventContentRoot();
    if (!root) return;
    root.innerHTML = `
        <div style="text-align: center; padding: 4rem 0;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
            <h2 style="color: #e2e8f0;">Event Not Found</h2>
            <p style="color: #94a3b8;">${message}</p>
            <a href="index.html#events" class="btn btn-primary" style="margin-top: 2rem;">View All Events</a>
        </div>
    `;
}

function safeEncodeAttr(value) {
    return encodeURIComponent(String(value || ''));
}

async function loadEvent() {
    if (!eventSlug) {
        showEventNotFound('No event specified in URL');
        return;
    }

    const fallbackEvent = FALLBACK_EVENTS[eventSlug];
    if (fallbackEvent) {
        document.getElementById('pageTitle').textContent = `${fallbackEvent.title} - LV Robotics`;
        document.getElementById('pageDescription').content = fallbackEvent.short_description || fallbackEvent.description?.substring(0, 160);
        document.getElementById('ogTitle').content = fallbackEvent.title;
        document.getElementById('ogDescription').content = fallbackEvent.short_description || fallbackEvent.description?.substring(0, 160);
        if (fallbackEvent.image_url) {
            document.getElementById('ogImage').content = fallbackEvent.image_url;
        }
        renderEvent(fallbackEvent);
        return;
    }

    try {
        const { data: event, error } = await eventSbClient
            .from('events')
            .select('*')
            .eq('slug', eventSlug)
            .eq('status', 'published')
            .single();

        if (error || !event) throw new Error('Event not found');

        document.getElementById('pageTitle').textContent = `${event.title} - LV Robotics`;
        document.getElementById('pageDescription').content = event.short_description || event.description?.substring(0, 160);
        document.getElementById('ogTitle').content = event.title;
        document.getElementById('ogDescription').content = event.short_description || event.description?.substring(0, 160);
        if (event.image_url) document.getElementById('ogImage').content = event.image_url;

        await eventSbClient
            .from('events')
            .update({ view_count: (event.view_count || 0) + 1 })
            .eq('id', event.id);

        renderEvent(event);
    } catch (err) {
        console.error('Error loading event:', err);
        showEventNotFound('This event may have been removed or is no longer available');
    }
}

function renderEvent(event) {
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    const startDateStr = startDate.toLocaleString('en-US', dateOptions);
    const endDateStr = endDate ? endDate.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }) : null;

    const locationIcon = event.location_type === 'virtual' ? 'video' : 'map-marker-alt';
    const locationText = event.location_type === 'virtual'
        ? 'Virtual Event'
        : event.location_type === 'hybrid'
            ? `Hybrid: ${event.location_name}`
            : event.location_name;

    const spotsLeft = event.max_attendees ? (event.max_attendees - (event.current_attendees || 0)) : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;

    const html = `
        <div class="event-header">
            ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" class="event-banner">` : ''}

            <div>
                ${event.category ? `<span class="event-badge">${event.category}</span>` : ''}
                ${event.is_featured ? `<span class="event-badge" style="background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; color: #f59e0b;"><i class="fas fa-star"></i> Featured</span>` : ''}
            </div>

            <h1 class="event-title">${event.title}</h1>

            <div class="event-meta">
                <div class="event-meta-item">
                    <i class="far fa-calendar"></i>
                    <span>${startDateStr}${endDateStr ? ` - ${endDateStr}` : ''}</span>
                </div>
                <div class="event-meta-item">
                    <i class="fas fa-${locationIcon}"></i>
                    <span>${locationText}</span>
                </div>
                ${event.organizer_name ? `
                <div class="event-meta-item">
                    <i class="fas fa-user"></i>
                    <span>By ${event.organizer_name}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="event-content">
            <div class="event-main">
                ${event.short_description ? `
                <div class="event-section">
                    <p style="font-size: 1.2rem; color: #a8e6a1; font-weight: 600; line-height: 1.6;">${event.short_description}</p>
                </div>
                ` : ''}

                ${event.description ? `
                <div class="event-section">
                    <h2><i class="fas fa-info-circle"></i> About This Event</h2>
                    <div class="event-description">${event.description.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}

                ${event.requirements ? `
                <div class="event-section">
                    <h2><i class="fas fa-clipboard-list"></i> What to Bring</h2>
                    <div class="event-description">${event.requirements.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}

                ${event.gallery_media && event.gallery_media.length > 0 ? `
                <div class="event-section">
                    <h2><i class="fas fa-images"></i> Gallery</h2>
                    <div class="event-gallery">
                        ${event.gallery_media.map((media) => {
                            if (media.type === 'image') {
                                return `<img src="${media.url}" alt="${media.filename}" class="gallery-item" data-gallery-url="${safeEncodeAttr(media.url)}">`;
                            }
                            return `<video src="${media.url}" class="gallery-item" controls></video>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}

                ${event.location_address && event.location_type !== 'virtual' ? `
                <div class="event-section">
                    <h2><i class="fas fa-map-marked-alt"></i> Location</h2>
                    <p style="color: #e2e8f0; margin-bottom: 0.5rem;">${event.location_name}</p>
                    <p style="color: #94a3b8;">${event.location_address}</p>
                    <div class="map-container">
                        <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            style="border:0"
                            src="https://www.google.com/maps?q=${encodeURIComponent(event.location_address)}&output=embed"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="event-sidebar">
                <div class="event-card">
                    <h3><i class="fas fa-ticket-alt"></i> Registration</h3>
                    ${spotsLeft !== null ? `
                        <p class="attendee-count">${isFull ? '❌ Event Full' : `✓ ${spotsLeft} spots remaining`}</p>
                    ` : ''}
                    ${event.registration_url ? `
                        <a href="${event.registration_url}" target="_blank" class="register-btn" ${isFull ? 'style="background: #64748b; pointer-events: none;"' : ''} data-track-registration="${event.id}">
                            ${isFull ? 'Sold Out' : 'Register Now'}
                        </a>
                    ` : event.registration_required ? `
                        <button class="register-btn" ${isFull ? 'disabled' : ''} data-register-event="${event.id}">
                            ${isFull ? 'Sold Out' : 'Register Now'}
                        </button>
                    ` : `
                        <p style="color: #8cd682; text-align: center;"><i class="fas fa-check-circle"></i> No registration required</p>
                    `}
                    ${event.current_attendees ? `
                        <p style="color: #94a3b8; font-size: 0.85rem; text-align: center; margin-top: 1rem;">${event.current_attendees} registered</p>
                    ` : ''}
                </div>

                ${event.virtual_link ? `
                <div class="event-card">
                    <h3><i class="fas fa-video"></i> Join Virtually</h3>
                    <a href="${event.virtual_link}" target="_blank" class="register-btn" style="background: #6366f1;">Join Meeting</a>
                </div>
                ` : ''}

                <div class="event-card">
                    <h3><i class="fas fa-share-alt"></i> Share Event</h3>
                    <div class="share-buttons">
                        <button class="share-btn linkedin" data-share-platform="linkedin" title="Share on LinkedIn"><i class="fab fa-linkedin"></i></button>
                        <button class="share-btn twitter" data-share-platform="twitter" title="Share on X"><i class="fab fa-x-twitter"></i></button>
                        <button class="share-btn facebook" data-share-platform="facebook" title="Share on Facebook"><i class="fab fa-facebook"></i></button>
                        <button class="share-btn email" data-share-platform="email" title="Share via Email"><i class="fas fa-envelope"></i></button>
                        <button class="share-btn copy" data-copy-link="1" title="Copy Link"><i class="fas fa-link"></i></button>
                    </div>
                </div>

                ${event.contact_email ? `
                <div class="event-card">
                    <h3><i class="fas fa-envelope"></i> Contact</h3>
                    <p style="color: #e2e8f0; word-break: break-word;">
                        <a href="mailto:${event.contact_email}" style="color: #a8e6a1;">${event.contact_email}</a>
                    </p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const root = getEventContentRoot();
    if (!root) return;
    root.innerHTML = html;
    bindEventPageActions(root);
}

function bindEventPageActions(root) {
    root.onclick = (e) => {
        const galleryItem = e.target.closest('[data-gallery-url]');
        if (galleryItem) {
            const galleryUrl = decodeURIComponent(galleryItem.dataset.galleryUrl || '');
            if (galleryUrl) window.open(galleryUrl, '_blank', 'noopener');
            return;
        }

        const trackedReg = e.target.closest('[data-track-registration]');
        if (trackedReg) {
            const eventId = trackedReg.dataset.trackRegistration;
            if (eventId) {
                trackRegistrationClick(eventId).catch((err) => {
                    console.error('Error tracking click:', err);
                });
            }
            return;
        }

        const registerBtn = e.target.closest('[data-register-event]');
        if (registerBtn) {
            const eventId = registerBtn.dataset.registerEvent;
            if (eventId) registerForEvent(eventId);
            return;
        }

        const shareBtn = e.target.closest('[data-share-platform]');
        if (shareBtn) {
            shareEvent(shareBtn.dataset.sharePlatform);
            return;
        }

        if (e.target.closest('[data-copy-link]')) {
            copyEventLink();
        }
    };
}

async function trackRegistrationClick(eventId) {
    const { error: rpcError } = await eventSbClient.rpc('increment_event_click_count', {
        event_id: eventId
    });

    if (!rpcError) return;

    // Fallback to read-then-write in case RPC migration has not been applied yet.
    const { data: event } = await eventSbClient
        .from('events')
        .select('click_count')
        .eq('id', eventId)
        .single();

    if (!event) return;

    await eventSbClient
        .from('events')
        .update({ click_count: (event.click_count || 0) + 1 })
        .eq('id', eventId);
}

function shareEvent(platform) {
    const url = window.location.href;
    const title = document.getElementById('pageTitle').textContent;
    const description = document.getElementById('pageDescription').content;

    let shareUrl = '';
    switch (platform) {
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`;
            break;
        default:
            break;
    }

    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyEventLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('✓ Event link copied to clipboard!');
    });
}

function registerForEvent(eventId) {
    window.location.href = `contact.html?event=${eventId}`;
}
