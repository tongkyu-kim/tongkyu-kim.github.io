# Academic CV Website — Replication Package

A static, single-page academic CV website built with plain HTML, CSS, and vanilla JavaScript. No build tools or frameworks required. Designed for researchers and academics who want a clean, professional online CV with interactive popups, icon badges, and GitHub Pages hosting.

---

## Quick Start

```bash
# 1. Fork or clone this repository
git clone https://github.com/tongkyu-kim/tongkyu-kim.github.io.git
cd tongkyu-kim.github.io

# 2. Serve locally
python3 -m http.server 8000
# or
npm start

# 3. Open in browser
# http://localhost:8000
```

To publish, push to the `main` branch of a GitHub repository named `<your-username>.github.io`. GitHub Pages deploys automatically.

---

## File Structure

```
/
├── index.html              # All CV content lives here
├── src/
│   ├── css/
│   │   └── popup.css       # Icon badges + popup modal styles
│   ├── js/
│   │   └── popup.js        # PopupManager class (all interactive logic)
│   ├── icons/              # Organization logos for popup headers
│   ├── images/
│   │   └── profile.JPG     # Profile photo
│   └── pdf/                # Linked PDF documents
├── CNAME                   # Custom domain (remove if not using one)
├── package.json            # Optional: only used for `npm start`
└── README.md
```

---

## Sections

All content is in `index.html`. The page has six `<section>` elements with corresponding navbar anchors:

| Section ID    | Content |
|---------------|---------|
| `profile`     | Photo, name, social links, bio paragraphs |
| `education`   | Degrees and certificates |
| `experience`  | Professional and other experience |
| `publications`| Peer-reviewed articles, policy papers, working papers |
| `projects`    | Government, bilateral/multilateral, and corporate projects |
| `outreach`    | Conferences, speaking engagements |

---

## Table Structure

Two table classes are used throughout the site:

### Numbered tables (Publications, Projects, Outreach)
```html
<table class="numbered-table">
  <tr>
    <td class="number-col">1.</td>
    <td class="content-col">Author (Year), Title, <em>Journal</em>
      <a href="https://doi.org/..."><span class="doi-icon"></span></a>
      <span class="popup-icon"></span>
    </td>
  </tr>
</table>
```
The `PopupManager` automatically appends a popup icon to every `.content-col` in numbered tables.

### Non-numbered tables (Education, Experience)
```html
<table class="numbered-table no-numbers">
  <tr>
    <td class="content-col">-&nbsp;&nbsp;&nbsp;&nbsp;Role | Department, Organization</td>
    <td class="date-col">Jan. 2024–Present</td>
    <td class="icon-col">
      <a href="https://org-website.com" target="_blank"><span class="web-icon"></span></a>
      <span class="popup-icon" data-popup-title="Display Title" data-popup-logo="src/icons/logo.png"></span>
    </td>
  </tr>
</table>
```
Icons in the `.icon-col` are placed manually in the HTML.

---

## Icon System

Six icon badge types are defined in `src/css/popup.css`:

| Class | Color | Label | Usage |
|-------|-------|-------|-------|
| `.web-icon` | Blue `#5b92e5` | `web` | External link to an organization or project page |
| `.doi-icon` | Navy `#15234A` | `doi` | Direct link to a published paper via DOI |
| `.rev-icon` | Blue `#5b92e5` | `pre` | Link to a preprint / paper under review |
| `.news-icon` | Green `#accc4c` | `news` | Link to a news article about the work |
| `.popup-icon` | Grey `#5e717d` | `info` | Opens an info popup with additional details |
| `.list-icon` | Rosybrown `#BC8F8F` | `list` | Opens a popup showing a listed table (e.g. journal list) |

All icons are `26×13px` pill-shaped inline badges with hover effects.

### Wrapping icons in links
```html
<!-- Clickable link icon -->
<a href="https://doi.org/10.xxxx/xxxx" target="_blank" rel="noopener noreferrer">
  <span class="doi-icon"></span>
</a>

<!-- Popup trigger (no anchor needed) -->
<span class="popup-icon"></span>
```

---

## Popup System

All popup logic is in `src/js/popup.js` via the `PopupManager` class, initialized on `DOMContentLoaded`.

### How popups are triggered

**In numbered tables** (publications/projects): `PopupManager` auto-attaches a click handler to every `.content-col`. It calls `getPublicationContent(title)` with the cell's text content.

