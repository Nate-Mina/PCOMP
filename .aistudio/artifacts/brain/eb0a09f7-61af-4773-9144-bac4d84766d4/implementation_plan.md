# Overhaul Pure Computers into Coherent Jekyll Project Matching purecomp.net

Rebuild the Pure Computers website into a coherent, production-grade Jekyll project matching the visual branding and identity of [purecomp.net](https://www.purecomp.net). This overhaul replaces the fragmented Google Sites export with clean, semantic Jekyll templates, a dark aesthetic with gold accents, responsive navigation, service cards, and structured Markdown pages.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1:
> - **Template & Styling Strategy**: Clean, modern HTML and CSS matching purecomp.net's visual branding instead of broken Google Sites `.bin` files.
> - **Design Aesthetic**: Deep obsidian/dark theme with metallic gold & amber accents (`#F59E0B`, `#FFD700`), full multi-level navigation, and prominent service cards.
> - **Content Format**: All pages converted into clean Markdown/HTML with YAML front matter in `_pages/` and `_posts/`.

---

## 1. Overview & Core Concept

Pure Computers is a computer hardware, custom builds, IT support, and AI-driven business optimization company serving residential, creator, and commercial clients. The objective is to replace the tangled, 200KB-per-page Google Sites dump with an authentic, lightning-fast Jekyll site for GitHub Pages.

### Target Audience & Persona
- **Gamers & Enthusiasts**: Seeking custom water-cooled rigs, thermal optimization, and high-FPS tuning.
- **Content Creators & Freelancers**: Needing responsive workstations and video/rendering throughput.
- **Small & Medium Businesses**: Requiring IT network setups, remote diagnostics, and AI workflow optimization.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Color Palette (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Deep Obsidian (`#0B0F17`) and Slate Navy (`#111827`).
  - `30% Structural Surfaces`: Dark glass cards (`#161F30` with `1px solid rgba(255,255,255,0.08)`).
  - `10% Accent Budget`: Pure Computers Gold (`#F59E0B` and `#FBBF24`), vibrant yellow accents (`#FFD700`), and subtle ice-blue badges for tech gains.
- **Typography Pairing**:
  - *Headlines & Display*: `Montserrat` / `Plus Jakarta Sans` (bold, tracking-tight, punchy uppercase kickers).
  - *Body Text*: `DM Sans` / `Inter` (15px–16px, 1.6 line height for effortless legibility).
  - *Technical & Metrics*: `Space Mono` / `JetBrains Mono` for hardware specs and performance multipliers.

### Key Sections & Layout Structure
1. **Top Bar Contract (Header)**:
   - Wordmark: Pure Computers logo icon + bold text lockup.
   - Navigation: Home, Get Help Now (dropdown: Computer Help, IT Support), About Us, Services (dropdown: PC Performance, Gaming, AI Tools, Simulation, Fast Tech Support), Referral Program, Contact.
   - Action Button: "Get Free Estimate".
   - Social Bar: Clean, high-resolution icons for Facebook, Instagram, Threads, Beacons, YouTube, and LinkedIn.
2. **Hero Section**:
   - Marquee headline: *"EXCELLENT TECHNIQUES FOR ALL YOUR TECH NEEDS"*
   - Statement: *"Pure uncomplicates work by making your tech as simple as it can be, but not any simpler!"*
   - Interactive CTAs: "Free Consultation" and "Explore Custom Builds".
3. **Core Services Bento-Grid**:
   - Card 1: **Custom Gaming Builds** (hand-tuned rigs, thermal benchmarks, custom cooling).
   - Card 2: **PC Performance Optimization** (*Huge Tech Gains, Small Prices*).
   - Card 3: **Fast Tech Support & IT Networking** (remote & on-site diagnostics).
   - Card 4: **AI Tools & Workflow Automation** (business optimization & productivity).
   - Card 5: **Hardware Diagnostics & Repairs** (fast turnaround for desktops & laptops).
4. **Story & Trust Section**:
   - "Meet Miranda / Revitalizing Pure Computers" narrative spotlighting personal commitment and customer trust.
5. **Interactive Consultation & Estimate Form**:
   - Quick quote request: name, email, device/service type, message, and instant confirmation feedback.
6. **Footer**:
   - Navigation mirrors, operating hours, service coverage, social links, and privacy/terms links.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Replace Google Sites Obfuscated Scripts with Semantic Jekyll Layouts**
  - *Chosen Approach*: Clean semantic HTML5, pure CSS styling (`assets/css/main.css`), and lightweight native JavaScript for dropdowns and mobile menus.
  - *Why*: The original Google Sites files contained over 250KB of obfuscated Google Closure compiler scripts and `.bin` blobs that broke when split. A clean CSS stylesheet restores 100% visual fidelity and loads in under 50ms.
- **Decision 2: Dual Support for GitHub Pages & Local Dev Server**
  - *Chosen Approach*: Write native Jekyll templates (`_layouts`, `_includes`, `_pages`, `_posts`) while powering `server.js` with LiquidJS.
  - *Why*: GitHub Pages natively builds the site with `jekyll build`, while the AI Studio preview environment runs seamlessly on port 3000 with real-time Liquid rendering.
- **Decision 3: Maintain Complete Link Compatibility**
  - *Chosen Approach*: Configure Jekyll permalinks and routes to support both `/pages/about-us.html` and clean URLs like `/about-us/`.
  - *Why*: Guarantees that existing external links, bookmarks, and search references continue to resolve without broken 404s.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                      _config.yml                       │
│    (Collections: pages, posts | Permalinks | Metadata) │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │    _layouts/    │         │   _includes/    │
    │  default.html   │◄────────┤   head.html     │
    │  home.html      │◄────────┤   header.html   │
    │  page.html      │◄────────┤   footer.html   │
    │  post.html      │◄────────┤   nav.html      │
    └────────┬────────┘         └─────────────────┘
             │
   ┌─────────┴─────────┐
   ▼                   ▼
┌─────────────┐  ┌─────────────┐
│   _pages/   │  │   _posts/   │
│ about-us.md │  │ welcome.md  │
│ services.md │  │ tips.md     │
│ ... (20 pgs)│  └─────────────┘
└─────────────┘
```

### Component & File Structure
- **`_config.yml`**: Full Jekyll site configuration, collections, plugins, and front matter defaults.
- **`_layouts/default.html`**: Base shell with `head.html`, `header.html`, `footer.html`, and `{{ content }}`.
- **`_layouts/home.html`**: Layout for landing page hero, bento service cards, testimonial, and estimate form.
- **`_layouts/page.html`**: Standard layout for markdown and content pages.
- **`_layouts/post.html`**: Article layout for blog posts.
- **`_includes/header.html`**: Pure Computers responsive navigation bar, social links, and mobile drawer.
- **`_includes/footer.html`**: Standard footer with copyright, quick links, and contact options.
- **`assets/css/main.css`**: Handcrafted, high-performance CSS replacing the fragmented `.bin` stylesheets.
- **`assets/js/main.js`**: Lightweight navigation toggle, smooth scrolling, and form handler.
- **`_pages/*.md`**: Clean markdown files with front matter for each page (`about-us.md`, `services.md`, `get-help-now.md`, etc.).
- **`_posts/*.md`**: Blog posts with publication dates and categories.
