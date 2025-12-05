import { describe, it, expect } from 'vitest';
import shader3d, { defaultVertex, defaultFragment, pbrShader } from '../src/core/shader3d.js';

describe('shader3d exports', () => {
  it('default shaders are strings', () => {
    expect(typeof defaultVertex).toBe('string');
    expect(typeof defaultFragment).toBe('string');
  });

  it('pbrShader returns a shader plugin object', () => {
    const s = pbrShader({ metallic: 0.5 });
    expect(typeof s).toBe('object');
    expect(s.name).toBe('shader3d');
    expect(typeof s.init).toBe('function');
    expect(typeof s.render).toBe('function');
  });
});
