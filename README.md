# Las Vegas Robotics Community Website

🤖 Official website for Las Vegas Robotics - Building the future of robotics in Nevada

## 🌟 About

Las Vegas Robotics is a community of robotics enthusiasts, engineers, students, and professionals dedicated to advancing robotics education and innovation in Southern Nevada. We host regular meetups, workshops, and programs that connect students with real-world opportunities in the robotics industry.

## 🎯 Our Programs

- **Fellowship Program** - Connecting high school FIRST Robotics students with paid internships
- **Community Workshops** - Hands-on learning for all skill levels
- **Competition Support** - Mentorship and resources for FIRST Robotics teams
- **Networking Events** - Monthly meetups featuring industry speakers

## 🚀 Quick Start

### View the Website

Visit our live site at: [lvrobotics.org](https://lvrobotics.org)

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/ugobe007/LV-Robotics.git
cd LV-Robotics
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

That's it! The website is a single HTML file with embedded CSS and JavaScript.

## 📁 Project Structure

```
LV-Robotics/
├── index.html          # Main website file
├── README.md           # This file
├── CONTRIBUTING.md     # Contribution guidelines
└── assets/             # Images, logos, and media
    ├── images/
    └── logos/
```

## 🎨 Customization

### Updating Events

Edit the events section in `index.html` (around line 400):
```html
<div class="event-card">
    <span class="event-date">🚀 Date • Time</span>
    <h3>Event Title</h3>
    <p>Event description...</p>
    <!-- ... -->
</div>
```

### Updating News

Edit the news section in `index.html` (around line 500):
```html
<div class="news-card">
    <div class="news-image">🏅</div>
    <div class="news-content">
        <h3>News Title</h3>
        <p>News description...</p>
    </div>
</div>
```

### Changing Colors

The site uses a purple/blue gradient theme. To customize colors, look for these CSS variables in the `<style>` section:
- Primary gradient: `#667eea` to `#764ba2`
- Background: `#0f0c29`, `#302b63`, `#24243e`

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing a typo, adding an event, or improving the design, your help is appreciated.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌐 Deployment

### GitHub Pages (Recommended)

1. Go to repository Settings
2. Navigate to Pages section
3. Select Source: `main` branch
4. Save - your site will be live at `ugobe007.github.io/LV-Robotics`

### Custom Domain Setup

To use `lvrobotics.org`:

1. Add a `CNAME` file with content: `lvrobotics.org`
2. Update your DNS settings:
   - Add a CNAME record pointing to `ugobe007.github.io`
   - Or use A records pointing to GitHub's IPs

See [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for details.

## 📱 Connect With Us

- **Meetup**: [Las Vegas Robotics Meetup](https://www.meetup.com/las-vegas-robotics-meetup/)
- **Website**: [lvrobotics.org](https://lvrobotics.org)
- **GitHub**: [@ugobe007/LV-Robotics](https://github.com/ugobe007/LV-Robotics)

## 📄 License

This project is open source and available for community use and modification.

## 🙏 Acknowledgments

- All LV Robotics community members and volunteers
- FIRST Robotics teams in Southern Nevada
- Our Fellowship Program partner companies
- Desert Research Institute for hosting our events

---

**Built with ❤️ by the Las Vegas Robotics Community**

*Last Updated: October 2025*
