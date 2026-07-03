# Research: Project Foundation & File Structure

## ES Module Architecture in Vanilla JS

To achieve the best performance without build-step overhead, the project uses native browser ES Modules.

### 1. Script Loading (`type="module"`)
The entry point `src/index.html` loads `src/js/app.js` using:
```html
<script src="js/app.js" type="module"></script>
```
Native modules are deferred by default, run in strict mode, and support relative `import` and `export` statements.

### 2. Relative Module Imports
All imports between script files must include the `.js` extension explicitly, as browsers do not perform automatic extension resolution like Node.js does:
```javascript
import { initAuth } from './auth.js';
```

## Git Repository Setup

A local git repository must be initialized in the workspace root if not already present. A `.gitignore` file will be created to ensure that any editor cache files, local logs, and the `.env` file containing secrets are never committed to version control.

## Alternatives Considered

1. **Vite / Node-based bundler**: Rejected because vanilla HTML, CSS, and JS is faster, requires no development compilation steps, has zero dependency drift, and complies directly with Constitution §8.1.
2. **Global Scripts / No Modules**: Rejected because using global namespaces makes testing difficult and leads to namespace collisions. ES Modules enforce code scoping and explicit boundaries.
