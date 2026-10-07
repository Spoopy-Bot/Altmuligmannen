---
name: Altmuligmannen
description: Local help at home in Østfold, with the payment visibly held in escrow from request to release.
colors:
  navy: "#17334c"
  navy-950: "#0c1c2b"
  navy-900: "#112739"
  navy-700: "#234a6b"
  navy-600: "#2f5d86"
  navy-200: "#c7d4e1"
  navy-100: "#e1e9f1"
  navy-50: "#f0f4f8"
  amber: "#fdaf1c"
  amber-600: "#e5980a"
  amber-200: "#fedd9c"
  amber-100: "#ffefcc"
  amber-50: "#fff8e8"
  amber-ink: "#5c3b00"
  cream: "#fbf6e8"
  cream-200: "#f4ecd8"
  cream-300: "#e9dec4"
  surface: "#ffffff"
  ink: "#13212f"
  ink-2: "#45525f"
  ink-3: "#5d6874"
  line: "#e4dac3"
  line-strong: "#cdbf9f"
  ok: "#1d6e46"
  ok-50: "#e5f2ea"
  feil: "#ae2a1f"
  feil-50: "#fbe9e6"
typography:
  display:
    fontFamily: "Poppins, Inter Variable, ui-sans-serif, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins, Inter Variable, ui-sans-serif, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Poppins, Inter Variable, ui-sans-serif, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    fontFeature: "'tnum'"
  title:
    fontFamily: "Poppins, Inter Variable, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'cv11', 'ss01'"
  body-sm:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  micro:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
  caption:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  ikon: "28%"
  brand-mark: "22%"
  full: "9999px"
spacing:
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "14": "56px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.navy-700}"
  button-accent:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.navy-950}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-accent-hover:
    backgroundColor: "{colors.amber-600}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.navy-50}"
  button-text:
    textColor: "{colors.navy}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.feil}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-sm:
    padding: "0 12px"
    height: "36px"
  button-lg:
    padding: "0 24px"
    height: "52px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 14px"
    height: "48px"
  badge-neutral:
    backgroundColor: "{colors.cream-200}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-navy:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-light:
    backgroundColor: "{colors.navy-50}"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-amber:
    backgroundColor: "{colors.amber-100}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-ok:
    backgroundColor: "{colors.ok-50}"
    textColor: "{colors.ok}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  badge-feil:
    backgroundColor: "{colors.feil-50}"
    textColor: "{colors.feil}"
    rounded: "{rounded.lg}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  card-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  card-panel-dark:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  escrow-seal-reserved:
    backgroundColor: "{colors.amber-50}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  escrow-seal-released:
    backgroundColor: "{colors.navy-50}"
    textColor: "{colors.navy-700}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  escrow-glyph-reserved:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.ikon}"
    size: "56px"
  escrow-glyph-released:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.amber}"
    rounded: "{rounded.ikon}"
    size: "56px"
  nav-top:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream}"
    height: "64px"
  nav-item:
    textColor: "{colors.navy-200}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
  nav-item-hero:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "40px"
  nav-bottom:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    height: "64px"
  category-tile:
    backgroundColor: "{colors.navy-50}"
    textColor: "{colors.navy}"
    rounded: "{rounded.ikon}"
    size: "44px"
  chip-category:
    backgroundColor: "{colors.cream-200}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
---

# Design System: Altmuligmannen

All UI copy is Norwegian bokmål and deliberately minimal: one heading, at most one short supporting line, then the content. Component and token names in code are Norwegian (Knapp, Merke, Felt, EscrowSegl); this document is in English.

## Overview

**Creative North Star: "The Sealed Envelope"**

The money for a job is a visible object. From the moment a homeowner sends a request until they approve the work, an amber seal sits on the job, on both sides of the app, in the same shape. Everything else in the system is calm around it: a deep navy frame taken from the app icon, a warm cream paper ground, white cards with hairline warm borders, and heavy geometric Poppins headings that echo the wordmark. Amber is the one hot color, and it means either "money is held" or "this is the one thing to do next".

Density is moderate and mobile-first (390px), widening to a two-column detail layout at desktop. Category tiles, the seal and map pins share the rounded-square silhouette of the app icon. Person avatars are circles (a confirmed user choice). History is a stamped ledger: nothing disappears, declined steps stay struck through and the remaining steps wait in a dashed line below.

**Key Characteristics:**
- Navy frame, cream ground, white cards, amber reserved for held money and the single hero action.
- Poppins 700/800 for headings and money figures; Inter for every other word.
- Rounded-square (28%) identity marks borrowed from the brand icon.
- Ring-bordered cards with a soft two-layer ambient shadow that lifts on hover.
- Tabular figures for every amount, date and count.
- Motion is a short stamp, not a flourish: the seal and unread count re-stamp when their state changes.

