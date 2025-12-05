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

    Notes and fixes applied

    - I fixed a WebGPU runtime bug (invalid texture mapping) and ensured a 1×1 dummy texture is uploaded correctly via `device.queue.writeTexture`.
    - I standardized mouse coordinate handling across WebGPU renderers (mouse Y is flipped when passed to shaders so Y=0 is bottom, matching the GLSL conventions used by the examples).
    - The WebGPU render pipelines in `src/gpu/gpuFlow.js` now flip the generated UVs in the vertex shader so fragment code receives consistent UVs (Y-origin at bottom).

    API overview

    - `mushu(canvasOrSelector)` — unified entry point. Returns helpers for `glsl`, `flow`, and `gpu`.
    - `flow(canvas)` — WebGL2 runtime with plugin system. Plugins are simple objects or functions with `init`, `render`, `destroy` hooks.
    - `gpu(computeWGSL, renderWGSL, options)` — simplified WebGPU compute+render helper.
    - `gpuFlow(canvas)` — fluent WebGPU builder with `.simulate()` and `.display()`.

    Documentation & types

    - I added JSDoc module headers and key function comments across the `src/` files to improve editor hints and to make it easier to generate TypeScript definitions later.

    Next steps you can ask me to do

    - Annotate every exported function with full JSDoc typedefs (I added module headers and several key docs already).
    - Run local smoke tests against the examples and iterate on any remaining WebGPU validation messages.
    - Commit and push the changes and trigger a Netlify redeploy.

    Browser support

    - WebGL2: modern desktop browsers
    - WebGPU: experimental across browsers; Chrome/Edge have the best support (check console for validation warnings)

    License

    MIT © 2025

    ---

    Made with 🍡
