# 🎨 Animation Quick Reference

## Common Animation Patterns

### 1. Fade In on Scroll
```jsx
<div className="scroll-reveal">
  Your content here
</div>
```

### 2. Staggered Grid Items
```jsx
<div className="cars-grid">
  {items.map((item, index) => (
    <div key={item.id} className="scroll-reveal">
      <ItemCard item={item} />
    </div>
  ))}
</div>
```

### 3. Hover Glow Button
```css
.my-button {
  transition: all 0.4s var(--ease-porsche);
}

.my-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3),
              0 0 20px rgba(102, 126, 234, 0.4);
}
```

### 4. Card Hover Elevation
```css
.my-card {
  transition: all 0.4s var(--ease-porsche);
}

.my-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}
```

### 5. Image Zoom on Hover
```css
.image-container {
  overflow: hidden;
}

.image-container img {
  transition: transform 0.6s var(--ease-porsche);
}

.image-container:hover img {
  transform: scale(1.08);
}
```

### 6. Underline Hover Effect
```css
.link {
  position: relative;
}

.link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s var(--ease-porsche);
}

.link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### 7. Glassmorphism Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
  transition: all 0.5s var(--ease-porsche);
}

.glass-card:hover {
  backdrop-filter: blur(35px) saturate(200%);
  transform: translateY(-8px);
}
```

### 8. Ripple Effect Button
```css
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s var(--ease-smooth),
              height 0.6s var(--ease-smooth);
}

.ripple-button:hover::before {
  width: 300px;
  height: 300px;
}
```

---

## Timing & Easing Variables

```css
/* Durations */
--anim-duration-fast: 0.3s;
--anim-duration-normal: 0.6s;
--anim-duration-slow: 0.8s;
--anim-duration-hero: 1.2s;

/* Easing Functions */
--ease-porsche: cubic-bezier(0.22, 0.61, 0.36, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Usage:
```css
transition: all var(--anim-duration-normal) var(--ease-porsche);
```

---

## JavaScript Integration

### Basic Setup
```javascript
import { initAllScrollAnimations } from '../utils/scrollAnimations';

useEffect(() => {
  const cleanup = initAllScrollAnimations();
  return () => cleanup && cleanup();
}, []);
```

### Individual Functions
```javascript
import {
  initScrollReveal,
  initNavbarScroll,
  initStaggeredReveal
} from '../utils/scrollAnimations';

useEffect(() => {
  // Basic scroll reveal
  initScrollReveal('.scroll-reveal');
  
  // Navbar effect  
  initNavbarScroll('.navbar', 50);
  
  // Staggered grid
  initStaggeredReveal('.grid-container', '.grid-item');
}, []);
```

---

## Accessibility - Always Include!

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Mobile Responsive Patterns

```css
/* Desktop: Full animation */
.element {
  transform: translateY(50px);
  transition: all 0.6s var(--ease-porsche);
}

/* Mobile: Reduced animation */
@media (max-width: 768px) {
  .element {
    transform: translateY(30px);
    transition: all 0.4s var(--ease-porsche);
  }
}
```

---

## Performance Tips

✅ **DO:**
- Animate `transform` and `opacity` only
- Use CSS variables for consistent timing
- Implement `prefers-reduced-motion`
- Use Intersection Observer for scroll triggers

❌ **DON'T:**
- Animate `width`, `height`, `top`, `left`
- Use too many simultaneous animations
- Forget mobile optimization
- Ignore accessibility

---

## Common Combinations

### Premium Card
```css
.premium-card {
  transition: all 0.4s var(--ease-porsche);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.premium-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}

.premium-card img {
  transition: transform 0.6s var(--ease-porsche);
}

.premium-card:hover img {
  transform: scale(1.08);
}
```

### Hero Text Sequence
```css
.hero-badge {
  animation: fadeInScale 0.8s var(--ease-porsche) 0.1s both;
}

.hero-title {
  animation: fadeInUp 1.2s var(--ease-porsche) 0.5s both;
}

.hero-description {
  animation: fadeInUp 1.2s var(--ease-porsche) 0.9s both;
}
```

### Navbar Scroll Effect
```css
.navbar {
  transition: all 0.4s var(--ease-porsche);
  background: white;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

---

## Testing Checklist

- [ ] Animations work on page load
- [ ] Scroll reveals trigger correctly
- [ ] Hover states are smooth
- [ ] Reduced motion is respected
- [ ] Mobile animations are appropriate
- [ ] No performance issues
- [ ] All browsers tested

---

**Quick Tip:** Start with subtle animations and increase only if needed. Porsche's elegance comes from restraint!
