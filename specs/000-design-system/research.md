# Research: Design System CSS (Neo-Brutalist Foundation)

## CSS Variable Architecture

We will structure the styling system into clean CSS custom properties under the `:root` pseudo-class. This allows us to load template overrides smoothly.

### Brand Palette

- **Cream**: `#f4e9d8` (light background, soft and readable, resembles high-quality medical parchment)
- **Ink**: `#111111` (dark text, borders, hard shadow offsets)
- **Coral**: `#ff6f59` (active accents, final offset shadows on hover)

### Typography

To avoid loading heavy web font payloads in the UI chrome, we default to the system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) which loads instantly and conforms to OS-native look-and-feel. Arabic locales use `Cairo` or the native Arabic system font stack.

### Hard Shadows

Hard shadows are defined by stacking multiple shadow layers with zero blur radius. The offsets are shifted by `1px` per layer to create a solid depth appearance:
- **Card (resting)**: 7 offset layers
- **Card (hover)**: 11 offset layers, layer 11 colored in `--coral`
- **Button/Form (resting)**: 4 offset layers
- **Button/Form (hover)**: 6 offset layers, layer 6 colored in `--coral`

## Logical Properties for RTL Support

To satisfy **Constitution §8.3 (Bidirectional Text)**, we avoid explicit left/right coordinates in positions, padding, and margins. Instead, we use logical properties:
- `margin-left` / `margin-right` → `margin-inline-start` / `margin-inline-end`
- `padding-left` / `padding-right` → `padding-inline-start` / `padding-inline-end`
- `left` / `right` absolute position → `inset-inline-start` / `inset-inline-end`

This ensures that when `dir="rtl"` is applied to the `<html>` tag, the elements swap position automatically without manual CSS overrides.

## Alternatives Considered

1. **TailwindCSS**: Rejected because vanilla CSS is required by Constitution §8.1. Vanilla CSS is lightweight, has zero compilation dependency, and maps directly to the design template.
2. **Rounded Corners Option**: Checked if subtle border-radius (`4px`) could be allowed. Banned under **Constitution §8.7**; flat, sharp-edged corners are the core signature element of the design system.
