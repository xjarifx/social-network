# Social Network Frontend

A modern, minimalist social media UI built with React, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Responsive Design** – Mobile-first, works on all screen sizes
- **Smooth Animations** – Frame Motion-powered micro-interactions
- **Modern Components** – Pre-built, ready-to-use UI components
- **Premium Aesthetic** – Clean layout with refined typography and spacing
- **Type Safe** – Full TypeScript support
- **Accessible** – High contrast, semantic HTML, keyboard-friendly
- **Tailwind CSS** – Utility-first styling for rapid development

## 🚀 Quick Start

### Installation

```bash
npm install --legacy-peer-deps
```

(Note: `--legacy-peer-deps` is needed because lucide-react hasn't fully adopted React 19. You can omit this flag in newer versions once lucide-react updates its peer dependencies.)

### Development

```bash
npm run dev
```

Opens the dev server at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 Components

### Navigation

Sticky top bar with navigation items and actions.

```tsx
import { Navigation } from "./components";

export default function App() {
  return (
    <>
      <Navigation />
      {/* rest of app */}
    </>
  );
}
```

### Feed

Container for displaying posts with staggered animations.

```tsx
import { Feed } from "./components";
import type { PostProps } from "./components";

const posts: PostProps[] = [
  {
    id: "1",
    author: { name: "Alex", handle: "alex", avatar: "url" },
    content: "Hello world!",
    timestamp: "2h ago",
    likes: 10,
    replies: 2,
    reposts: 1,
  },
  // ... more posts
];

export default function App() {
  return <Feed posts={posts} onLike={handleLike} />;
}
```

### PostCard

Individual post component with like, reply, and share actions.

```tsx
import { PostCard } from "./components";
import type { PostProps } from "./components";

const post: PostProps = {
  id: "1",
  author: { name: "Alex", handle: "alex", avatar: "url" },
  content: "Great content!",
  image: "optional-image-url",
  timestamp: "2h ago",
  likes: 42,
  replies: 5,
  reposts: 3,
  liked: false,
};

export default function App() {
  return <PostCard {...post} onLike={handleLike} />;
}
```

### ComposeModal

Modal for creating/editing posts.

```tsx
import { ComposeModal } from "./components";
import { useState } from "react";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Post</button>
      <ComposeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(content) => console.log(content)}
        userName="Your Name"
        userAvatar="avatar-url"
      />
    </>
  );
}
```

### Sidebar

Sidebar with trending topics and search.

```tsx
import { Sidebar } from "./components";
import type { TrendingItem } from "./components";

const trends: TrendingItem[] = [
  { id: "1", category: "Technology", title: "#ReactJS", count: 234000 },
  { id: "2", category: "Design", title: "#UIDesign", count: 156000 },
];

export default function App() {
  return <Sidebar trends={trends} showSearch={true} />;
}
```

## 🎨 Design System

Complete design system documentation is available in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

### Color Palette

- **Neutral Base:** #fafafa (bg), #171717 (text)
- **Primary Accent:** #22c55e (green)
- **Soft Shadows & Rounded Corners** – 12-20px border radius

### Typography

- **Font:** Inter, SF Pro Display, system-ui
- **Clear Hierarchy:** Bold headers, comfortable body text
- **Line Height:** 24px (body), tight for headers

### Spacing

- **Base Unit:** 4px
- **Card Padding:** 20-24px
- **Component Gap:** 16-24px

### Motion

- **Default Duration:** 200-300ms
- **Easing:** `ease-out`
- **Types:** Fade-in, slide-up, scale-in
- **Stagger:** 0.1s between items (feeds)

## 🔧 Customization

### Color Customization

Edit [tailwind.config.js](tailwind.config.js) to change the color palette:

```javascript
colors: {
  accent: {
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Darker green
  },
  // ... neutral colors
}
```

### Typography Customization

Update font family and size scales in [tailwind.config.js](tailwind.config.js):

```javascript
fontFamily: {
  sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
}
fontSize: {
  base: ['16px', { lineHeight: '24px' }],
  // ... other sizes
}
```

### Animation Tweaks

Modify animation timing in [src/index.css](src/index.css):

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(8px); /* Change from 8px to 16px for more movement */
  }
}
```

Or adjust Framer Motion props in component files:

```tsx
<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

## 📱 Responsive Breakpoints

- **Mobile:** < 640px (1 column)
- **Tablet:** 640px – 1024px (2 columns)
- **Desktop:** > 1024px (3 columns)

All components adapt automatically using Tailwind's responsive prefixes:

```tsx
<div className="md:col-span-2 lg:col-span-3">
  {/* Changes layout across screens */}
</div>
```

## 🎯 Mobile Optimization

- **Simplified Navigation:** Icon-only nav on mobile with dropdown menu
- **Floating Action Button:** FAB replaces desktop "Create Post" button
- **Responsive Typography:** Smaller font sizes on mobile
- **Touch-Friendly:** 44px minimum touch targets
- **Optimized Images:** Load appropriate resolution based on device

## 🧪 Testing

The project uses TypeScript for type safety. Run type checking:

```bash
npm run build  # Includes TypeScript checking
```

For linting:

```bash
npm run lint
```

## 📚 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx     # Top navigation bar
│   │   ├── PostCard.tsx       # Individual post
│   │   ├── Feed.tsx           # Feed container
│   │   ├── Sidebar.tsx        # Trends sidebar
│   │   ├── ComposeModal.tsx   # Create post modal
│   │   └── index.ts           # Component exports
│   ├── App.tsx                # Main app with example layout
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── vite.config.ts             # Vite config
├── tailwind.config.js         # Tailwind config
├── tsconfig.json              # TypeScript config
├── eslint.config.js           # ESLint config
├── DESIGN_SYSTEM.md           # Design documentation
└── README.md                  # This file
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Outputs optimized files to `./dist/`

### Deploy to Vercel/Netlify

Both platforms automatically detect Vite projects:

```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📖 Learning Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React 19 Docs](https://react.dev)
- [Lucide Icons](https://lucide.dev)

## 🐛 Troubleshooting

### Dependencies Installation Error

If you see peer dependency warnings, use:

```bash
npm install --legacy-peer-deps
```

### Tailwind Classes Not Working

Clear cache and rebuild:

```bash
rm -rf node_modules dist
npm install --legacy-peer-deps
npm run build
```

### Port Already in Use

Change the port in `vite.config.ts`:

```typescript
export default defineConfig({
  server: { port: 3000 },
});
```

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Suggestions for component improvements? Feel free to extend the design system!

---

**Built with ❤️ for modern, polished user experiences.**
