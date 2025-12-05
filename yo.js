// ═══════════════════════════════════════════════════════════════════════════
// yo.js — The Hookable Fluent Pattern for Creative Coding
// 
// Philosophy:
//   • Simple by default — works with zero config
//   • Powerful when needed — hook into any stage
//   • Chainable — compose behaviors fluently
//   • Hot-reloadable — change anything at runtime
//
// Usage:
//   yo(canvas)
//     .use(shader(myCode))
//     .use(uniform('time', ctx => ctx.time))
//     .go()
//
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Core: The Hookable Runtime
// ─────────────────────────────────────────────────────────────────────────────

export function yo(canvasOrGl) {
  // Accept either canvas element or WebGL context
  const canvas = canvasOrGl.getContext ? canvasOrGl : canvasOrGl.canvas;
  const gl = canvasOrGl.getContext ? canvasOrGl.getContext('webgl2') : canvasOrGl;
  
  if (!gl) {
    console.error('WebGL2 not supported');
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal state
  // ─────────────────────────────────────────────────────────────────────────
  const plugins = [];
  let running = false;
  let animationId = null;
  
  // Shared context passed to all plugins
  const ctx = {
    gl,
    canvas,
    time: 0,
    delta: 0,
    frame: 0,
    width: 0,
    height: 0,
    aspect: 1,
    mouse: [0, 0],
    mouseDown: false,
    program: null,
    // Allow plugins to store shared state
    state: {},
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-resize
  // ─────────────────────────────────────────────────────────────────────────
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.width = canvas.width;
    ctx.height = canvas.height;
    ctx.aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Mouse tracking
  // ─────────────────────────────────────────────────────────────────────────
  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    ctx.mouse[0] = (e.clientX - rect.left) / rect.width * 2 - 1;
    ctx.mouse[1] = 1 - (e.clientY - rect.top) / rect.height * 2;
  };
  const onMouseDown = () => { ctx.mouseDown = true; };
  const onMouseUp = () => { ctx.mouseDown = false; };

  // ─────────────────────────────────────────────────────────────────────────
  // The render loop
  // ─────────────────────────────────────────────────────────────────────────
  let lastTime = 0;
  const loop = (t) => {
    ctx.time = t * 0.001;
    ctx.delta = ctx.time - lastTime;
    lastTime = ctx.time;
    ctx.frame++;

    // Run all plugins in order
    for (const plugin of plugins) {
      if (typeof plugin === 'function') {
        plugin(ctx);
      } else if (plugin.render) {
        plugin.render(ctx);
      }
    }

    if (running) {
      animationId = requestAnimationFrame(loop);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // The fluent API
  // ─────────────────────────────────────────────────────────────────────────
  const api = {
    // Add a plugin (function or object with render method)
    use(plugin) {
      // If plugin is a function that returns a plugin, call it with ctx
      if (typeof plugin === 'function' && plugin.length === 0) {
        const result = plugin();
        if (result) plugins.push(result);
      } else {
        plugins.push(plugin);
      }
      return api;
    },

    // Start the render loop
    go() {
      // Setup
      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);

      // Initialize plugins
      for (const plugin of plugins) {
        if (plugin.init) plugin.init(ctx);
      }

      running = true;
      animationId = requestAnimationFrame(loop);
      return api;
    },

    // Alias for go
    start() { return api.go(); },

    // Stop the render loop
    stop() {
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      return api;
    },

    // Access context directly
    get ctx() { return ctx; },

    // Hot reload a specific plugin by name
    hot(name, newPlugin) {
      const idx = plugins.findIndex(p => p.name === name);
      if (idx >= 0) {
        if (plugins[idx].destroy) plugins[idx].destroy(ctx);
        plugins[idx] = newPlugin;
        if (newPlugin.init) newPlugin.init(ctx);
      }
      return api;
    },

    // Remove all plugins and reset
    reset() {
      for (const plugin of plugins) {
        if (plugin.destroy) plugin.destroy(ctx);
      }
      plugins.length = 0;
      return api;
    },
  };

  return api;
}

// ─────────────────────────────────────────────────────────────────────────────
// Built-in Plugins
// ─────────────────────────────────────────────────────────────────────────────

// Clear the screen with a color
export function clear(colorOrFn = [0, 0, 0, 1]) {
  return (ctx) => {
    const c = typeof colorOrFn === 'function' ? colorOrFn(ctx) : colorOrFn;
    ctx.gl.clearColor(c[0] || 0, c[1] || 0, c[2] || 0, c[3] ?? 1);
    ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);
  };
}

// Fullscreen quad (sets up VAO for drawing)
export function quad() {
  let vao = null;
  
  return {
    name: 'quad',
    init(ctx) {
      vao = ctx.gl.createVertexArray();
      ctx.gl.bindVertexArray(vao);
    },
    render(ctx) {
      ctx.gl.bindVertexArray(vao);
      ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, 3);
    }
  };
}

