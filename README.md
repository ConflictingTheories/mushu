# 🍡 mushu

A delightfully simple WebGL2 & WebGPU library with a hookable plugin architecture to get rid of boilerplate.


## Features

### GLSL Utilities

Pre-built shader snippets you can inject:

```javascript
import { GLSL, PRESET_SHADERS } from './mushu/src/glsl/shaders.js';

// Use noise functions
const myShader = `
  ${GLSL.NOISE}
  
  void mainImage(out vec4 O, vec2 C) {
    float n = fbm(C * 0.01, 4);
# 🍡 mushu

A delightfully simple **WebGL2 & WebGPU** creative-coding library with a hookable plugin architecture to eliminate boilerplate.

Perfect for building generative art, interactive visualizations, particle systems, fluid simulations, and real-time graphics with minimal code.

## ✨ Features

- **Unified API** - Single entry point for WebGL2 and WebGPU
- **Plugin System** - Compose effects with `flow()` and chainable plugins
- **GLSL Utilities** - Pre-built noise, color, and math snippets
- **3D Helpers** - Geometry generators, transforms, textures, camera controls
- **Zero Dependencies** - Pure ES modules, ~15KB gzipped
- **Netlify-Friendly** - Works with static hosting out of the box

## 📦 What's Included

| Module | Purpose |
|--------|---------|
| `mushu()` | Unified entry point for quick prototyping |
| `mushu().flow()` | WebGL2 with plugin system & simulation |
| `mushu().gpu()` | WebGPU simple render & composition |
| `mushu().gpu().flow()` | WebGPU with full plugin system |
| `src/core/` | WebGL2 runtime, geometry, transforms, textures |
| `src/glsl/` | Shader utilities: noise, colors, math functions |
| `src/gpu/` | WebGPU runtime and GPU accelerated utilities |

## 🚀 Quick Start

### Installation

```bash
npm install mushu-flow
```

Or use directly from CDN/static hosting:

```html
<script type="module">
  import { mushu } from 'https://mushu-shader.netlify.app/src/index.js';
</script>
```

### Local Development

Serve the project root with any static server:

```bash
npx http-server . -p 8080
# or: npx live-server
# or: python -m http.server 8080
```

Then open http://localhost:8080/examples/

## 💡 Usage Examples

### Simple WebGL2 Shader

```html
<canvas id="c"></canvas>
<script type="module">
  import { mushu } from '/src/index.js';

  mushu('#c').flow()
    .use(shader(`
      void mainImage(out vec4 O, vec2 C) {
        vec2 uv = C / resolution;
        O = vec4(uv, 0.5 + 0.5 * sin(time), 1.0);
      }
    `))
    .use(fps())
    .go();
</script>
```

### Fire Effect with GLSL Utilities

```javascript
import { mushu } from '/src/index.js';
import { GLSL } from '/src/glsl/shaders.js';

mushu('#c').gl(`
  ${GLSL.NOISE}
  ${GLSL.COLORS}

  void mainImage(out vec4 O, vec2 C) {
    float n = fbm(C * 0.01, 4);
    O = vec4(flame(n), 1.0);
  }
`);
```

### WebGPU Compute + Render

```javascript
import { gpuFlow } from '/src/gpu/index.js';

gpuFlow(canvas)
  .use(compute(particleUpdateCode))
  .use(render(renderCode))
  .go();
```

## 📚 Demos

Check out the `/examples/` folder for full demos:

- **GLSL Effects**: Fire, water, plasma, smoke
- **3D Graphics**: Textured torus, PBR sphere, cube
- **Boilerplate Templates**: Starter files for your own projects

Live demos: https://mushu-shader.netlify.app/examples/

## 📖 API Documentation

### `mushu(canvas)`

Main entry point. Returns an object with runtime methods:

```javascript
mushu('#c').flow()        // WebGL2 with plugin system
mushu('#c').gl(code)      // WebGL2 direct shader
mushu('#c').gpu()         // WebGPU runtime
```

### Plugin System

Chain plugins with `.use()`:

```javascript
mushu('#c').flow()
  .use(shader(code))
  .use(animation(duration))
  .use(fps())
  .go();
```

Available plugins in `src/core/flow.js` and `src/gpu/gpuFlow.js`.

### GLSL Snippets

Import pre-built shader functions:

```javascript
import { GLSL } from '/src/glsl/shaders.js';

// Available: NOISE, COLORS, MATH, TRANSFORMS, etc.
const code = `${GLSL.NOISE} void mainImage(...) { ... }`;
```

### 3D Helpers

```javascript
import { 
  geometry,      // Box, sphere, torus, plane
  shader3d,      // 3D shader setup
  transforms,    // Matrices, rotations
  textures       // Load and create textures
} from '/src/core/index.js';
```

## 🎨 Browser Support

- **WebGL2**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **WebGPU**: Chrome 113+, Edge 113+, Safari 18+ (experimental)

## 📄 License

MIT © 2025 Kyle Derby MacInnis

## 🙏 Contributing

Found a bug or have a feature request? Open an issue or PR on [GitHub](https://github.com/ConflictingTheories/mushu).

---

Made with 🍡 for creative coders everywhere