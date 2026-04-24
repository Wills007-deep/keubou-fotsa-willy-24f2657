---
name: Agricultural Intelligence Visual Language
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#404943'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#2b694d'
  on-secondary: '#ffffff'
  secondary-container: '#b0f1cc'
  on-secondary-container: '#327053'
  tertiary: '#274f3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f6754'
  on-tertiary-container: '#b8e3cb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#b0f1cc'
  secondary-fixed-dim: '#94d4b1'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#0c5136'
  tertiary-fixed: '#c1ecd4'
  tertiary-fixed-dim: '#a5d0b9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#274e3d'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is engineered to bridge the gap between high-precision data science and the practical, tactile nature of modern agriculture. The aesthetic direction is **Corporate Modern** with a strong emphasis on legibility and ease of use in high-glare, outdoor environments. 

The brand personality is authoritative yet approachable—evoking feelings of growth, stability, and technological sophistication. By combining a clean, off-white foundation with deep botanical greens and structural petrol blues, the interface establishes immediate trust for enterprise stakeholders while remaining intuitive for operators in the field. The visual language prioritizes clarity and high-quality "airy" white space to reduce cognitive load during complex data analysis.

## Colors

The palette is rooted in the natural lifecycle of agricultural production. 

- **Surface (#F8F9FA):** A slightly cooled off-white that minimizes screen glare compared to pure white, serving as the primary canvas for all dashboard elements.
- **Primary Accent (#2D6A4F):** A vibrant Emerald Green used specifically for success states, primary actions, and validated data points. It represents healthy yields and positive growth.
- **Structure & Typography (#1B4332):** This Deep Petrol Blue provides the necessary weight for navigation bars and high-hierarchy text, ensuring professional rigor and legibility.
- **Secondary/Hover (#95D5B2):** A Fresh Mint designed for subtle differentiations, such as chart containers, secondary button backgrounds, or hover states.
- **Error State (Coral):** A warm, high-visibility hue that contrasts sharply against the green-centric palette to alert users to critical issues or field anomalies.

## Typography

This design system utilizes **Plus Jakarta Sans** for its modern, geometric construction and exceptional readability. The "airy" feel is achieved through generous line heights (1.6x for body text) and subtle negative letter spacing on headlines to maintain a tight, professional look.

Hierarchy is strictly enforced to guide the user through dense data. Headlines use the Deep Petrol Blue (#1B4332) for maximum authority, while secondary labels utilize increased letter spacing and semi-bold weights to ensure they remain legible even on smaller mobile displays used in the field.

## Layout & Spacing

The system employs a **Fluid Grid** model optimized for mobile-first deployment. A base unit of 8px dictates the rhythm of the layout. 

- **Mobile:** 4-column grid with 20px side margins and 16px gutters.
- **Desktop/Tablet:** 12-column grid with 32px-48px margins to allow data visualizations to breathe.

Layouts should prioritize vertical stacking for field-use accessibility, ensuring that touch targets and data cards are easily interactable with one hand. Padding within containers should lean towards the "lg" (24px) scale to reinforce the airy, elegant aesthetic.

## Elevation & Depth

To maintain a sense of robustness and modern elegance, the design system utilizes **Ambient Shadows** and **Tonal Layers** rather than heavy borders.

- **Level 1 (Base):** Off-white surface (#F8F9FA).
- **Level 2 (Cards/Containers):** Pure white background with a "Soft Drop Shadow"—a 12% opacity Deep Petrol Blue tint, 16px blur, and a 4px vertical offset. This creates a tactile effect where data containers appear to float gently above the field surface.
- **Level 3 (Modals/Popovers):** Higher elevation with a 20% opacity shadow and 32px blur to focus user attention on critical inputs or notifications.

Avoid harsh black shadows; always tint shadows with the structural #1B4332 color to maintain a cohesive, sophisticated atmosphere.

## Shapes

The shape language is defined by **16px rounded corners** (represented by `rounded-lg` in our scale). This significant radius softens the professional tone, making the data feel more approachable and modern.

- **Primary Components:** Buttons, Input Fields, and Data Cards all utilize the 16px radius.
- **Small Elements:** Tooltips and tags may scale down to 8px to maintain visual balance.
- **Outer Wrappers:** On mobile, full-width cards may transition to 0px on the sides but maintain the 16px radius on top and bottom sections to frame the content.

## Components

The component library is built for high-performance data interaction.

- **Buttons:**
    - **Primary:** Solid #2D6A4F with white text. High-contrast, 16px corners, 48px minimum height for field-use tap targets.
    - **Secondary:** Solid #95D5B2 with #1B4332 text. Used for non-destructive actions.
- **Data Cards:** The workhorse of the system. Defined by #FFFFFF backgrounds, 16px rounded corners, and the Level 2 Soft Drop Shadow. They must include a clear internal padding of 24px.
- **Input Fields:** Large, clear hit areas with a 1px stroke in #95D5B2 when focused. Floating labels help maintain context in long forms.
- **Chips & Tags:** Small capsules with #95D5B2 backgrounds for categorization (e.g., Crop Type, Soil Status) and Coral for "At Risk" flags.
- **Charts:** Utilize a monochromatic green scale (#1B4332 to #95D5B2) to represent density and health, with Coral used exclusively as a highlight for anomalies or data failures.
- **Navigation:** Deep Petrol Blue (#1B4332) header or bottom nav bar to provide a solid structural frame for the off-white content area.