# Robotics Club Website

A modern, interactive website for our robotics club featuring event calendars, workshops, competitions, and community engagement.

## Features

- 🤖 Interactive navigation with dropdown menus
- 📅 Events calendar
- 🎓 Fellowship program information
- 🛠️ Workshop schedules
- 🏆 Competition details
- 👥 Founders and sponsors sections
- 💬 Community bulletin board
- 📱 Fully responsive design

## File Structure

```
robotics-club-website/
├── index.html          # Main website file
├── assets/
│   └── images/
│       └── logo.png    # Club logo
└── README.md          # This file
```

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click Save

Your site will be live at: `https://yourusername.github.io/robotics-club-website/`

### Adding Images

Place any additional images in the `assets/images/` folder and reference them in the HTML as:
```html
<img src="assets/images/your-image.png" alt="Description">
```

## Customization

### Update Founder Information

Edit the "Our Founders" section in `index.html` (around line 1100) to add your details:
- Replace `[Founder Name]` with your name
- Add your bio, expertise, and contact information

### Update Sponsor Information

Edit the "Our Sponsors" section (around line 1200) to add sponsor logos and names.

### Modify Colors

The site uses a gradient color scheme. To modify:
- **Primary Gradient**: Blue (#667eea) to Purple (#764ba2)
- **Accent Color**: Orange (#ff8c42)

Edit the CSS variables at the top of `index.html` to change colors site-wide.

## Technology Stack

- Pure HTML/CSS/JavaScript
- No external dependencies
- Mobile-responsive design
- Modern gradient aesthetics

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## License

© 2025 Robotics Club. All rights reserved.