## Colors

A user-supplied brand palette sampled from the app icon: one calm navy, one warm amber, and cream paper, with warm (not grey) neutrals.

### Primary
- **Harbour Navy** (navy): the frame. Top bar, primary buttons, page and card headings, completed ledger stamps, the selected map pin and dark summary panels. Its deeper steps (navy-950, navy-900) carry text on amber and on navy-tinted surfaces; navy-700 is the hover state; navy-200 is the quiet text tone on the navy bar; navy-100 and navy-50 tint "light" badges, category tiles and the released seal.

### Secondary
- **Hammer Amber** (amber): held money and the hero action. The reserved seal, the reserved escrow badge, the top recommendation's send button, the primary role door and the approve/accept action in dark panels, plus the focus ring on navy surfaces only. Stars, unread counts, nav items and ledger steps are never amber. amber-600 is its hover; amber-100 and amber-50 are the tinted grounds of reserved badges, seal panels and inline call-to-action notes. **Amber Ink** (amber-ink) is the only text color used on amber tints.

### Neutral
- **Cream Paper** (cream): the body ground on every page.
- **Cream Shade** (cream-200, cream-300): neutral badges, category chips, disabled fields, skeleton shimmer, empty-star fill.
- **White Card** (surface): cards, inputs, secondary buttons, the mobile bottom bar.
- **Ink** (ink): body text. **Ink 2** (ink-2) supporting text. **Ink 3** (ink-3) meta lines, placeholders, captions, inactive bottom-nav items.
- **Warm Line** (line): card rings, dividers, bar borders. **Strong Line** (line-strong): input borders, dashed empty-state borders, dashed future ledger steps, scrollbar.

### Status
- **Forest OK** (ok, ok-50): approved status, availability ("Ledig denne uken"), match-reason check marks.
- **Brick Error** (feil, feil-50): field errors, error messages, urgency badge, danger button.

### Named Rules
**The Amber Is Earned Rule.** Amber fills mean money held or the single next action on the view. Text on amber is always navy-950, never white; text on amber tints is always amber-ink.

**The Warm Neutral Rule.** Neutrals are cream and warm beige lines. Cool greys are not part of the palette.

## Typography

**Display Font:** Poppins 700 / 800 (with Inter Variable, ui-sans-serif)
**Body Font:** Inter Variable (with ui-sans-serif, system-ui), stylistic sets cv11 and ss01

**Character:** Heavy, tight geometric headings that read as the wordmark's voice, over a neutral, highly legible UI sans for older and non-technical readers.

### Hierarchy
- **Display** (800, 2.125rem rising to 3rem from 640px, line-height 1.08, -0.03em): the start-screen headline only.
- **Headline** (800, 1.75rem rising to 2.125rem from 640px, line-height 1.25, -0.02em, navy): one page title per screen, via the page header.
- **Figure** (800, 1.75rem, tabular): the amount inside the escrow seal and other headline money figures.
- **Title** (700, 1.0625 to 1.125rem, -0.02em, navy): card titles, section headings in cards, empty-state titles, role-door titles (800, 1.25 to 1.5rem).
- **Body** (400, 0.9375rem, line-height 1.5): descriptions, ledger lines, field text. Supporting lines are capped near 42rem.
- **Body small** (400, 0.875rem): meta lines, helper text, seal explanations.
- **Label** (600, 0.875rem): buttons, field labels, nav items, seal state ("Betaling reservert").
- **Caption** (400 to 600, 0.75rem): badges, timestamps, map legend.
- **Micro** (600, 0.6875rem): bottom-nav labels, counts, small avatar initials, chat times, map place names.

### Named Rules
**The Two Voices Rule.** Poppins speaks only in headings, initials and money figures; every other word is Inter.

**The Tabular Money Rule.** Amounts, dates, times, distances and counts use tabular figures so they align and don't jitter when they change.

## Layout

Single centered column capped at 72rem (max-w-6xl) with 16px gutters, 24px from 640px. Content starts 24px below the 64px sticky navy bar (32px from 640px). Below 768px a fixed white bottom bar (64px, safe-area padded, translucent with blur) replaces the top nav, and main content reserves 128px of bottom padding for it. Detail pages use a two-column grid at desktop: the content column left, the escrow seal and next actions stacked in a right rail. Forms and reading columns narrow to 42rem to 48rem.

Spacing follows a 4px base. Inside components: 6 to 12px between related items (gap 1.5 to 3). Card padding is 16px, 20px from 640px; feature panels 20 to 28px. Stacks of cards sit 12px apart; page sections 24 to 32px. Start-screen bands breathe at 56 to 80px vertically.

