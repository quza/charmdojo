# CharmDojo Brand Colors Update

**Date**: October 24, 2025  
**Status**: Complete

---

## Color Scheme Change

The CharmDojo brand colors have been updated to match the new design direction shown in the reference screenshot.

### Old Color Scheme (Original)

- **Primary**: `#FF7158` (Orange)
- **Secondary**: `#FD2B7B` (Magenta)
- **Neutral**: `#424242` (Gray)

### New Color Scheme (Current)

- **Background**: `#04060c` (Dark blue-black)
- **Headlines/Big Text**: `#e15f6e` (Coral-Pink)
- **Body Text**: `#ffffff` (White)
- **Gradient Color 1**: `#f53049` (Bright Red-Pink)
- **Gradient Color 2**: `#f22a5a` (Magenta-Pink)

---

## Usage Guidelines

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#04060c` | Main app background, dark sections |
| **Coral-Pink** | `#e15f6e` | Headlines, primary CTAs, important text |
| **White** | `#ffffff` | Body text, subtitles, descriptions |

### Gradient Colors

Used for borders, frames, buttons, and decorative elements:

- **Gradient 1**: `#f53049` → `#f22a5a` (Primary gradient)
- Reverse gradient: `#f22a5a` → `#f53049` (Alternative)

### Implementation in Tailwind

```typescript
colors: {
  primary: {
    DEFAULT: '#e15f6e', // Coral-Pink (Headlines)
    light: '#ef8391',
    dark: '#c73d4f',
  },
  secondary: {
    DEFAULT: '#f53049', // Bright Red-Pink (Gradient 1)
    light: '#ff5a70',
    dark: '#d91c38',
  },
  accent: {
    DEFAULT: '#f22a5a', // Magenta-Pink (Gradient 2)
    light: '#ff4d79',
    dark: '#d11545',
  },
  neutral: {
    DEFAULT: '#04060c', // Dark Background
    900: '#04060c',
  },
}
```

### CSS Variables (HSL Format)

```css
:root {
  --background: 215 50% 3%; /* #04060c */
  --foreground: 0 0% 100%; /* #ffffff */
  --primary: 354 65% 63%; /* #e15f6e */
  --secondary: 352 90% 58%; /* #f53049 */
  --accent: 346 87% 56%; /* #f22a5a */
}
```

---

## Documents Updated

- ✅ `PRPs/PRD-v1.md` - Product Requirements Document
- ✅ `PRPs/IMPLEMENTATION-PLAN-v1.md` - Implementation Plan

### Specific Changes Made

1. **PRD (PRD-v1.md)**:
   - Line 1018: Updated color scheme specification
   - Line 1032-1034: Added detailed color usage notes for landing page

2. **Implementation Plan (IMPLEMENTATION-PLAN-v1.md)**:
   - Lines 621-646: Updated Tailwind color configuration
   - Lines 745-797: Updated CSS variables for both light and dark modes
   - Line 835: Updated reference note with new colors

---

## Visual Reference

The new color scheme creates a **dark, modern aesthetic** with **vibrant red-pink accents** that stand out against the near-black background. This matches current dating app trends (e.g., Tinder's recent updates) and provides better contrast for readability.

### Color Psychology

- **Dark Background**: Creates intimacy, focus, and sophistication
- **Coral-Pink Headlines**: Draws attention, conveys energy and romance
- **White Text**: Maximum readability against dark background
- **Red-Pink Gradients**: Creates visual interest, reinforces brand identity

---

## Next Steps

When implementing Phase 0 of the project, developers should use these new colors in:

1. `tailwind.config.ts` configuration
2. `src/app/globals.css` CSS variables
3. Landing page hero gradient
4. Button styles and CTAs
5. All UI components from shadcn/ui

---

**Note**: This color scheme is now the official CharmDojo brand identity and should be used consistently across all materials, marketing, and product implementation.

