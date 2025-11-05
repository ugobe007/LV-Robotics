// LV Robotics - Admin Event Management Functions
// Multi-platform publishing support for SplashThat, Meetup, LinkedIn, X, Facebook

let currentEventId = null;
let currentEventImageUrl = null;
let eventGalleryMedia = []; // Array to store gallery photos/videos

// Toggle custom topic field
function toggleCustomTopic() {
    const topicDropdown = document.getElementById('eventTopic');
    const customField = document.getElementById('customTopicField');
    
    if (topicDropdown && customField) {
        if (topicDropdown.value === 'custom') {
            customField.style.display = 'block';
        } else {
            customField.style.display = 'none';
        }
    }
}

// Initialize event management
document.addEventListener('DOMContentLoaded', () => {
    // Create Event button handler
    const createBtn = document.getElementById('createEventBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            showEventForm();
        });
    }

    // Cancel button handler
    const cancelBtn = document.getElementById('cancelEventBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEventForm);
    }
});

// Show event form for creation
function showEventForm(eventData = null) {
    const form = document.getElementById('eventForm');
    const formTitle = document.getElementById('eventFormTitle');
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    
    if (eventData) {
        formTitle.textContent = 'Edit Event';
        populateEventForm(eventData);
        currentEventId = eventData.id;
    } else {
        formTitle.textContent = 'Create New Event';
        document.getElementById('eventFormElement').reset();
        document.getElementById('eventId').value = '';
        document.getElementById('eventImagePreview').innerHTML = '';
        document.getElementById('eventGalleryPreview').innerHTML = '';
        currentEventId = null;
        currentEventImageUrl = null;
        eventGalleryMedia = [];
        
        // Set sensible defaults for new events
        document.getElementById('eventCategory').value = 'meetup';
        document.getElementById('eventStartTimeOnly').value = '18:00';
        document.getElementById('eventEndTimeOnly').value = '20:00';
        document.getElementById('eventLocationType').value = 'in-person';
        document.getElementById('eventStatus').value = 'draft';
    }
}

// Hide event form
function cancelEventForm() {
    document.getElementById('eventForm').style.display = 'none';
    document.getElementById('eventFormElement').reset();
    document.getElementById('eventImagePreview').innerHTML = '';
    document.getElementById('eventGalleryPreview').innerHTML = '';
    currentEventId = null;
    currentEventImageUrl = null;
    eventGalleryMedia = [];
}

// Populate form with event data for editing
function populateEventForm(event) {
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventCategory').value = event.category || '';
    document.getElementById('eventShortDesc').value = event.short_description || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    // Split datetime into separate date and time fields (single-day events)
    if (event.start_date) {
        const startDate = new Date(event.start_date);
        document.getElementById('eventStartDateOnly').value = startDate.toISOString().split('T')[0];
        document.getElementById('eventStartTimeOnly').value = startDate.toTimeString().slice(0, 5);
    }
    if (event.end_date) {
        const endDate = new Date(event.end_date);
        document.getElementById('eventEndTimeOnly').value = endDate.toTimeString().slice(0, 5);
    }
    
    // Venue details
    const curfewTimeField = document.getElementById('eventCurfewTime');
    const foodDrinksField = document.getElementById('eventFoodDrinks');
    const avEquipmentField = document.getElementById('eventAVEquipment');
    
    if (curfewTimeField) curfewTimeField.value = event.curfew_time || '';
    document.getElementById('eventLocationType').value = event.location_type || 'in-person';
    document.getElementById('eventLocationName').value = event.location_name || '';
    document.getElementById('eventLocationAddress').value = event.location_address || '';
    if (foodDrinksField) foodDrinksField.value = event.food_drinks || '';
    if (avEquipmentField) avEquipmentField.value = event.av_equipment || '';
    
    // Speakers & Partners
    const topicField = document.getElementById('eventTopic');
    const topicCustomField = document.getElementById('eventTopicCustom');
    const customTopicDiv = document.getElementById('customTopicField');
    const speakersField = document.getElementById('eventSpeakers');
    const speakerBiosField = document.getElementById('eventSpeakerBios');
    const partnersField = document.getElementById('eventPartners');
    const resourcesField = document.getElementById('eventResources');
    
    // Check if topic is a predefined option or custom
    if (topicField && event.topic) {
        const predefinedOptions = ['space', 'healthcare', 'defense', 'hospitality', 'manufacturing', 
                                   'public-safety', 'office', 'education', 'agriculture', 'general'];
        if (predefinedOptions.includes(event.topic)) {
            topicField.value = event.topic;
        } else {
            // Custom topic - show custom field
            topicField.value = 'custom';
            if (topicCustomField) topicCustomField.value = event.topic;
            if (customTopicDiv) customTopicDiv.style.display = 'block';
        }
    }
    
    if (speakersField) speakersField.value = event.speakers || '';
    if (speakerBiosField) speakerBiosField.value = event.speaker_bios || '';
    if (partnersField) partnersField.value = event.partners || '';
    if (resourcesField) resourcesField.value = event.resources || '';
    
    document.getElementById('eventRegRequired').checked = event.registration_required || false;
    document.getElementById('eventMaxAttendees').value = event.max_attendees || '';
    document.getElementById('eventRegUrl').value = event.registration_url || '';
    
    document.getElementById('eventContactEmail').value = event.contact_email || '';
    document.getElementById('eventOrganizerName').value = event.organizer_name || '';
    
    document.getElementById('eventStatus').value = event.status || 'draft';
    document.getElementById('eventFeatured').checked = event.is_featured || false;
    
    // Show current image if exists
    if (event.image_url) {
        currentEventImageUrl = event.image_url;
        document.getElementById('eventImagePreview').innerHTML = `
            <img src="${event.image_url}" style="max-width: 200px; border-radius: 8px; border: 2px solid var(--admin-border);">
        `;
    }
    
    // Show gallery media if exists
    if (event.gallery_media && event.gallery_media.length > 0) {
        eventGalleryMedia = event.gallery_media;
        renderGalleryPreview();
    }
    
    // Show publishing status
    if (event.platforms && Object.keys(event.platforms).length > 0) {
        updatePublishStatus(event.platforms);
    }
}