Breakpoints are Tailwind's defaults: 640px (padding and type steps up), 768px (top nav appears, bottom bar leaves, two columns), 1024px (four-up step strip).

## Elevation & Depth

A hybrid of tonal layering and soft ambient shadow. Depth order is cream ground, white card, then lifted overlays. Cards always carry a 1px warm ring plus a low two-layer shadow; hover or overlay raises them to the deeper "loft" shadow. Shadows are tinted with ink, never pure black, and are always soft and offset downward with negative spread. The navy top bar sits on a single 1px dark hairline.

### Shadow Vocabulary
- **Kort** (`0 1px 2px rgb(19 33 47 / 0.06), 0 4px 14px -6px rgb(19 33 47 / 0.12)`): resting cards, seal glyph, map pins.
- **Loft** (`0 2px 4px rgb(19 33 47 / 0.08), 0 16px 32px -12px rgb(19 33 47 / 0.28)`): card hover, the demo panel, the brand icon on the start band, the primary role door, the job pin on the map.
- **Button press** (navy: `inset 0 1px 0 rgb(255 255 255 / 0.08), 0 2px 6px -2px rgb(12 28 43 / 0.5)`; amber: `0 2px 6px -2px rgb(92 59 0 / 0.45)`): filled buttons only.

### Named Rules
**The Ring Plus Shadow Rule.** A card is defined by a 1px warm ring first and a soft shadow second. Never a shadow alone, never a heavy border.

## Shapes

Softly rounded, never sharp and never pill-shaped for containers. Controls (buttons, inputs, bottom-nav pills) are 12px; badges and nav items 8px; small chips and inline glyph boxes 6px; cards 16px; page-level feature panels (profile, contract, dark summary) 24px. The app icon's squircle at 28% (`--radius-ikon`) is used for category tiles, the seal, empty-state icons, map pins and map legend swatches. Avatars are full circles. The brand icon image itself is clipped at 22%. Fully round shapes are limited to the unread count, spinners and the radius circle on the map.

The start band carries one oversized, rotated rounded square in navy-700 at 40% opacity as a quiet echo of the icon.

### Named Rules
**The Icon Silhouette Rule.** Anything that stands for a trade or the payment is a 28% rounded square. People are circles: initials on a soft tint.

## Components

### Buttons
Clear, solid and confident; one height scale shared by all variants.
- **Shape:** gently rounded (12px). Heights 36 / 44 / 52px with 12 / 16 / 24px side padding; label weight 600.
- **Primary:** navy fill, cream text, inset highlight plus soft navy drop. Hover navy-700.
- **Accent:** amber fill, navy-950 text, amber-tinted drop. Hover amber-600. One per view: the top recommendation's send action or equivalent.
- **Secondary:** white fill, navy text, 1px navy-200 inset ring. Hover navy-50 with a stronger ring.
- **Text / Dark text / Danger:** transparent navy text with navy-50 hover; cream text with a white/20 ring on navy; white with brick text and a brick/30 ring.
- **States:** press nudges down 1px; 150ms color/shadow transition; disabled at 50% opacity; loading swaps the icon for a 16px current-color spinner and sets aria-busy. Icons are 16 to 20px Lucide strokes, leading the label.

### Badges (Merke)
- **Style:** 8px radius, 2px 8px padding, 12px semibold, 1px inset ring of the same hue at low opacity.
- **Tones:** neutral (cream-200), light (navy-50), navy (filled), amber (amber-100 with amber-ink), ok, feil. Job status maps to a fixed tone: open neutral, requested and accepted light, in progress navy, delivered amber, approved ok.
- **Category chips:** flatter 6px tags in cream-200 with ink-2 text, no ring.

### Cards / Containers
- **Corner Style:** 16px (job and helper cards), 24px (page-level panels).
- **Background:** white; dark summary panels are navy with cream text.
- **Shadow Strategy:** Kort at rest, Loft on hover (see Elevation).
- **Border:** 1px warm ring; a selected helper card switches to a 2px navy ring.
- **Internal Padding:** 16px, 20px from 640px.
- **Whole-card links:** the title link stretches over the card; keyboard focus draws a 3px navy-600 ring on the card itself. A trailing chevron nudges right on hover.
- **Job card:** a 44px navy-50 category tile, status badges, title, place and time meta, then the escrow badge; an optional amber-50 action note sits beneath.
- **Empty state:** dashed strong-line border, white/60 fill, 56px squircle icon, title and one line.

