# Quickstart Validation Guide: Design System CSS (Neo-Brutalist Foundation)

This guide documents how to manually run and verify the neo-brutalist design system.

## Prerequisites

- Modern Web Browser (Google Chrome, Apple Safari, or Mozilla Firefox)
- Local HTTP server (optional, or open the file directly via `file://` scheme)

## Run Validation Scenario

1. Open `src/pages/design-test.html` in your web browser.
2. Verify visual elements against the acceptance criteria checklist.

### Step-by-Step Checks

#### 1. Background & Margins
- **Verification**: Verify page background is cream color. Inspect body background using browser DevTools. It must resolve to `#f4e9d8`.
- **Responsive**: Reduce browser viewport width below `768px`. Verify the page padding shrinks and note cards stack vertically in a single column.

#### 2. Neo-Brutalist Cards
- **Verification**: Hover over the three test cards. Verify each card shifts position up-left and the shadow grows.
- **Color Check**: Confirm the bottom-right corner of the hovered shadow is `#ff6f59` (coral).
- **Click Check**: Click and hold a card. Confirm the card translates down-right (presses down) and the shadow shrinks.
- **Borders**: Confirm using DevTools Computed panel that `border-radius` = `0` and `border` = `2.5px solid rgb(17, 17, 17)`.

#### 3. Tactile Buttons
- **Hover**: Hover over the buttons. Verify they shift up-left and shadow shows coral.
- **Active**: Click and hold. Verify they press down.
- **Primary vs Danger**: Primary buttons have black backgrounds and cream text. Danger buttons have coral text/border and coral shadow on hover.

#### 4. Form Elements & Focus States
- **Focus**: Click into the text input. Verify it translates up-left and shows coral shadow.
- **Keyboard Tab**: Press `Tab` to navigate through the inputs, buttons, and links. Confirm a coral-colored offset outline ring appears on the focused element.

#### 5. Accessibility & Direction
- **Reduced Motion**: In Chrome DevTools, open Command Menu (`Ctrl+Shift+P` / `Cmd+Shift+P`), type "Show Rendering", and check "Emulate CSS media feature prefers-reduced-motion". Hover over a card. Confirm the transform shifts instantly with no transition animation.
- **RTL Support**: In DevTools, inspect the `<html>` tag and add the attribute `dir="rtl"`. Confirm that the nav links and app brand positions switch sides instantly and layout mirrors correctly.
