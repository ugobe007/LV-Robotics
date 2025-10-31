# Re-enable OAuth Buttons

Once you've configured Google and/or GitHub OAuth in Supabase, uncomment these lines in the sign-in modal.

## Instructions:

1. Complete the OAuth setup in Supabase (see SUPABASE-SETUP.md)
2. Open `js/main.js`
3. Find the `showSignInModal()` function (around line 180-250)
4. Add these lines AFTER the opening `<p>` tag and BEFORE the email input section:

```javascript
<div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
    <button class="btn btn-primary" onclick="oauthSignIn('google')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem; padding: 0.85rem;">
        <i class="fab fa-google"></i> Continue with Google
    </button>
    <button class="btn btn-primary" onclick="oauthSignIn('github')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem; padding: 0.85rem; background: #24292e;">
        <i class="fab fa-github"></i> Continue with GitHub
    </button>
</div>

<div style="text-align: center; color: #94a3b8; margin: 1.25rem 0; font-size: 0.9rem; display: flex; align-items: center; gap: 1rem;">
    <div style="flex: 1; height: 1px; background: #475569;"></div>
    <span>OR USE EMAIL</span>
    <div style="flex: 1; height: 1px; background: #475569;"></div>
</div>
```

Or just let me know when you're done with the OAuth setup and I'll add them back automatically!