### Inputs / Fields
- **Style:** white, 1px strong-line border, 12px radius, 48px tall (textareas from 128px), 15px text, ink-3 placeholder. Label above in 14px semibold; "(valgfritt)" in ink-3 for optional fields; helper text between label and control.
- **Focus:** border turns navy with a 3px navy/15 ring.
- **Error / Disabled:** brick border and ring with a brick message below, linked by aria-describedby; disabled fills cream-200. Selects use a navy chevron drawn inline.

### Navigation
- **Top bar:** sticky 64px navy bar, brand icon (36px, 22% clip) and light wordmark, then nav items: 40px tall, 8px radius, 14px semibold with a 17px icon. Inactive navy-200, hover white/8, active white/12 with cream text. The hero item ("Beskriv problem") is styled like the other items, so it never competes with the page's amber action.
- **Utility:** a 40px notification button with a white ring and a red (feil) count with a navy ring that re-stamps on change; the demo role switcher (cream "Demo" tag) at the right.
- **Mobile bottom bar:** white/95 with blur and a warm top line; five equal slots of icon over an 11px label. Active items get a navy-100 pill behind the icon and a heavier stroke; the hero item's pill is solid navy with a cream icon.
- **Page header:** optional back link (14px semibold navy-700 with arrow), the headline, an optional single supporting line, actions aligned to the right.

### Escrow Seal (signature)
The payment as an object, identical in shape for both roles.
- **Panel:** 16px radius, 16 to 20px padding, 1px ring. Reserved: amber-50 ground, amber/50 ring. Released: navy-50 ground, navy-100 ring.
- **Glyph (`Segl.tsx`):** an authored SVG mark: the app icon's rounded square with ticket notches on both sides and short perforation ticks. Reserved: amber with a navy-950 keyhole. Released: navy with an amber check. It is used only for money state (seal panel, compact badge at 20px, payment notifications, payout totals, and step 3 on the start strip). It plays the stamp animation each time the status changes.
- **Text stack:** state label in 14px semibold (amber-ink or navy-700), the amount as a Figure in navy, one role-specific sentence, then the reserved or released date in caption.
- **Compact badge:** the same two states shrunk into an 8px badge with a 20px inner glyph box, the state label and the amount; it rides on every job card.

### Event Ledger (Hendelseslogg)
- 24px 8px-radius stamps joined by a 2px navy rail. Done steps: navy stamp with a cream check. Declined: cream-200 stamp with an X and struck-through ink-3 text, kept in place. Future steps: dashed strong-line rail; the next one is a navy-50 stamp with a 2px navy ring and semibold text, the rest white and ink-3. Wording follows the viewer ("Du godkjenner…" for the kunde, "Du takker ja" for the aktør).

### Mock Map
- Cream land (#f1ead6) with a faint contour pattern, pale blue-grey water (#dfe7ec), a dashed border line and uppercase city labels haloed in the land color. Helpers are white squircle pins with navy initials; the selected pin grows to navy with amber initials, shows its service radius as a dashed navy circle and a dotted navy route to the amber job pin. A fixed legend strip sits beneath on white. This palette is local to the map.

### Avatar
- Initials in Poppins bold on a squircle, 28 to 96px. Ten fixed soft pairs (pale tint background, deep same-hue text) assigned by index; these hexes live in the component and nowhere else.

## Do's and Don'ts

### Do:
- **Do** show the escrow seal or its compact badge wherever a decision about a job is made, in the same shape for Mottaker and Aktør.
- **Do** keep amber to held money and one hero action per view, with navy-950 text on amber fills and amber-ink on amber tints.
- **Do** build cards as white, 1px warm ring, Kort shadow, 16px radius; lift to Loft on hover.
- **Do** use the 28% squircle for category tiles, the seal and pins, and circles for person avatars.
- **Do** set every amount, date and count in tabular figures.
- **Do** write UI copy in Norwegian bokmål and keep it minimal: a headline, at most one short supporting line, and labels that name the action.
- **Do** keep ledger history visible: struck-through declines and dashed future steps, never removed.
- **Do** use the 3px navy-600 focus outline (2px offset) on light surfaces and switch it to amber inside `data-mork` (navy) regions; fields use the navy border plus a 3px navy/15 ring.
- **Do** respect reduced motion; animations collapse to near zero.

### Don't:
- **Don't** put white text on amber or use amber as a decorative fill.
- **Don't** use circles for people or trades; reserve full rounding for counts and spinners.
- **Don't** introduce cool greys or pure-black shadows; neutrals are cream and warm beige, shadows are ink-tinted.
- **Don't** add uppercase tracked eyebrow labels above headings or inside cards; uppercase belongs only to map place names.
- **Don't** add hex values outside the theme tokens, except the avatar pairs and the map terrain, which stay local to their components.
- **Don't** use hard or offset shadows; all depth is soft and ambient.
- **Don't** hide a job's past or pending steps to simplify a screen.
