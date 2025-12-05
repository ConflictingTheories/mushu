// ═══════════════════════════════════════════════════════════════════════════
// mushu — The Hookable Fluent Pattern for Creative Coding
// 
// One import for everything:
//   import { yo, yoGPU, shader, simulation, glsl } from 'mushu';
//
// Or import specific modules:
//   import { yo, shader } from 'mushu/core';
//   import { noise, fbm } from 'mushu/glsl';
//   import { yoGPU, compute } from 'mushu/gpu';
// ═══════════════════════════════════════════════════════════════════════════

// Core WebGL runtime
export * from './core/index.js';

// GLSL shader utilities
export * from './glsl/index.js';

// WebGPU runtime
export * from './gpu/index.js';
