# CSS Data Model: Design System CSS (Neo-Brutalist Foundation)

This document serves as the CSS class contract for the application. Developers building future pages must use these class definitions exclusively.

## CSS Custom Properties

| Custom Property | Default Value | Usage |
|---|---|---|
| `--cream` | `#f4e9d8` | Page background, card surface |
| `--ink` | `#111111` | Text, borders, shadow offsets |
| `--coral` | `#ff6f59` | Hover focus highlight accent |
| `--font-ui` | `-apple-system...` | UI chrome typography stack |
| `--border` | `2.5px solid var(--ink)` | Canonical border style |
| `--shadow-card` | `7-layer block` | Card shadow (resting) |
| `--shadow-card-hover` | `11-layer block` | Card shadow (hover) |
| `--shadow-sm` | `4-layer block` | Button/Input shadow (resting) |
| `--shadow-sm-hover` | `6-layer block` | Button/Input shadow (hover) |

## CSS Classes

### 1. Structural Cards

- **`.card`**: Main container. Handles border, 0px border-radius, resting 7-layer shadow, hover translation (-4px, -4px), hover 11-layer shadow with coral final offset, and click-hold active state.
- **`.card-body`**: Padding helper for card contents (`2rem 1.5rem`).
- **`.card-body-sm`**: Padding helper for smaller elements (`1.25rem 1rem`).
- **`.card-icon-layout`**: Flex column center layout for cards containing an SVG icon and title.

### 2. Buttons

- **`.btn`**: Base button class. Zero border-radius, 2.5px border, 4-layer shadow, hover translation (-2px, -2px), and hover 6-layer shadow with coral final offset.
- **`.btn-primary`**: Fills button with `#111111` (ink) background and `#f4e9d8` (cream) text.
- **`.btn-danger`**: Fills button border/text with `#ff6f59` (coral) and shows coral shadow on hover.
- **`.btn-lg`**: Large padding and text.
- **`.btn-sm`**: Compact padding and text.

### 3. Form Elements

- **`.input`**: Text input style. Zero border-radius, 2.5px border, 4-layer shadow, and hover focus translation.
- **`.textarea`**: Textarea box with vertical resize capability.
- **`.select`**: Styled select drop-down menu.
- **`.label`**: Uppercase, bold, small text label above form elements.
- **`.form-group`**: Flex layout helper for a label + input combination.

### 4. Layout & Navigation

- **`.app-header`**: Top banner layout. Bottom border, cream background, space-between alignment.
- **`.app-brand`**: Header logo/brand text format.
- **`.app-nav`**: Navigation link container.
- **`.nav-link`**: Brutalist navigation link with bottom border on hover/active.
- **`.page-wrap`**: Standard centered page wrapper width (`max-width: 1100px`).

### 5. Dialogs

- **`.modal-overlay`**: Fixed full-screen overlay backdrop (`rgba(17,17,17,0.55)`).
- **`.modal`**: Centered modal box with card border and shadow.
- **`.modal-title`**: Title text inside modal.
- **`.modal-actions`**: Flex right-aligned button container for modals.

### 6. Status Tags

- **`.tag`**: Compact status pill. Zero border-radius, 2px border, cream background.
- **`.tag-coral`**: Coral status pill.