// Handle event image upload
async function handleEventImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await sbClient.storage
            .from('event-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = sbClient.storage
            .from('event-images')
            .getPublicUrl(filePath);
        
        currentEventImageUrl = urlData.publicUrl;
        
        // Show preview
        document.getElementById('eventImagePreview').innerHTML = `
            <img src="${currentEventImageUrl}" style="max-width: 200px; border-radius: 8px; border: 2px solid var(--admin-primary);">
            <p style="color: var(--admin-success); font-size: 0.85rem; margin-top: 0.5rem;">✓ Image uploaded</p>
        `;
    } catch (err) {
        console.error('Error uploading image:', err);
        alert('Error uploading image: ' + err.message);
    }
}

// Handle gallery upload (multiple photos/videos)
async function handleEventGalleryUpload(event, mediaType) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        // Reset the file input to prevent issues
        event.target.value = '';
        return;
    }
    
    try {
        for (let file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;
            
            const { data, error } = await sbClient.storage
                .from('event-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = sbClient.storage
                .from('event-images')
                .getPublicUrl(filePath);
            
            // Add to gallery array
            eventGalleryMedia.push({
                url: urlData.publicUrl,
                type: mediaType,
                filename: file.name
            });
        }
        
        // Update preview
        renderGalleryPreview();
        
        // Clear the input so the same file can be selected again
        event.target.value = '';
        
    } catch (err) {
        console.error('Error uploading gallery media:', err);
        alert('Error uploading media: ' + err.message);
        // Clear the input on error
        event.target.value = '';
    }
}

// Render gallery preview
function renderGalleryPreview() {
    const previewDiv = document.getElementById('eventGalleryPreview');
    if (!previewDiv) return; // Safety check
    
    if (!eventGalleryMedia || eventGalleryMedia.length === 0) {
        previewDiv.innerHTML = '';
        return;
    }
    
    previewDiv.innerHTML = eventGalleryMedia.map((media, index) => `
        <div style="position: relative; border: 2px solid var(--admin-primary); border-radius: 8px; overflow: hidden;">
            ${media.type === 'image' ? 
                `<img src="${media.url}" style="width: 100%; height: 120px; object-fit: cover;">` :
                `<video src="${media.url}" style="width: 100%; height: 120px; object-fit: cover;"></video>`
            }
            <button onclick="removeGalleryMedia(${index})" 
                style="position: absolute; top: 4px; right: 4px; background: rgba(220, 38, 38, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                ×
            </button>
        </div>
    `).join('');
}

// Remove gallery media item
function removeGalleryMedia(index) {
    eventGalleryMedia.splice(index, 1);
    renderGalleryPreview();
}

