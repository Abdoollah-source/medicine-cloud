# Data Model: App Shell & Classic Template (Visual Foundation)

This document describes the interface and storage keys used by the templates manager.

## Local Storage State Schema

The visual preferences are saved in the client's browser local storage:

| Key | Expected Values | Purpose |
|---|---|---|
| `mc-theme` | `"light" \| "dark"` | Restores active theme preference. Defaults to browser preferences. |
| `mc-template` | `"classic" \| "academic-dark"` | Swaps active CSS variables file. Defaults to `"classic"`. |

---

## JS Interface Contracts (`templates.js`)

The templates module exports the following functions:

### 1. `loadTemplate(templateId)`
- **Signature**: `(templateId: string) -> void`
- **Description**: Removes the link element with `id="mc-template-link"`, constructs a new link tag pointing to the path resolved from the `TEMPLATES` map, appends it to `<head>`, and updates `localStorage['mc-template']`.

### 2. `getActiveTemplate()`
- **Signature**: `() -> string`
- **Description**: Returns the active template key stored in local storage, or defaults to `"classic"`.

#### Template Maps
```javascript
export const TEMPLATES = {
  classic: 'css/templates/classic.css',
  'academic-dark': 'css/templates/academic-dark.css'
};
```

---

## CSS Variables Mapping

Every template stylesheet must override these visual tokens:

| Token | Classic Light | Classic Dark | Academic Dark |
|---|---|---|---|
| `--paper` | `#eef0f4` | `#0a0d13` | `#0d1117` |
| `--paper-2` | `#f4f6fa` | `#111622` | `#161b22` |
| `--ink` | `#4c4f69` | `#e7e2d3` | `#e6edf3` |
| `--gold` | `#a8791c` | `#c9a23e` | `#58a6ff` |
| `--grain-opacity` | `0.06` | `0.06` | `0` |
| `--color-microbe` | `#40a02b` | `#85c1dc` | `#3fb950` |
| `--color-protein` | `#1e66f5` | `#89b4fa` | `#79c0ff` |
| `--color-pathology` | `#d20f39` | `#f38ba8` | `#f85149` |
| `--color-anatomy` | `#df8e1d` | `#f9e2af` | `#d29922` |
| `--color-pharma` | `#8839ef` | `#cba6f7` | `#bc8cff` |
