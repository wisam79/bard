# Bard POS Design System

## 🎨 Color System

### Semantic Colors

#### Primary (Brand)
- Used for: Main actions, navigation, branding
- Light: `--brand-dark: 248 250 252`, `--brand-surface: 255 255 255`
- Dark: `--brand-dark: 5 6 15`, `--brand-surface: 14 16 27`

#### Accent Colors (10 themes)
- Indigo (default): HSL(239, 84%, 67%)
- Blue: HSL(217, 91%, 60%)
- Violet: HSL(263, 70%, 58%)
- Rose: HSL(346, 77%, 50%)
- Emerald: HSL(160, 84%, 39%)
- Amber: HSL(38, 92%, 50%)
- Cyan: HSL(188, 94%, 43%)
- Orange: HSL(25, 95%, 53%)
- Teal: HSL(173, 80%, 40%)
- Pink: HSL(330, 81%, 60%)

#### Status Colors
```css
/* Success */
--success-light: 16 185 129 (emerald-500)
--success-bg-light: rgba(16, 185, 129, 0.1)
--success-bg-dark: rgba(16, 185, 129, 0.15)

/* Warning */
--warning-light: 245 158 11 (amber-500)
--warning-bg-light: rgba(245, 158, 11, 0.1)
--warning-bg-dark: rgba(245, 158, 11, 0.15)

/* Error */
--error-light: 244 63 94 (rose-500)
--error-bg-light: rgba(244, 63, 94, 0.1)
--error-bg-dark: rgba(244, 63, 94, 0.15)

/* Info */
--info-light: 59 130 246 (blue-500)
--info-bg-light: rgba(59, 130, 246, 0.1)
--info-bg-dark: rgba(59, 130, 246, 0.15)
```

### Opacity Scale
Use consistent opacity values for layering:
- `0.03` - Subtle background tint
- `0.05` - Very light overlay
- `0.08` - Light surface overlay
- `0.10` - Standard surface overlay
- `0.15` - Elevated surface
- `0.20` - Strong overlay
- `0.25` - Very strong overlay
- `0.40` - Modal overlay base
- `0.60` - Dark modal overlay
- `0.80` - Near opaque

---

## 📐 Spacing System

### Base Unit: 4px
All spacing should follow the 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps, icon spacing |
| `sm` | 8px | Small gaps, padding |
| `md` | 12px | Medium gaps |
| `lg` | 16px | Standard gaps, section spacing |
| `xl` | 20px | Large gaps |
| `2xl` | 24px | Section dividers |
| `3xl` | 32px | Major sections |
| `4xl` | 40px | Page margins |
| `5xl` | 48px | Layout containers |
| `6xl` | 64px | Hero spacing |
| `7xl` | 80px | Maximum spacing |

---

## 🔤 Typography System

### Font Families
- **Primary (Arabic):** Yamamah, Rubik
- **Monospace:** JetBrains Mono
- **Fallback:** 'Segoe UI', 'Tahoma', sans-serif

### Type Scale

| Size | Value | Line Height | Letter Spacing | Usage |
|------|-------|-------------|----------------|-------|
| `xs` | 10px | 1.4 | 0.05em | Labels, captions, badges |
| `sm` | 12px | 1.5 | 0.025em | Body small, hints |
| `base` | 14px | 1.6 | 0 | Body text, forms |
| `lg` | 16px | 1.6 | -0.01em | Subheadings, card titles |
| `xl` | 20px | 1.4 | -0.02em | Section headings |
| `2xl` | 24px | 1.3 | -0.02em | Page titles |
| `3xl` | 32px | 1.2 | -0.03em | Hero titles |
| `4xl` | 40px | 1.1 | -0.03em | Display text |

### Font Weights
- `400` - Regular (body text)
- `500` - Medium (emphasis)
- `600` - Semibold (labels, small titles)
- `700` - Bold (headings, important text)
- `800` - Extrabold (stat values, key numbers)
- `900` - Black (use sparingly - only for hero numbers)

### Text Colors
- **Primary:** `text-brand-accent` (light) / `text-white` (dark)
- **Secondary:** `text-brand-muted/70` (light) / `text-white/60` (dark)
- **Muted:** `text-brand-muted/50` (light) / `text-white/40` (dark)
- **Disabled:** `text-brand-muted/30` (light) / `text-white/20` (dark)

---