// Save event
async function saveEvent() {
    try {
        // Check if user is authenticated
        const { data: { session } } = await sbClient.auth.getSession();
        if (!session) {
            alert('❌ Authentication Required\n\nYou must be logged in to create events.\n\nPlease refresh the page and sign in to the admin panel.');
            return;
        }
        
        // Get all field values
        const title = document.getElementById('eventTitle').value.trim();
        const category = document.getElementById('eventCategory').value;
        const startDateOnly = document.getElementById('eventStartDateOnly').value;
        const startTimeOnly = document.getElementById('eventStartTimeOnly').value;
        const endTimeOnly = document.getElementById('eventEndTimeOnly').value;
        const locationType = document.getElementById('eventLocationType').value;
        const locationName = document.getElementById('eventLocationName').value.trim();
        const locationAddress = document.getElementById('eventLocationAddress').value.trim();
        const status = document.getElementById('eventStatus').value;
        
        // Check for missing required fields with helpful messages
        const missing = [];
        if (!title) missing.push('Event Title');
        if (!category) missing.push('Category (select from dropdown)');
        if (!startDateOnly) missing.push('Event Date');
        if (!startTimeOnly) missing.push('Start Time');
        if (!endTimeOnly) missing.push('End Time');
        if (!locationType) missing.push('Location Type');
        if (!locationName) missing.push('Venue Name');
        if (!locationAddress) missing.push('Venue Address or Meeting URL');
        if (!status) missing.push('Status');
        
        if (missing.length > 0) {
            alert('❌ Missing Required Fields:\n\n• ' + missing.join('\n• ') + '\n\nPlease fill in all required fields marked with a red * to continue.');
            return;
        }
        
        // Combine date and time into ISO format (single-day events)
        const startDateTime = `${startDateOnly}T${startTimeOnly}`;
        const endDateTime = `${startDateOnly}T${endTimeOnly}`;
        
        // Get venue details (with safety checks for new fields)
        const curfewTimeField = document.getElementById('eventCurfewTime');
        const foodDrinksField = document.getElementById('eventFoodDrinks');
        const avEquipmentField = document.getElementById('eventAVEquipment');
        
        const curfewTime = curfewTimeField ? curfewTimeField.value || null : null;
        const foodDrinks = foodDrinksField ? foodDrinksField.value || null : null;
        const avEquipment = avEquipmentField ? avEquipmentField.value || null : null;
        
        // Get speaker/partner information (with safety checks for new fields)
        const topicField = document.getElementById('eventTopic');
        const topicCustomField = document.getElementById('eventTopicCustom');
        const speakersField = document.getElementById('eventSpeakers');
        const speakerBiosField = document.getElementById('eventSpeakerBios');
        const partnersField = document.getElementById('eventPartners');
        const resourcesField = document.getElementById('eventResources');
        
        // Use custom topic if "custom" is selected, otherwise use dropdown value
        let topic = null;
        if (topicField) {
            if (topicField.value === 'custom' && topicCustomField) {
                topic = topicCustomField.value.trim() || null;
            } else {
                topic = topicField.value || null;
            }
        }
        
        const speakers = speakersField ? speakersField.value.trim() || null : null;
        const speakerBios = speakerBiosField ? speakerBiosField.value.trim() || null : null;
        const partners = partnersField ? partnersField.value.trim() || null : null;
        const resources = resourcesField ? resourcesField.value.trim() || null : null;
        
        // Prepare event data
        const eventData = {
            title,
            category,
            short_description: document.getElementById('eventShortDesc').value || null,
            description: document.getElementById('eventDescription').value || null,
            start_date: new Date(startDateTime).toISOString(),
            end_date: new Date(endDateTime).toISOString(),
            curfew_time: curfewTime,
            location_type: locationType,
            location_name: locationName,
            location_address: locationAddress,
            food_drinks: foodDrinks,
            av_equipment: avEquipment,
            topic: topic,
            speakers: speakers,
            speaker_bios: speakerBios,
            partners: partners,
            resources: resources,
            registration_required: document.getElementById('eventRegRequired').checked,
            max_attendees: document.getElementById('eventMaxAttendees').value ? 
                parseInt(document.getElementById('eventMaxAttendees').value) : null,
            registration_url: document.getElementById('eventRegUrl').value || null,
            contact_email: document.getElementById('eventContactEmail').value || null,
            organizer_name: document.getElementById('eventOrganizerName').value || null,
            status,
            is_featured: document.getElementById('eventFeatured').checked,
            image_url: currentEventImageUrl,
            updated_at: new Date().toISOString()
        };
        
        // Add gallery_media only if column exists (requires SQL migration)
        if (eventGalleryMedia.length > 0) {
            eventData.gallery_media = eventGalleryMedia;
        }
        
        let result;
        if (currentEventId) {
            // Update existing event
            result = await sbClient
                .from('events')
                .update(eventData)
                .eq('id', currentEventId);
        } else {
            // Create new event
            result = await sbClient
                .from('events')
                .insert([eventData])
                .select();
            
            if (result.data && result.data.length > 0) {
                currentEventId = result.data[0].id;
            }
        }
        
        if (result.error) throw result.error;
        
        alert('✓ Event saved successfully!');
        cancelEventForm();
        loadEvents();
        
    } catch (err) {
        console.error('Error saving event:', err);
        alert('Error saving event: ' + err.message);
    }
}

