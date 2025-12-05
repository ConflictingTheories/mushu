# 🍡 mushu

A delightfully simple WebGL2 & WebGPU creative coding library with a hookable plugin architecture.

## Features

- 🎨 **Simple API** — Get stunning visuals with just a few lines
- ⚡ **WebGL2 + WebGPU** — Choose your renderer
- 🔌 **Plugin System** — Extensible through composable hooks
- 🌊 **Simulation Support** — Built-in ping-pong FBO for fluid dynamics
- 🎯 **Zero Dependencies** — Pure ES modules, no build required
- 📦 **Tree-shakeable** — Import only what you need

## Quick Start

Create an `index.html` file in your project root:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mushu Demo</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script type="module">
    import { mushu, shader, fps } from './mushu/src/index.js';

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
</body>
</html>
```

Then, serve your project with a local server (e.g., `npx http-server .`) and open `index.html` in your browser.
```

## Installation

Just copy the `src` folder into your project, or use ES modules directly:

```javascript
import { mushu, shader, simulation, fps } from './mushu/src/index.js';
```

### Module Imports

```javascript
// Everything
import { mushu, shader, simulation, fps, GLSL } from './mushu/src/index.js';

// Just WebGL2 flow builder
import { flow, shader, simulation, fps } from './mushu/src/core/flow.js';

// Just WebGPU flow builder
import { gpuFlow } from './mushu/src/gpu/gpuFlow.js';

// Just GLSL utilities
import { GLSL, PRESET_SHADERS } from './mushu/src/glsl/shaders.js';
```

## API

### Unified Entry Point — `mushu(canvasOrSelector)`

All APIs start with `mushu()`. It accepts a canvas element or CSS selector.

```javascript
import { mushu } from './mushu/src/index.js';

// One-liner for quick shader sketches
mushu('#c').glsl(`
  void mainImage(out vec4 O, vec2 C) {
    vec2 uv = C / resolution;
    O = vec4(uv, 0.5, 1.0);
  }
`);

// Fluent WebGL2 builder with plugins
mushu('#c').flow()
  .use(shader(...))
  .use(fps())
  .go();

// WebGPU with compute and render shaders
mushu('#c').gpu(computeShader, renderShader);

// Fluent WebGPU builder
mushu('#c').gpu().flow()
  .display(...)
  .go();
```

### WebGL2 Flow — `mushu(canvas).flow(options?)`

Creates a WebGL2 context and render loop with plugin support.

```javascript
const f = mushu('#c').flow({
  pixelRatio: window.devicePixelRatio, // Resolution multiplier
});

f.use(plugin)  // Add a plugin
 .go()         // Start the render loop
```

### Plugins

#### `shader(fragmentSource)`
Render a fragment shader. The shader receives:
- `resolution` — Canvas size in pixels
- `time` — Time in seconds
- `mouse` — Normalized mouse position (0-1)
- `mouseDown` — 1.0 if mouse is pressed

```javascript
.use(shader(`
  void mainImage(out vec4 O, vec2 C) {
    vec2 uv = C / resolution;
    O = vec4(uv, 0.5, 1.0);
  }
`))
```

#### `simulation(fragmentSource, options?)`
Run a simulation with persistent state using ping-pong FBOs.

The shader receives an additional `sample(uv)` function to read the previous frame.

```javascript
.use(simulation(`
  void mainImage(out vec4 O, vec2 C) {
    vec2 uv = C / resolution;
    vec4 prev = sample(uv); // Read previous state
    
    // Your simulation logic here
    
    O = prev + vec4(0.01, 0.0, 0.0, 0.0);
  }
`, {
  scale: 0.5,      // Resolution scale (default: 1.0)
  iterations: 1,   // Iterations per frame (default: 1)
}))
```

#### `fps()`
Display an FPS counter in the top-left corner.

### WebGPU — `mushu(canvas).gpu(computeShader?, renderShader?)`

Creates a WebGPU context with optional compute shader simulation.

```javascript
mushu('#c').gpu(
  // Compute shader (or null for render-only)
  `@compute @workgroup_size(8, 8)
   fn main(@builtin(global_invocation_id) id: vec3u) {
     // Simulation logic
     let state = textureLoad(stateIn, id.xy);
     textureStore(stateOut, id.xy, state);
   }`,
  
  // Render shader
  `@fragment
   fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
     let coord = vec2u(uv * vec2f(textureDimensions(state)));
     let state = textureLoad(state, coord);
     return vec4f(state.rgb, 1.0);
   }`
);
```

### WebGPU Flow — `mushu(canvas).gpu().flow()`

Fluent WebGPU builder with method chaining.

```javascript
mushu('#c').gpu().flow()
  .compute(`
    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      // Simulation logic
    }
  `)
  .display(`
    @fragment
    fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
      return vec4f(uv, sin(u.time), 1.0);
    }
  `)
  .go();
```

#### Available in WGSL:
- `uniforms.resolution` — Canvas size
- `uniforms.time` — Time in seconds
- `uniforms.mouse` — xy: position (0-1), z: pressed, w: click
- `stateIn` / `stateOut` — Ping-pong state textures (compute)
- `state` — Current state texture (fragment)

### GLSL Utilities

Pre-built shader snippets you can inject:

```javascript
import { GLSL, PRESET_SHADERS } from './mushu/src/glsl/shaders.js';

// Use noise functions
const myShader = `
  ${GLSL.NOISE}
  
  void mainImage(out vec4 O, vec2 C) {
    float n = fbm(C * 0.01, 4);
    O = vec4(vec3(n), 1.0);
  }
`;

// Available: GLSL.NOISE, GLSL.VORONOI, GLSL.COLOR
// Presets: PRESET_SHADERS.plasma, PRESET_SHADERS.fire, PRESET_SHADERS.water
```

## Examples

Check out the `examples/` folder:

| Demo | Description |
|------|-------------|
| `fire.html` | Multi-octave fire simulation |
| `smoke.html` | Volumetric smoke with turbulence |
| `water.html` | Pure water ripples (wave equation) |
| `plasma.html` | Classic plasma effect |
| `gpu/fire.html` | WebGPU fire |
| `gpu/water.html` | WebGPU water simulation |
| `gpu/plasma.html` | WebGPU plasma |
| `gpu/smoke.html` | WebGPU volumetric smoke |
| `compare.html` | Before/after code comparison |

## Tips

### Performance
- Use `simulation({ scale: 0.5 })` for cheaper fluid simulations
- WebGPU compute shaders are faster for complex simulations
- Avoid `discard` in fragment shaders when possible

### Debugging
- The library logs to console when initialized
- Check browser console for WebGPU compatibility issues
- Use the `fps()` plugin to monitor performance

### Common Patterns

**Fluid Simulation Basics:**
```glsl
// Sample neighbors
vec4 up = sample(uv + vec2(0, px.y));
vec4 down = sample(uv - vec2(0, px.y));
vec4 left = sample(uv - vec2(px.x, 0));
vec4 right = sample(uv + vec2(px.x, 0));

// Diffusion
vec4 avg = (up + down + left + right) * 0.25;
state = mix(state, avg, 0.2);

// Dissipation
state *= 0.99;
```

**Adding Mouse Interaction:**
```glsl
float dist = length(uv - mouse);
float emit = smoothstep(0.05, 0.0, dist) * mouseDown;
state += emit;
```

## Browser Support

- **WebGL2**: Chrome 56+, Firefox 51+, Safari 15+, Edge 79+
- **WebGPU**: Chrome 113+, Edge 113+, Safari 17+ (with flag)

## License

MIT © 2024

---

Made with 🍡
