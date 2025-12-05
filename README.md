# GLSL/WebGPU Creative Coding Framework

**One function. Zero boilerplate. Infinite art.**

The most powerful creative coding setup for real-time WebGL/WebGPU graphics.

---

## 🚀 Quick Start

Just open any HTML file in your browser:

```bash
# Start a local server (required for ES modules)
cd /path/to/glsl
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

---

## 📁 Files

### WebGL (Works Everywhere)

| File | Description |
|------|-------------|
| `webgl.html` | Basic interactive plasma demo |
| `water.html` | Real-time water caustics & ripples |
| `fire.html` | Persistent fire simulation with ping-pong FBOs |

### WebGPU (Chrome 129+)

| File | Description |
|------|-------------|
| `webgpu.html` | Interactive plasma with compute shaders |
| `webgpu-fire.html` | GPU compute fire simulation |
| `webgpu-water.html` | Wave equation water simulation |
| `webgpu-smoke.html` | Volumetric smoke with vorticity |

---

## 🎨 How to Use

### WebGL — The `glsl()` Function

Write a single function call with your shader:

```javascript
glsl(`
  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - resolution.xy * 0.5) / resolution.y;
    uv += mouse * 0.2;
    float t = time;
    vec3 col = 0.5 + 0.5 * cos(t + uv.xyx * 3.0 + vec3(0, 2, 4));
    fragColor = vec4(col, 1.0);
  }
`);
```

**Built-in uniforms (automatic):**
- `float time` — seconds since start
- `vec2 resolution` — canvas size in pixels
- `vec2 mouse` — normalized mouse position (-1 to 1)
- `float mouseDown` — 1.0 if mouse button pressed

**Hot reload from console:**
```javascript
glsl.hot(`your new shader code`)
```

### WebGPU — The `gpu()` Function

Two shaders: compute (simulation) + render (display):

```javascript
gpu(
  // Compute shader (WGSL)
  `fn compute(C: vec2<i32>, uv: vec2<f32>) {
    // Your simulation logic
    textureStore(dst, C, vec4<f32>(color, 1.0));
  }`,
  
  // Render shader (WGSL)
  `fn render(data: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {
    return data;
  }`
);
```

**Built-in uniforms:**
- `u.time` — seconds since start
- `u.mouseX`, `u.mouseY` — normalized mouse (0 to 1)
- `u.mouseDown` — 1.0 if pressed
- `u.prevMouseX`, `u.prevMouseY` — previous frame mouse
- `u.width`, `u.height` — texture dimensions

**Built-in functions:**
- `sample(vec2<i32>)` — read from previous frame (bounds-checked)
- `textureStore(dst, C, color)` — write to current frame

---

## 🔥 Demo Descriptions

### Fire Simulation
- **Physics:** Heat diffusion, buoyancy, combustion
- **Interaction:** Hold & drag mouse to ignite flames
- **Features:** Continuous fire source, smoke trails, blackbody colors

### Water Simulation
- **Physics:** Wave equation, caustics, Fresnel reflection
- **Interaction:** Move mouse to create ripples, click for bigger waves
- **Features:** Random raindrops, foam on crests, refraction

### Smoke Simulation
- **Physics:** Advection, vorticity confinement, temperature-driven buoyancy
- **Interaction:** Hold & drag to blow wind through smoke
- **Features:** Self-shadowing, volumetric scattering, embers

---

## 🎯 The Pattern

This framework uses the **"Hookable Fluent"** pattern:

1. **Simple default** — works with zero config
2. **Full power** — hook into any stage to customize
3. **Chainable** — compose multiple effects
4. **Hot-reloadable** — change code without refresh

```
Old World                    New World
─────────                    ─────────
400 lines of boilerplate →   1 function call
"How do I pass time?" →      It's already there
"Where is mouse?" →          It's already there
"How do I hot reload?" →     glsl.hot(newCode)
```

---

## 🛠 Requirements

- **WebGL:** Any modern browser (Chrome, Firefox, Safari, Edge)
- **WebGPU:** Chrome 129+, Edge with WebGPU flag enabled

---

## 🌟 Tips

1. **Start simple** — the basic demos work instantly
2. **Use hot reload** — experiment in the console
3. **Copy patterns** — the fire/water/smoke shaders show common techniques
4. **Check the console** — errors and info are logged there

---

## 📜 License

MIT — Use this however you want. Make impossible art.

---

**This is the endgame of creative coding.**

One function. Infinite possibilities.

Go create something that has never existed.