// Compile and use a fragment shader
export function shader(fragSource) {
  let program = null;
  
  const vertSource = `#version 300 es
    void main() {
      vec2 positions[3] = vec2[](vec2(-1,-1), vec2(3,-1), vec2(-1,3));
      gl_Position = vec4(positions[gl_VertexID], 0, 1);
    }`;
  
  const compile = (ctx) => {
    const gl = ctx.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertSource);
    gl.compileShader(vs);
    
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const fullFrag = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouse;
      uniform float mouseDown;
      ${fragSource}
      void main() { mainImage(fragColor, gl_FragCoord.xy); }`;
    gl.shaderSource(fs, fullFrag);
    gl.compileShader(fs);
    
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(fs));
      return null;
    }
    
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    
    return p;
  };
  
  return {
    name: 'shader',
    init(ctx) {
      program = compile(ctx);
      ctx.program = program;
    },
    render(ctx) {
      if (!program) return;
      const gl = ctx.gl;
      gl.useProgram(program);
      ctx.program = program;
      
      // Auto-set built-in uniforms
      gl.uniform1f(gl.getUniformLocation(program, 'time'), ctx.time);
      gl.uniform2f(gl.getUniformLocation(program, 'resolution'), ctx.width, ctx.height);
      gl.uniform2f(gl.getUniformLocation(program, 'mouse'), ctx.mouse[0], ctx.mouse[1]);
      gl.uniform1f(gl.getUniformLocation(program, 'mouseDown'), ctx.mouseDown ? 1 : 0);
    },
    // Allow hot-reload
    reload(newSource, ctx) {
      const gl = ctx.gl;
      if (program) gl.deleteProgram(program);
      fragSource = newSource;
      program = compile(ctx);
      ctx.program = program;
    }
  };
}

// Set a custom uniform
export function uniform(name, valueOrFn) {
  let location = null;
  
  return {
    name: `uniform:${name}`,
    render(ctx) {
      if (!ctx.program) return;
      const gl = ctx.gl;
      
      if (!location) {
        location = gl.getUniformLocation(ctx.program, name);
      }
      if (!location) return;
      
      const value = typeof valueOrFn === 'function' ? valueOrFn(ctx) : valueOrFn;
      
      if (typeof value === 'number') {
        gl.uniform1f(location, value);
      } else if (value.length === 2) {
        gl.uniform2fv(location, value);
      } else if (value.length === 3) {
        gl.uniform3fv(location, value);
      } else if (value.length === 4) {
        gl.uniform4fv(location, value);
      }
    }
  };
}

// FPS counter
export function fps() {
  let div = null;
  let lastUpdate = 0;
  
  return {
    name: 'fps',
    init() {
      div = document.createElement('div');
      div.style.cssText = 'position:fixed;top:10px;left:10px;color:white;font:14px monospace;background:rgba(0,0,0,0.5);padding:6px 10px;border-radius:4px;z-index:1000';
      document.body.appendChild(div);
    },
    render(ctx) {
      if (ctx.time - lastUpdate > 0.25) {
        div.textContent = `${(1 / ctx.delta).toFixed(0)} fps`;
        lastUpdate = ctx.time;
      }
    },
    destroy() {
      if (div) div.remove();
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Advanced: Ping-pong FBO for simulations
// ─────────────────────────────────────────────────────────────────────────────

export function simulation(options = {}) {
  const {
    scale = 0.5,  // Resolution scale
    format = 'RGBA16F',
  } = options;
  
  let fboA, fboB, texA, texB;
  let simProgram = null;
  let renderProgram = null;
  let width, height;
  
  const createFBO = (gl, w, h) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    
    return { fb, tex };
  };
  
  const compileShader = (gl, fragSrc, includeBackbuffer = false, addHelpers = false) => {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `#version 300 es
      void main() {
        vec2 positions[3] = vec2[](vec2(-1,-1), vec2(3,-1), vec2(-1,3));
        gl_Position = vec4(positions[gl_VertexID], 0, 1);
      }`);
    gl.compileShader(vs);
    
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    const helpers = addHelpers ? `
      vec4 sample(vec2 offset) {
        vec2 uv = (gl_FragCoord.xy + offset) / resolution;
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0);
        return texture(backbuffer, uv);
      }
    ` : '';
    const prefix = `#version 300 es
      precision highp float;
      out vec4 fragColor;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouse;
      uniform float mouseDown;
      ${includeBackbuffer ? 'uniform sampler2D backbuffer;' : ''}
      ${helpers}
    `;
    gl.shaderSource(fs, prefix + fragSrc + `\nvoid main() { mainImage(fragColor, gl_FragCoord.xy); }`);
    gl.compileShader(fs);
    
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(fs));
      return null;
    }
    
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
  };
  
  return {
    name: 'simulation',
    
    // Set simulation shader
    simulate(fragSrc) {
      this._simSrc = fragSrc;
      return this;
    },
    
    // Set render/display shader
    display(fragSrc) {
      this._renderSrc = fragSrc;
      return this;
    },
    
    init(ctx) {
      const gl = ctx.gl;
      gl.getExtension('EXT_color_buffer_float');
      
      width = Math.floor(ctx.width * scale);
      height = Math.floor(ctx.height * scale);
      
      const a = createFBO(gl, width, height);
      const b = createFBO(gl, width, height);
      fboA = a.fb; texA = a.tex;
      fboB = b.fb; texB = b.tex;
      
      if (this._simSrc) {
        simProgram = compileShader(gl, this._simSrc, true, true); // backbuffer + helpers
      }
      if (this._renderSrc) {
        renderProgram = compileShader(gl, this._renderSrc, true, false); // backbuffer only
      }
    },
    
    render(ctx) {
      const gl = ctx.gl;
      
      // Simulation pass
      if (simProgram) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fboB);
        gl.viewport(0, 0, width, height);
        gl.useProgram(simProgram);
        
        gl.uniform1f(gl.getUniformLocation(simProgram, 'time'), ctx.time);
        gl.uniform2f(gl.getUniformLocation(simProgram, 'resolution'), width, height);
        gl.uniform2f(gl.getUniformLocation(simProgram, 'mouse'), ctx.mouse[0] * 0.5 + 0.5, ctx.mouse[1] * 0.5 + 0.5);
        gl.uniform1f(gl.getUniformLocation(simProgram, 'mouseDown'), ctx.mouseDown ? 1 : 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texA);
        gl.uniform1i(gl.getUniformLocation(simProgram, 'backbuffer'), 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      
      // Render pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, ctx.width, ctx.height);
      
      if (renderProgram) {
        gl.useProgram(renderProgram);
        gl.uniform1f(gl.getUniformLocation(renderProgram, 'time'), ctx.time);
        gl.uniform2f(gl.getUniformLocation(renderProgram, 'resolution'), ctx.width, ctx.height);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texB);
        gl.uniform1i(gl.getUniformLocation(renderProgram, 'backbuffer'), 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      
      // Swap buffers
      [fboA, fboB] = [fboB, fboA];
      [texA, texB] = [texB, texA];
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WebGPU Support
// ─────────────────────────────────────────────────────────────────────────────

export function yoGPU(canvas) {
  // Return a builder that initializes async on go()
  let displayCode = null;
  let simulateCode = null;
  
  const builder = {
    display(code) {
      displayCode = code;
      return builder;
    },
    simulate(code) {
      simulateCode = code;
      return builder;
    },
    async go() {
      if (!navigator.gpu) {
        console.error('WebGPU not supported');
        return null;
      }
      
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.error('No WebGPU adapter found');
        return null;
      }
      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu');
      const format = navigator.gpu.getPreferredCanvasFormat();
      
      let width = canvas.width;
      let height = canvas.height;
      
      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        width = Math.floor(rect.width * dpr);
        height = Math.floor(rect.height * dpr);
        canvas.width = width;
        canvas.height = height;
        context.configure({ device, format, alphaMode: 'premultiplied' });
      };
      resize();
      window.addEventListener('resize', resize);
      
      const mouse = [0.5, 0.5, 0.5, 0.5];
      let mouseDown = false;
      
      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse[2] = mouse[0];
        mouse[3] = mouse[1];
        mouse[0] = e.clientX / rect.width;
        mouse[1] = 1 - e.clientY / rect.height;
      });
      canvas.addEventListener('mousedown', () => mouseDown = true);
      canvas.addEventListener('mouseup', () => mouseDown = false);
      
      let running = true;
      let time = 0;
      let lastTime = performance.now() * 0.001;
      
      // Create uniform buffer
      const uniformBuffer = device.createBuffer({
        size: 32,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
      
      // If we have a simulation, set up compute + render
      if (simulateCode) {
        // Create ping-pong textures
        const createTex = () => device.createTexture({
          size: [width, height],
          format: 'rgba16float',
          usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
        });
        let stateA = createTex();
        let stateB = createTex();
        
        const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
        
        // Compute shader
        const computeModule = device.createShaderModule({
          code: simulateCode
        });
        
        const computeBindGroupLayout = device.createBindGroupLayout({
          entries: [
            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            { binding: 4, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: 'unfilterable-float' } },
            { binding: 5, visibility: GPUShaderStage.COMPUTE, storageTexture: { access: 'write-only', format: 'rgba16float' } }
          ]
        });
        
        const computePipeline = device.createComputePipeline({
          layout: device.createPipelineLayout({ bindGroupLayouts: [computeBindGroupLayout] }),
          compute: { module: computeModule, entryPoint: 'main' }
        });
        
        // Create individual uniform buffers
        const timeBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const resBuffer = device.createBuffer({ size: 8, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const mouseBuffer = device.createBuffer({ size: 8, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const mouseDownBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        
        // Render shader
        const renderModule = device.createShaderModule({
          code: `
            struct VertexOutput { @builtin(position) position: vec4f, @location(0) uv: vec2f }
            @vertex fn vs(@builtin(vertex_index) i: u32) -> VertexOutput {
              var pos = array<vec2f, 3>(vec2f(-1,-1), vec2f(3,-1), vec2f(-1,3));
              var output: VertexOutput;
              output.position = vec4f(pos[i], 0.0, 1.0);
              output.uv = pos[i] * 0.5 + 0.5;
              return output;
            }
            @group(0) @binding(0) var<uniform> time: f32;
            @group(0) @binding(1) var<uniform> resolution: vec2f;
            @group(0) @binding(4) var simTex: texture_2d<f32>;
            @group(0) @binding(6) var texSampler: sampler;
            ${displayCode}
          `
        });
        
        const renderPipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: renderModule, entryPoint: 'vs' },
          fragment: { module: renderModule, entryPoint: 'main', targets: [{ format }] },
          primitive: { topology: 'triangle-list' }
        });
        
        const loop = () => {
          if (!running) return;
          
          const now = performance.now() * 0.001;
          time = now;
          
          // Update uniforms
          device.queue.writeBuffer(timeBuffer, 0, new Float32Array([time]));
          device.queue.writeBuffer(resBuffer, 0, new Float32Array([width, height]));
          device.queue.writeBuffer(mouseBuffer, 0, new Float32Array([mouse[0], mouse[1]]));
          device.queue.writeBuffer(mouseDownBuffer, 0, new Float32Array([mouseDown ? 1 : 0]));
          
          const encoder = device.createCommandEncoder();
          
          // Compute pass
          const computeBindGroup = device.createBindGroup({
            layout: computeBindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: timeBuffer } },
              { binding: 1, resource: { buffer: resBuffer } },
              { binding: 2, resource: { buffer: mouseBuffer } },
              { binding: 3, resource: { buffer: mouseDownBuffer } },
              { binding: 4, resource: stateA.createView() },
              { binding: 5, resource: stateB.createView() }
            ]
          });
          
          const computePass = encoder.beginComputePass();
          computePass.setPipeline(computePipeline);
          computePass.setBindGroup(0, computeBindGroup);
          computePass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8));
          computePass.end();
          
          // Render pass
          const renderBindGroup = device.createBindGroup({
            layout: renderPipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: timeBuffer } },
              { binding: 1, resource: { buffer: resBuffer } },
              { binding: 4, resource: stateB.createView() },
              { binding: 6, resource: sampler }
            ]
          });
          
          const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
              view: context.getCurrentTexture().createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: 'clear',
              storeOp: 'store'
            }]
          });
          renderPass.setPipeline(renderPipeline);
          renderPass.setBindGroup(0, renderBindGroup);
          renderPass.draw(3);
          renderPass.end();
          
          device.queue.submit([encoder.finish()]);
          
          // Swap
          [stateA, stateB] = [stateB, stateA];
          
          requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
        return builder;
      }
      
      // Simple display-only mode (no compute)
      if (displayCode) {
        const timeBuffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const resBuffer = device.createBuffer({ size: 8, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        
        const vertexShader = `
          struct VertexOutput { @builtin(position) position: vec4f, @location(0) uv: vec2f }
          @vertex fn vs(@builtin(vertex_index) i: u32) -> VertexOutput {
            var pos = array<vec2f, 3>(vec2f(-1,-1), vec2f(3,-1), vec2f(-1,3));
            var output: VertexOutput;
            output.position = vec4f(pos[i], 0.0, 1.0);
            output.uv = pos[i] * 0.5 + 0.5;
            return output;
          }
        `;
        
        const shaderModule = device.createShaderModule({
          code: vertexShader + displayCode
        });
        
        const pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: { module: shaderModule, entryPoint: 'vs' },
          fragment: { module: shaderModule, entryPoint: 'main', targets: [{ format }] },
          primitive: { topology: 'triangle-list' }
        });
        
        const loop = () => {
          if (!running) return;
          
          const now = performance.now() * 0.001;
          time = now;
          
          device.queue.writeBuffer(timeBuffer, 0, new Float32Array([time]));
          device.queue.writeBuffer(resBuffer, 0, new Float32Array([width, height]));
          
          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({
            colorAttachments: [{
              view: context.getCurrentTexture().createView(),
              clearValue: [0, 0, 0, 1],
              loadOp: 'clear',
              storeOp: 'store'
            }]
          });
          
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: timeBuffer } },
              { binding: 1, resource: { buffer: resBuffer } }
            ]
          }));
          pass.draw(3);
          pass.end();
          
          device.queue.submit([encoder.finish()]);
          requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
      }
      
      return builder;
    },
    stop() {
      running = false;
      return builder;
    }
  };
  
  return builder;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export for convenience
// ─────────────────────────────────────────────────────────────────────────────
export default yo;
