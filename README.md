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

    A delightfully simple WebGL2 & WebGPU creative-coding library with a hookable plugin architecture.

    This repository contains a self-contained ES-module implementation (`/src/`) and an `examples/` folder with GLSL and WebGPU demos.

    Quick summary of what's included

    - WebGL2 runtime with a small plugin system: `mushu(canvas).flow()`
    - WebGPU runtime: `mushu(canvas).gpu()` and the fluent `gpuFlow()` builder
    - GLSL snippet utilities under `src/glsl/`
    - 3D helpers (geometry, transforms, textures) under `src/core/` and `src/gpu/`

    Getting started

    1. Serve the project root with a static server so `/src` imports resolve (Netlify-friendly):

    ```bash
    npx http-server . -p 8080
    # or your preferred static server
    ```

    2. Open an example, for instance:

    http://localhost:8080/examples/glsl/fire.html

    3. Example embed (use `/src/index.js` when serving from the repo root):

    ```html
    <script type="module">
      import { mushu, shader, fps } from '/src/index.js';

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

    License

    MIT © 2025

    ---

    Made with 🍡