// Save and publish event
async function saveAndPublishEvent() {
    // Set status to published before saving
    document.getElementById('eventStatus').value = 'published';
    await saveEvent();
}

// Load events list
async function loadEvents() {
    try {
        const { data, error } = await sbClient
            .from('events')
            .select('*')
            .order('start_date', { ascending: false });
        
        if (error) throw error;

        const content = document.getElementById('eventsContent');
        if (!data || data.length === 0) {
            content.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No events yet. Create your first event!</p></div>';
            return;
        }

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Type/Location</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Publishing</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(event => {
            const startDate = new Date(event.start_date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusColors = {
                'draft': '#64748b',
                'published': '#10b981',
                'cancelled': '#ef4444',
                'completed': '#6366f1'
            };
            const statusColor = statusColors[event.status] || '#64748b';
            const statusBadge = `<span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">${event.status}</span>`;
            
            const featuredIcon = event.is_featured ? '<i class="fas fa-star" style="color: #f59e0b;" title="Featured"></i> ' : '';
            
            const location = event.location_type === 'virtual' ? '🌐 Virtual' : 
                           event.location_type === 'hybrid' ? '🔄 Hybrid' :
                           event.location_name || 'In-Person';
            
            // Count published platforms
            const platforms = event.platforms || {};
            const publishedCount = Object.values(platforms).filter(p => p.published).length;
            const platformBadge = publishedCount > 0 ? 
                `<span style="color: var(--admin-success);">✓ ${publishedCount} platforms</span>` :
                `<span style="color: #64748b;">Not published</span>`;
            
            html += `
                <tr>
                    <td>${featuredIcon}${event.title}</td>
                    <td>${startDate}</td>
                    <td>${location}</td>
                    <td><span style="font-size: 0.85rem; color: #8cd682;">${event.category || '-'}</span></td>
                    <td>${statusBadge}</td>
                    <td style="font-size: 0.85rem;">${platformBadge}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon btn-view" title="View Event Page" onclick="viewEventPage('${event.slug}')"><i class="fas fa-external-link-alt"></i></button>
                            <button class="btn-icon btn-edit" title="Edit" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" style="background: var(--admin-warning);" title="Publish" onclick="showPublishOptions('${event.id}')"><i class="fas fa-share-alt"></i></button>
                            <button class="btn-icon btn-delete" title="Delete" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        content.innerHTML = html;

    } catch (err) {
        console.error('Error loading events:', err);
        document.getElementById('eventsContent').innerHTML = `<div class="alert alert-error">Error loading events: ${err.message}</div>`;
    }
}

// Edit event
async function editEvent(eventId) {
    try {
        const { data, error } = await sbClient
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        
        if (error) throw error;
        showEventForm(data);
    } catch (err) {
        console.error('Error loading event:', err);
        alert('Error loading event: ' + err.message);
    }
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Delete this event? This action cannot be undone.')) return;
    
    try {
        const { error } = await sbClient
            .from('events')
            .delete()
            .eq('id', eventId);
        
        if (error) throw error;
        
        alert('✓ Event deleted');
        loadEvents();
    } catch (err) {
        console.error('Error deleting event:', err);
        alert('Error deleting event: ' + err.message);
    }
}

// View event page
function viewEventPage(slug) {
    window.open(`/event.html?slug=${slug}`, '_blank');
}

// Show publish options (popup with platform choices)
function showPublishOptions(eventId) {
    // Set the current event ID for publishing
    currentEventId = eventId;
    // Show the form and scroll to publishing section
    editEvent(eventId).then(() => {
        const publishSection = document.querySelector('[style*="Multi-Platform Publishing"]');
        if (publishSection) {
            publishSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Multi-Platform Publishing Functions

// Update publish status display
function updatePublishStatus(platforms) {
    const statusDiv = document.getElementById('publishStatus');
    if (!statusDiv) return;
    
    let html = '<strong>Publishing Status:</strong><br>';
    const platformNames = {
        splashthat: { name: 'SplashThat', icon: 'share-alt', color: '#6366f1' },
        meetup: { name: 'Meetup', icon: 'users', color: '#f65858' },
        linkedin: { name: 'LinkedIn', icon: 'linkedin', color: '#0077b5' },
        x: { name: 'X (Twitter)', icon: 'x-twitter', color: '#000' },
        facebook: { name: 'Facebook', icon: 'facebook', color: '#1877f2' }
    };
    
    Object.entries(platforms).forEach(([key, value]) => {
        const platform = platformNames[key];
        if (platform && value.published) {
            html += `<span style="color: ${platform.color}; margin-right: 1rem;">
                <i class="fab fa-${platform.icon}"></i> ${platform.name}: ✓ Published
                ${value.url ? `(<a href="${value.url}" target="_blank" style="color: ${platform.color};">View</a>)` : ''}
            </span>`;
        }
    });
    
    statusDiv.innerHTML = html;
}

// Get current event data for publishing
async function getCurrentEventData() {
    if (!currentEventId) {
        alert('Please save the event first');
        return null;
    }
    
    const { data, error } = await sbClient
        .from('events')
        .select('*')
        .eq('id', currentEventId)
        .single();
    
    if (error) {
        console.error('Error loading event:', error);
        return null;
    }
    
    return data;
}

// Publish to SplashThat
async function publishToSplashThat() {
    const event = await getCurrentEventData();
    if (!event) return;
    
    // Generate SplashThat-compatible export data
    const splashthatData = {
        event_name: event.title,
        start_time: event.start_date,
        end_time: event.end_date || event.start_date,
        description: event.description,
        location: event.location_address || event.location_name,
        capacity: event.max_attendees
    };
    
    // Copy to clipboard and open SplashThat
    const dataString = JSON.stringify(splashthatData, null, 2);
    navigator.clipboard.writeText(dataString);
    
    alert('Event data copied to clipboard! Opening SplashThat...\n\nPaste this data when creating your event.');
    window.open('https://splashthat.com/', '_blank');
    
    // Update platforms status
    await updateEventPlatform('splashthat', true);
}

// Publish to Meetup
async function publishToMeetup() {
    const event = await getCurrentEventData();
    if (!event) return;
    
    // Generate Meetup URL with pre-filled data
    const meetupUrl = 'https://www.meetup.com/las-vegas-robotics-meetup/events/new/';
    
    // Copy event details to clipboard
    const meetupText = `Title: ${event.title}\n\nDescription:\n${event.description}\n\nLocation: ${event.location_name || event.location_address}\n\nDate: ${new Date(event.start_date).toLocaleString()}`;
    navigator.clipboard.writeText(meetupText);
    
    alert('Event details copied to clipboard! Opening Meetup...\n\nPaste the details when creating your event.');
    window.open(meetupUrl, '_blank');
    
    await updateEventPlatform('meetup', true);
}

// Share to LinkedIn
async function shareToLinkedIn() {
    const event = await getCurrentEventData();
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/event.html?slug=${event.slug}`;
    const text = `📅 ${event.title}\n\n${event.short_description || event.description}\n\n${new Date(event.start_date).toLocaleDateString()} | ${event.location_name || 'See details'}\n\nRegister now:`;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    
    navigator.clipboard.writeText(text);
    alert('Post text copied to clipboard! Opening LinkedIn...\n\nPaste the text in your post.');
    window.open(linkedinUrl, '_blank');
    
    await updateEventPlatform('linkedin', true, eventUrl);
}

// Share to X (Twitter)
async function shareToX() {
    const event = await getCurrentEventData();
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/event.html?slug=${event.slug}`;
    const text = `📅 ${event.title}\n${event.short_description || ''}\n${new Date(event.start_date).toLocaleDateString()}\n\nRegister: ${eventUrl}\n\n#LVRobotics #Robotics #LasVegas`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    
    await updateEventPlatform('x', true, eventUrl);
}

// Share to Facebook
async function shareToFacebook() {
    const event = await getCurrentEventData();
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/event.html?slug=${event.slug}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
    
    window.open(facebookUrl, '_blank');
    
    await updateEventPlatform('facebook', true, eventUrl);
}

// Update event platforms status in database
async function updateEventPlatform(platform, published, url = '') {
    if (!currentEventId) return;
    
    try {
        // Get current event
        const { data: event, error: fetchError } = await sbClient
            .from('events')
            .select('platforms')
            .eq('id', currentEventId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const platforms = event.platforms || {};
        platforms[platform] = {
            published,
            url,
            published_at: new Date().toISOString()
        };
        
        const { error: updateError } = await sbClient
            .from('events')
            .update({ platforms })
            .eq('id', currentEventId);
        
        if (updateError) throw updateError;
        
        updatePublishStatus(platforms);
        loadEvents(); // Refresh the list
    } catch (err) {
        console.error('Error updating platform status:', err);
    }
}
