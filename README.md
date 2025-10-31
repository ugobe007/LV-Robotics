# LV Robotics Website

A modern, responsive website for the Las Vegas Robotics community.

## 📁 Project Structure

```
LV-Robotics/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and animations
├── js/
│   └── main.js         # Interactive functionality
├── images/             # Image assets folder
│   ├── logo.png        # Site logo (add your logo here)
│   ├── community-1.jpg # Community photo 1
│   ├── community-2.jpg # Community photo 2
│   └── community-3.jpg # Community photo 3
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Visual Studio Code (or any code editor)
- A modern web browser
- Git (for version control and GitHub deployment)

### Local Development Setup

1. **Open the project in VS Code:**
   - Open Visual Studio Code
   - Go to File → Open Folder
   - Navigate to and select the `LV-Robotics` folder

2. **Install Live Server extension (recommended):**
   - Open VS Code Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "Live Server" by Ritwick Dey
   - Click Install

3. **Run the website locally:**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - Your browser will open with the website
   - Changes auto-refresh as you edit files

### Adding Your Images

1. Place your images in the `images/` folder:
   - `logo.png` - Your robotics club logo
   - `community-1.jpg` - Workshop photo
   - `community-2.jpg` - Team collaboration photo
   - `community-3.jpg` - Competition photo

2. Image recommendations:
   - Logo: 200x200px, PNG with transparent background
   - Community photos: 800x600px or larger, JPG format
   - Keep file sizes under 500KB for faster loading

## 🎨 Customization Guide

### Changing Colors

Edit the CSS variables in `css/styles.css` (lines 10-19):

```css
:root {
    --primary-color: #8b5cf6;      /* Main purple */
    --secondary-color: #ec4899;     /* Pink accent */
    --accent-color: #f97316;        /* Orange highlight */
    /* ... other colors ... */
}
```

### Editing Content

All content is in `index.html`. Key sections to customize:

- **Line 18**: Update logo path
- **Line 28-45**: Navigation menu items
- **Line 52-58**: Hero section text
- **Line 110-145**: Event cards (dates, times, locations)
- **Line 153-175**: Fellowship program details
- **Line 234-253**: Founder information
- **Line 313-341**: Contact form fields

### Adding New Sections

1. Create HTML section in `index.html`
2. Add styling in `css/styles.css`
3. Add interactivity in `js/main.js` if needed
4. Update navigation menu with new link

## 📤 Deploying to GitHub Pages

### First-time Setup

1. **Initialize Git repository:**
   ```bash
   cd LV-Robotics
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository:**
   - Go to github.com
   - Click "New repository"
   - Name it "LV-Robotics"
   - Don't initialize with README (you already have one)

3. **Connect and push:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/LV-Robotics.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Click Save

5. **Access your site:**
   - Your site will be at: `https://YOUR-USERNAME.github.io/LV-Robotics/`
   - May take a few minutes to deploy

### Updating Your Live Site

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

GitHub Pages will automatically update (takes 1-2 minutes).

## 🛠️ Features

### Current Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Animated hero section with particles
- ✅ Interactive navigation with dropdowns
- ✅ Event calendar
- ✅ Fellowship program showcase
- ✅ Workshop listings
- ✅ Competition information
- ✅ Bulletin board with posting
- ✅ Contact form
- ✅ Smooth scrolling
- ✅ Scroll animations
- ✅ Mobile hamburger menu

### Planned Features
- [ ] Event registration system
- [ ] Member login portal
- [ ] Photo gallery with lightbox
- [ ] Blog section
- [ ] Newsletter signup
- [ ] Social media integration

## 📝 Making Changes in VS Code

### Recommended Workflow

1. **Edit HTML** (index.html):
   - Update text content
   - Add/remove sections
   - Change structure

2. **Edit CSS** (css/styles.css):
   - Modify colors and fonts
   - Adjust spacing and layout
   - Add animations

3. **Edit JavaScript** (js/main.js):
   - Add interactive features
   - Update functionality
   - Add event handlers

4. **Test locally:**
   - Use Live Server to see changes instantly
   - Test on different screen sizes (F12 → Toggle Device Toolbar)

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Describe what you changed"
   git push
   ```

## 🎯 Quick Tasks

### Update Event Information
Edit lines 110-145 in `index.html`

### Change Hero Text
Edit lines 52-58 in `index.html`

### Add Social Media Links
Edit lines 288-293 in `index.html`

### Update Contact Information
Edit lines 305-310 in `index.html`

### Change Color Scheme
Edit CSS variables in `css/styles.css` (lines 10-19)

## 🐛 Troubleshooting

### Images Not Showing
- Check image file names match HTML (case-sensitive)
- Verify images are in `images/` folder
- Check file paths in HTML

### Live Server Not Working
- Reinstall Live Server extension
- Check if port 5500 is available
- Try restarting VS Code

### GitHub Pages Not Updating
- Wait 2-3 minutes after push
- Check GitHub Actions for errors
- Clear browser cache (Ctrl+Shift+R)

### Mobile Menu Not Working
- Check if `js/main.js` is loaded
- Look for console errors (F12)
- Verify hamburger ID matches JavaScript

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

For questions or issues:
- Check existing GitHub Issues
- Create new issue with details
- Include screenshots if relevant

## 📄 License

This project is open source and available for the LV Robotics community.

---

**Made with ❤️ for LV Robotics**

Last updated: October 2025