## 📦 Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 8px | Small buttons, badges |
| `md` | 12px | Buttons, inputs, chips |
| `lg` | 16px | Cards, modals |
| `xl` | 20px | Large cards, panels |
| `2xl` | 24px | Hero cards, feature sections |
| `full` | 9999px | Pills, avatars, badges |

---

## 🎬 Animation System

### Duration Scale
- `75ms` - Micro-interactions (button press)
- `100ms` - Fast feedback (hover)
- `150ms` - Standard transitions
- `200ms` - Modal open/close
- `300ms` - Page transitions
- `500ms` - Complex animations
- `700ms` - Entrance animations
- `1000ms` - Background effects

### Easing Functions
- **Default:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- **Entrance:** `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)
- **Exit:** `cubic-bezier(0.4, 0, 0.6, 1)` (accelerating)
- **Bounce:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (elastic)

### Stagger Delays
For list/grid animations:
- Fast: 30ms per item
- Standard: 50ms per item
- Slow: 80ms per item

---

## 🧩 Component Guidelines

### Buttons
- Always include icon + text combination
- Loading state replaces icon with spinner
- Hover: `-translate-y-[1px]` with enhanced shadow
- Active: `scale-[0.97]` for press feedback
- Disabled: `opacity-40` with `cursor-not-allowed`

### Cards
- Always use `backdrop-blur-xl` for glass effect
- Border: `border-brand-border/25` (light) / `border-white/[0.07]` (dark)
- Hover: enhanced border + shadow elevation
- Premium cards: add `premium-shine` class for animated sheen

### Inputs
- Focus: visible ring `focus:ring-2 focus:ring-primary-500/30`
- Error: red border + icon + helper text
- Success: green border (optional validation)
- Disabled: `opacity-50` with no interaction

### Modals
- Overlay: `bg-brand-dark/40` (light) / `bg-black/60` (dark)
- Backdrop blur: `backdrop-blur-md`
- Max height: `max-h-[90vh]`
- Close on: Escape key, overlay click (optional)

### Tables
- Sticky header on scroll
- Row hover: `bg-brand-dark/20` (light) / `bg-white/[0.03]` (dark)
- Striped rows (optional): alternate background
- Border bottom per row: `border-brand-border/10`

---

## 🌗 Dark Mode Guidelines

### Class-based Toggle
- Use `.dark` class on `<html>` element
- All dark styles use `dark:` prefix
- Test both modes during development

### Dark Mode Color Shifts
- Surfaces become darker but maintain contrast
- Borders become lighter (white with low opacity)
- Text becomes white-based instead of dark-based
- Shadows reduce or disappear (use borders instead)

### Glass Morphism in Dark Mode
```css
/* Light mode */
background: rgb(var(--brand-surface) / 0.7);
border-color: rgb(var(--brand-border) / 0.45);

/* Dark mode */
background: rgb(var(--brand-surface) / 0.55);
border-color: rgb(var(--brand-border) / 0.5);
box-shadow: 0 8px 32px -8px rgba(0,0,0,0.35);
```

---

## ♿ Accessibility Standards

### Contrast Ratios (WCAG AA)
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- UI components: 3:1 minimum

### Focus Indicators
- All interactive elements must have visible focus
- Default: `focus:ring-2 focus:ring-primary-500/30`
- Never use `focus:outline-none` without alternative

### Keyboard Navigation
- Tab order: logical left-to-right, top-to-bottom
- Arrow keys: for list/grid navigation
- Escape: close modals, clear search
- Enter/Space: activate buttons, submit forms

### Screen Readers
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add `aria-label` for icon-only buttons
- Use `aria-live` for dynamic content updates
- Provide `role` attributes for custom components

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Responsive Grid Patterns
- Mobile: 1 column
- Tablet (`md`): 2 columns
- Desktop (`lg`): 3-4 columns
- Large (`xl`): 4-6 columns

---

## 🎯 Design Principles

1. **Clarity First** - Content should be instantly readable and understandable
2. **Consistency** - Same patterns, same results across the app
3. **Hierarchy** - Guide the eye with size, color, and spacing
4. **Feedback** - Every action gets a visible response
5. **Delight** - Subtle animations that feel premium, not gimmicky
6. **Performance** - Fast, smooth, no jank
7. **Accessibility** - Works for everyone, in all conditions

---

*Last updated: أبريل 2026*
*Version: 1.0.0*