**In no-numbers tables** (education/experience): click handlers are attached to existing `.popup-icon` and `.list-icon` elements found in each row's `.icon-col`.

### Popup header attributes

Two `data-*` attributes on `.popup-icon` control the popup header:

```html
<!-- Override the title shown at the top of the popup -->
<span class="popup-icon" data-popup-title="M.A. in Environmental Policy"></span>

<!-- Show an organization logo above the title -->
<span class="popup-icon"
  data-popup-title="M.A. in Environmental Policy"
  data-popup-logo="src/icons/HYU.svg.png">
</span>
```

### Special popup types

For popups with large fixed content (e.g. a multi-day program schedule), use `data-popup-type`:

```html
<span class="popup-icon" data-popup-type="hgsm-study-tour"></span>
```

Add a matching `case` in `handleSpecialPopup(popupType)` in `popup.js`:

```js
case 'your-popup-type':
  this.showPopup('Title', `<p>Your HTML content here</p>`);
  break;
```

### Adding content for experience entries

Experience popup content is returned by `getExperienceContent(title)` in `popup.js`. The lookup key is the full pipe-formatted role string as it appears in the HTML, with non-breaking spaces normalized:

```js
const experiences = {
  'Role | Department, Organization': `
    <h3>Overview</h3>
    <p>...</p>
    <h3>Key Responsibilities</h3>
    <ul><li>...</li></ul>
  `,
  // add more entries here
};
```

Similarly, `getCertificateContent(title)` handles education popups and `getListContent(title)` handles list popups.

### List popups (`.list-icon`)

```html
<span class="list-icon" data-popup-title="Journal List"></span>
```

Add content in `getListContent(cleanTitle)`:

```js
const lists = {
  'Ad hoc Peer Reviewer': `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="background-color:#5e717d;color:white;...">Journal</th>
          <th style="background-color:#5e717d;color:white;...">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Journal Name</td><td>Jun. 2026</td></tr>
      </tbody>
    </table>
  `
};
```

---

## Adding Organization Logos to Popups

1. Place your logo PNG in `src/icons/`.
2. Add `data-popup-logo="src/icons/YourLogo.png"` to the `.popup-icon` span.
3. Control the display size in `popup.css` using a CSS attribute selector:

```css
/* Default size for all logos */
.popup-logo {
  width: 98px;
  height: auto;
  object-fit: contain;
}

/* Per-logo overrides */
.popup-logo[src="src/icons/YourLogo.png"] {
  width: 120px;
}
```

Wide horizontal logos (e.g. banners) work best at 130–150px. Square/near-square logos (emblems, seals) work best at 50–90px.

---

## Color Variables

Key colors are referenced throughout. To change the palette, update these values:

| Variable / Value | Usage |
|-----------------|-------|
| `var(--navy-dark)` | Headings, strong text |
| `var(--border)` | Table borders, dividers |
| `var(--muted)` | Secondary text, italic labels |
| `var(--bg)` | Popup background |
| `#5e717d` | Nav text, popup title underline, table headers |
| `#15234A` | DOI icon, popup title text accent |
| `#5b92e5` | Web/pre icon |
| `#accc4c` | News icon |
| `#BC8F8F` | List icon |

---

## Customization Checklist

When replicating for your own CV:

- [ ] Replace `src/images/profile.JPG` with your photo
- [ ] Update name, title, and social links in the `#profile` section
- [ ] Update `CNAME` with your custom domain, or delete the file
- [ ] Replace bio paragraphs in `#profile`
- [ ] Update education entries and certificate entries in `#education`
- [ ] Update experience entries in `#experience` and add popup content in `getExperienceContent()` / `getCertificateContent()`
- [ ] Replace publications in `#publications`
- [ ] Replace projects in `#projects`
- [ ] Replace outreach entries in `#outreach`
- [ ] Add your organization logos to `src/icons/` and register sizes in `popup.css`
- [ ] Update `README.md`

---

## Deployment

Push to `main` on a repository named `<your-username>.github.io`. GitHub Pages will serve `index.html` at `https://<your-username>.github.io` automatically. No CI configuration needed.

For a custom domain, update the `CNAME` file and configure your DNS provider to point to GitHub Pages.

---

## Browser Compatibility

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

© 2026 Tongkyu Kim. All rights reserved.
