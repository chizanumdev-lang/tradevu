---
name: Violet Ether
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad8e9'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#eeecfe'
  surface-container-high: '#e9e6f8'
  surface-container-highest: '#e3e0f2'
  on-surface: '#1a1a27'
  on-surface-variant: '#4c4451'
  inverse-surface: '#2f2f3c'
  inverse-on-surface: '#f2efff'
  outline: '#7d7483'
  outline-variant: '#cec3d3'
  surface-tint: '#7b41b3'
  primary: '#2e0052'
  on-primary: '#ffffff'
  primary-container: '#4b0082'
  on-primary-container: '#ba7ef4'
  inverse-primary: '#ddb7ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#1f1931'
  on-tertiary: '#ffffff'
  tertiary-container: '#342e47'
  on-tertiary-container: '#9e95b4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0050'
  on-primary-fixed-variant: '#622599'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#e8deff'
  tertiary-fixed-dim: '#cbc2e2'
  on-tertiary-fixed: '#1d1830'
  on-tertiary-fixed-variant: '#49435d'
  background: '#fcf8ff'
  on-background: '#1a1a27'
  surface-variant: '#e3e0f2'
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
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Lato
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Lato
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Lato
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label:
    fontFamily: Lato
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
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
  sm: 12px
  md: 24px
  lg: 48px
  container-padding: 32px
  gutter: 20px
---

## Brand & Style

The design system for the internal dashboard balances high-density data visualization with an ethereal, sophisticated aesthetic. It targets an audience of financial analysts and internal operators who require a focused, high-clarity environment that feels premium and modern. 

The style is a hybrid of **Glassmorphism** and **Minimalism**. It utilizes translucent layers to create a sense of depth and hierarchy without the visual weight of solid blocks. This is grounded by a structured, decorative 3px dashed violet border frame that acts as a container for the workspace, providing a distinct "editorial" feel to the technical interface.

## Colors

The palette is defined by a sophisticated transition from deep, authoritative violets to soft, airy lavenders. 

- **Primary & Headings:** Deep Violet (#4B0082 and #3B0070) is used for structural hierarchy and high-priority text.
- **Accents:** Violet (#7C3AED) serves as the primary action color, used for interactive elements and highlights.
- **Surface & Backgrounds:** The interface relies on a white base (#FFFFFF) and soft lavender (#E8DEFF) for secondary surfaces and pill backgrounds.
- **Typography:** Body text uses Dark Slate (#2D2D3A) to ensure high legibility against the lavender and white backgrounds.

## Typography

This design system employs a dual-typeface strategy to distinguish between navigation/structure and data consumption.

- **Plus Jakarta Sans** is reserved for all headings (H1–H3). It should always be set in #3B0070 to maintain a strong visual anchor.
- **Lato** is the workhorse for all body copy, data tables, and input labels. The Dark Slate (#2D2D3A) color provides the necessary contrast for long-form reading and rapid data scanning. 
- Use uppercase labels with increased letter spacing for small metadata and category tags to differentiate them from standard body text.

## Layout & Spacing

The layout follows a **Fluid Grid** model designed for high-resolution dashboard monitors. 

- **The Decorative Frame:** A 3px dashed violet (#4B0082) border must wrap the main content area, creating a consistent margin of 24px from the viewport edge.
- **Grid System:** A 12-column system with 20px gutters. 
- **Rhythm:** Spacing follows an 8px base unit. Component internal padding should lean toward "Spacious" (md/24px) to balance the density of the information.
- **Alignment:** All cards and primary containers must snap to the grid, while decorative elements may break the grid slightly to create a layered, organic feel.

## Elevation & Depth

Depth is achieved through material properties rather than traditional heavy shadows.

- **Frosted Glass:** Primary containers (Cards) use a 70% white opacity background with a `backdrop-filter: blur(12px)`.
- **Borders:** Containers are defined by a 1px solid border using `rgba(120, 80, 200, 0.15)`. This subtle tint links the container to the violet palette.
- **Shadows:** Use a single, very soft "Ambient" shadow for floating elements: `0 8px 32px rgba(75, 0, 130, 0.08)`.
- **Hover States:** Interaction is signaled by a transition from the subtle 1px border to a 2px solid violet (#7C3AED) border, creating a tactile "lift" effect.

## Shapes

The design system utilizes a "Rounded" geometry (0.5rem / 8px) for primary containers and buttons to maintain a professional yet accessible feel.

- **Cards/Modals:** 1rem (16px) corner radius for large surfaces.
- **Form Inputs:** 0.5rem (8px) corner radius.
- **Pills/Chips:** Fully rounded (500px) to contrast against the more structured rectangular cards.
- **The Frame:** The 3px dashed decorative border should have sharp or slightly softened (4px) corners to act as the rigid "skeleton" for the softer glass elements inside.

## Components

- **Cards:** The core unit of the dashboard. Must feature the frosted glass effect, the 1px subtle border, and the 2px #7C3AED solid border transition on hover.
- **Buttons:** Primary buttons use a solid #7C3AED background with white Lato text. Secondary buttons use a light lavender (#E8DEFF) background with violet text.
- **Chips/Pills:** Used for status and highlights. Use #E8DEFF background with #7C3AED text. These should always be fully pill-shaped.
- **Input Fields:** Semi-transparent white backgrounds with a 1px violet border on focus. Labels should be Lato Bold, 12px, in Dark Slate.
- **Data Tables:** Use a clean, no-border approach for rows. Distinguish rows with a subtle #E8DEFF background on hover. Column headers should be in the #3B0070 Plus Jakarta Sans font.
- **Decorative Frame:** This is a persistent global component. It is a 3px dashed stroke in #4B0082 that frames the primary viewport or the main content stage.