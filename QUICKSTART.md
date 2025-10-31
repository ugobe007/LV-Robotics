# Quick Start Guide - LV Robotics Website

## 📋 What You Have

Your complete LV Robotics website is ready to edit locally! Here's what's included:

### File Structure
```
LV-Robotics/
├── index.html          → Main website file
├── css/
│   └── styles.css      → All styling and colors
├── js/
│   └── main.js         → Interactive features
├── images/             → Put your photos here
│   └── README.txt      → Image specifications
├── README.md           → Full documentation
└── .gitignore          → Git configuration
```

## 🚀 5-Minute Setup in VS Code

### Step 1: Open in Visual Studio Code
1. Open VS Code
2. Click "File" → "Open Folder"
3. Navigate to your `LV-Robotics` folder
4. Click "Select Folder"

### Step 2: Install Live Server Extension
1. Click the Extensions icon (4 squares) on the left sidebar
2. Search for "Live Server"
3. Install "Live Server" by Ritwick Dey
4. Restart VS Code if prompted

### Step 3: Run Your Website
1. In VS Code, right-click on `index.html`
2. Select "Open with Live Server"
3. Your website opens in your browser!
4. **Magic**: Any changes you make auto-refresh!

### Step 4: Add Your Images
1. Add these files to the `images/` folder:
   - `logo.png` (your club logo)
   - `community-1.jpg` (workshop photo)
   - `community-2.jpg` (team photo)
   - `community-3.jpg` (competition photo)

2. Pro tip: Keep images under 500KB for fast loading

## ✏️ Making Your First Edit

### Change the Hero Text
1. Open `index.html` in VS Code
2. Find line 52-53 (press Ctrl+G to go to line)
3. Change "Welcome to LV Robotics" to your text
4. Save (Ctrl+S)
5. Watch it update in your browser automatically!

### Change Colors
1. Open `css/styles.css`
2. Find lines 10-19 (the `:root` section)
3. Change `--primary-color` to any color you like
   - Try: `#ff6b6b` (red), `#4ecdc4` (teal), `#95e1d3` (mint)
4. Save and see the magic!

### Update Events
1. In `index.html`, find line 110
2. Edit the event dates, titles, and descriptions
3. Copy/paste an event card to add more events

## 💾 Save to GitHub (For Beginners)

### One-Time Setup

1. **Install Git:**
   - Windows: Download from git-scm.com
   - Mac: Already installed or via Homebrew
   - Open Terminal/Command Prompt and type: `git --version`

2. **Create GitHub Account:**
   - Go to github.com
   - Sign up (it's free!)

3. **Configure Git:**
   Open Terminal/Command Prompt in VS Code (Ctrl+` or Cmd+`) and type:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your-email@example.com"
   ```

### Upload Your Site

In the VS Code terminal, type these commands one by one:

```bash
# Go to your project folder
cd /path/to/LV-Robotics

# Initialize Git
git init

# Stage all files
git add .

# Make your first commit
git commit -m "Initial website setup"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR-USERNAME/LV-Robotics.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Make It Live (GitHub Pages)

1. Go to your repository on github.com
2. Click "Settings"
3. Scroll to "Pages" (left sidebar)
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait 2 minutes
7. Your site is live at: `https://YOUR-USERNAME.github.io/LV-Robotics/`

## 🎨 Common Customizations

### Add a New Section
```html
<section id="newsection" class="newsection">
    <div class="container">
        <h2 class="section-title">New <span class="highlight">Section</span></h2>
        <p>Your content here</p>
    </div>
</section>
```

### Add to Navigation
```html
<li><a href="#newsection" class="nav-link">New Section</a></li>
```

### Style Your New Section
Add to `css/styles.css`:
```css
.newsection {
    background: white;
    padding: 5rem 0;
}
```

## 🆘 Troubleshooting

### "Live Server not working"
- Make sure you installed the extension
- Try restarting VS Code
- Right-click on `index.html`, not other files

### "My changes aren't showing"
- Save your file (Ctrl+S)
- Hard refresh browser (Ctrl+Shift+R)
- Check the browser console (F12) for errors

### "Images not showing"
- Check spelling of image filenames (case-sensitive!)
- Make sure images are in the `images/` folder
- File names must match exactly in HTML

### "GitHub push failed"
- Make sure you created the repository on GitHub first
- Check that you're using the correct repository URL
- Verify your Git credentials

## 📚 Learning Resources

### HTML
- W3Schools: https://www.w3schools.com/html/
- MDN: https://developer.mozilla.org/en-US/docs/Web/HTML

### CSS
- CSS Tricks: https://css-tricks.com/
- Flexbox Guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/

### JavaScript
- JavaScript.info: https://javascript.info/
- FreeCodeCamp: https://www.freecodecamp.org/

### Git & GitHub
- GitHub Guides: https://guides.github.com/
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics

## 🎯 Next Steps

1. ✅ Set up VS Code and Live Server
2. ✅ Add your images
3. ✅ Customize text and colors
4. ✅ Update events and information
5. ✅ Push to GitHub
6. ✅ Enable GitHub Pages
7. ✅ Share your live site!

## 💡 Pro Tips

- **Ctrl+/** - Comment/uncomment code
- **Alt+Up/Down** - Move lines up/down
- **Ctrl+D** - Select next occurrence
- **Ctrl+Shift+L** - Select all occurrences
- **F12** - Open browser developer tools
- **Ctrl+Shift+I** - Format document

## 📞 Need Help?

- Read the full `README.md` for detailed instructions
- Check the code comments in each file
- Search for your question + "MDN" or "Stack Overflow"
- Create an issue on GitHub if you find bugs

---

**You've got this! 🚀**

Happy coding and welcome to the LV Robotics community!

---

Created: October 2025
For: LV Robotics Club
