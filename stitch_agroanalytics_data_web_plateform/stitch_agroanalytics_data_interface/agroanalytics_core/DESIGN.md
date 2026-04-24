---
name: AgroAnalytics Core
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
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  data-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The brand personality of this design system is rooted in the intersection of organic growth and precise technology. It is designed to evoke a sense of professional reliability, environmental stewardship, and data-driven clarity. The target audience—ranging from agricultural stakeholders to data scientists—requires a workspace that feels both airy and authoritative.

The visual style follows a **Modern Corporate** aesthetic with a strong emphasis on **Soft UI**. By combining high-contrast typography with soft, ambient drop shadows and generous whitespace, the system achieves an elegant, data-first environment. Every element is designed to minimize cognitive load while maximizing the legibility of complex agricultural metrics.

## Colors
This design system utilizes a palette of deep botanical greens and soft mints to reinforce its agricultural focus. 

- **Primary Accent (#2D6A4F):** Used for primary actions, success states, and validation markers. It represents growth and health.
- **Structure & Typography (#1B4332):** This Petrol Blue-Green is the foundation for navigation bars, headers, and body text. It provides the necessary contrast and professional weight.
- **Secondary/Hover (#95D5B2):** A fresh mint shade reserved for graph backgrounds, secondary button states, and subtle container fills.
- **Background (#F8F9FA):** An off-white neutral that reduces glare during extended data analysis.
- **Error State (#FF7F70):** A coral red that stands out against the green palette without feeling aggressive, used for critical alerts and failed validations.

## Typography
The typography in this design system leverages **Plus Jakarta Sans** for its airy, modern, and friendly characteristics. 

The scale is designed to handle hierarchical data visualization. Headlines use tighter letter spacing and heavier weights to provide structure, while body text maintains a generous line height for readability. A specialized "data-display" style is included for high-level metrics and KPIs, ensuring numerical data is prominent and legible.

## Layout & Spacing
This design system utilizes a **fixed-grid** philosophy for wide-screen dashboards to ensure data consistency, transitioning to a **fluid grid** for mobile viewing. 

The system is built on a 12-column grid with a 24px gutter. The 4px base unit (8pt grid system) dictates all padding and margins, ensuring a consistent rhythm. Data cards should typically span 3, 4, or 6 columns to maintain a balanced information density. Large "hero" metrics should occupy the full width of their container with significant vertical padding (xl) to emphasize their importance.

## Elevation & Depth
Depth is conveyed through **ambient shadows** and **tonal layering**. 

Surfaces are layered to create a sense of information hierarchy:
1.  **Canvas (Base):** #F8F9FA.
2.  **Cards & Containers:** Pure White (#FFFFFF) with a soft, diffused shadow (0px 4px 20px rgba(27, 67, 50, 0.08)).
3.  **Active Elements:** Overlays and dropdowns use a slightly deeper shadow (0px 10px 30px rgba(27, 67, 50, 0.12)).

Avoid harsh borders. Instead, use thin 1px strokes in a very light version of the Petrol Blue (5% opacity) to define edges when shadows are insufficient.

## Shapes
The shape language is defined by a **16px (1rem)** standard corner radius for primary containers and cards. This high degree of roundedness softens the data-heavy nature of the application, making it feel approachable and modern.

- **Primary Radius:** 16px (Cards, Modals, Large Buttons).
- **Secondary Radius:** 8px (Inner containers, Input fields, Chips).
- **Interactive Elements:** Maintain consistent 16px rounding for all primary action buttons to ensure they feel tactile and distinct.

## Components

### Buttons
- **Primary:** Solid #2D6A4F with white text. 16px corner radius.
- **Secondary:** Solid #95D5B2 with #1B4332 text. Used for less critical actions.
- **Ghost:** Transparent background with #2D6A4F border and text.

### Cards
All data cards should have a white background, 16px rounded corners, and a soft ambient shadow. Headers within cards should use #1B4332 in H3 or Label-Caps style.

### Input Fields
Inputs use an 8px radius with a subtle 1px border. On focus, the border transitions to #2D6A4F with a soft outer glow.

### Chips & Badges
Status chips utilize high-contrast pairings:
- **Success:** Emerald Green background with white text.
- **Warning:** Fresh Mint background with Petrol Blue text.
- **Error:** Coral Red background with white text.

### Data Containers
Graph containers should utilize #95D5B2 at low opacities (10-15%) for background fills to categorize different data streams without overwhelming the actual data lines or bars.