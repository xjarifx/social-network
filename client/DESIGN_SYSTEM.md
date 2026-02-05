# Social Media Frontend Design System

A modern, minimalist social media UI built with React, TypeScript, Tailwind CSS, and Framer Motion. Designed with a premium feel, clean layout, and smooth animations.

## 🎨 Design Philosophy

**"Apple meets Linear meets Twitter"** – Fast, calm, and polished.

### Core Principles

- **Minimalism** – Only essential UI elements, maximum white space
- **Premium Feel** – Soft shadows, rounded corners, quality typography
- **Responsive** – Mobile-first, works beautifully on all screens
- **Motion-Aware** – Subtle, purposeful animations at key interactions
- **Accessibility** – High contrast, clear hierarchy, semantic HTML

## 🎬 Color Palette

### Neutral Base

```
Background:     #fafafa (off-white)
Surface:        #ffffff (white)
Border:         #e8e8e8 (light gray)
Text Primary:   #171717 (near-black, not pure black)
Text Secondary: #737373 (muted gray)
Text Tertiary:  #a1a1a1 (light gray)
```

### Primary Accent

```
Accent-500:     #22c55e (muted green)
Accent-600:     #16a34a (darker green)
Accent-50:      #f0fdf4 (lightest accent)
```

## 🔤 Typography

**Font Family:** Inter, SF Pro Display, system-ui, sans-serif

### Type Scale

- **Display/Headings:** Bold 24-30px, tight line-height
- **Body Large:** 16px, relaxed line-height (24px)
- **Body Base:** 14px, comfortable line-height (20px)
- **Small/Caption:** 12px, condensed line-height (16px)

**Key:** Clear visual hierarchy. Headings are bold and prominent. Body text breathes with comfortable spacing.

## 🔲 Spacing System

Consistent 4px base unit:

- `4px` (xs), `8px` (sm), `12px` (md), `16px` (lg), `20px` (xl), `24px` (2xl), `32px` (3xl)

### Component Spacing

- **Card Padding:** 20-24px (responsive)
- **Button Padding:** 8-12px vertical, 16-20px horizontal
- **Between Elements:** 16-24px vertical, 8-16px horizontal
- **Grid Gap:** 16-24px

## 🎭 Component Library

### Navigation

- **Style:** Sticky/floating top bar with glassmorphism backdrop blur
- **Behavior:** Smooth fade-in on load, subtle nav item transitions
- **Desktop:** Full nav with icons + labels
- **Mobile:** Icon-only nav with hamburger menu

### Post Card

- **Layout:** Vertical card with media, content, interaction buttons
- **Interaction:**
  - Hover: Subtle lift (transform 2px up) + border/shadow change
  - Like: Heart fills with animation bounce
  - Action buttons: Micro-scale on hover (1.1x)
- **Responsive:** Adapts button labels for mobile

### Feed

- **Layout:** Vertical stack of posts with 16px gap
- **Loading:** Pulsing skeleton loader
- **Empty State:** Friendly icon + message
- **Animation:** Staggered entry (0.1s between items)

### Sidebar

- **Content:** Search bar, trending trends, suggested communities
- **Sticky:** Can be made sticky at specific breakpoints
- **Interactions:** Hover state on trend items (subtle background change)
- **Responsive:** Hidden on mobile, shown on tablet+

### Compose Modal

- **Trigger:** FAB button (mobile) or "Create Post" button (desktop)
- **Animation:** Scale + fade entry, scale + fade exit
- **Features:** Character count (optional), media picker, emoji picker
- **Backdrop:** Semi-transparent (40% black) with click-to-close

## ⚡ Motion & Animation

### Timing

- **Fast:** 200ms (micro-interactions, hover states)
- **Medium:** 300ms (modal transitions, page changes)
- **Slow:** 400ms+ (complex animations, staggered sequences)

### Easing

Default: `ease-out` for snappy, responsive feel

### Animation Types

**Entrance:**

- Fade In: opacity 0→1
- Slide Up: translate -8px→0, opacity 0→1
- Scale In: scale 0.95→1, opacity 0→1

**Hover/Interaction:**

- Scale: 1→1.05 on hover, 1→0.95 on active
- Background: color-only transition
- Shadow: opacity-based shadow transition

**Exit:**

- Reverse of entrance
- Shorter duration (200ms vs 300ms)

### Stagger Pattern

- Feed items: 0.1s between each (0.2s start delay)
- Modal actions: 0.05s between items

## 📱 Responsive Design

### Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px – 1024px (md)
- **Desktop:** > 1024px (lg)

### Grid Layout

- **Mobile:** 1 column (feed full width)
- **Tablet:** 2 columns (feed 2/3, compact sidebar)
- **Desktop:** 3+ columns (feed 2/3, full sidebar)

## 🎯 Interactive States

### Buttons

- **Default:** Resting color
- **Hover:** 5% lighter background, slight scale up (1.05)
- **Active:** Scale down (0.95), tactile feedback
- **Disabled:** 50% opacity, cursor not-allowed

### Input Fields

- **Default:** Gray border, white background
- **Focus:** Green border, ring shadow (low opacity)
- **Error:** Red border (optional)

### Cards

- **Default:** Soft shadow, subtle border
- **Hover:** Enhanced shadow, darker border
- **Active:** Border color change

## 📦 Component File Structure

```
components/
├── Navigation.tsx      # Top sticky nav bar
├── PostCard.tsx        # Individual post component
├── Feed.tsx            # Feed container with staggered animations
├── Sidebar.tsx         # Trends and suggestions sidebar
├── ComposeModal.tsx    # Create/edit post modal
└── index.ts            # Component exports
```

## 🔧 Key Dependencies

- **React 19** – UI framework
- **TypeScript** – Type safety
- **Tailwind CSS 4** – Utility-first styling
- **Framer Motion 11** – Animation library
- **Lucide React** – Icon library (24x24, clean outline icons)

## 🚀 Getting Started

```bash
cd client
npm install --legacy-peer-deps
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
```

## 💡 Design Tokens

### Rounded Corners

- `8px` – Small (inputs, small buttons)
- `12px` – Medium (cards, larger buttons)
- `16px` – Large (modals, hero sections)
- `20px` – XL (brand elements)

### Shadows

- **xs:** 0 1px 2px, 5% opacity
- **sm:** 0 1px 3px, 8% opacity
- **md:** 0 4px 6px, 8% opacity
- **lg:** 0 10px 15px, 8% opacity
- **xl:** 0 20px 25px, 8% opacity

### Transitions

- **Color/Background:** 200ms ease-out
- **Transform/Opacity:** 200-300ms ease-out
- **All:** 200ms ease-out (for complex transitions)

## 🎪 Example Usage

See [App.tsx](src/App.tsx) for a complete working example with:

- Navigation bar
- Post feed with sample data
- Compose modal
- Trending sidebar
- Mobile floating action button

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Skeleton screens for loading states
- [ ] Infinite scroll with virtualization
- [ ] Image upload preview
- [ ] Real-time notifications toast
- [ ] Thread/conversation views
- [ ] User profile cards
- [ ] Advanced search with filters

---

Built with ❤️ for modern, delightful user experiences.
