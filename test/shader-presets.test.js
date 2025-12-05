import { describe, it, expect } from 'vitest';
import { unlitShader, normalShader, uvShader, depthShader } from '../src/core/shader3d.js';

describe('shader3d preset materials', () => {
  it('unlitShader creates plugin', () => {
    const s = unlitShader({ color: [1, 0, 0] });
    expect(s).toBeDefined();
    expect(s.name).toBe('shader3d');
    expect(typeof s.init).toBe('function');
    expect(typeof s.render).toBe('function');
  });

  it('normalShader creates plugin', () => {
    const s = normalShader();
    expect(s).toBeDefined();
    expect(s.name).toBe('shader3d');
  });

  it('uvShader creates plugin', () => {
    const s = uvShader();
    expect(s).toBeDefined();
    expect(s.name).toBe('shader3d');
  });

  it('depthShader creates plugin with near/far', () => {
    const s = depthShader({ near: 0.1, far: 100 });
    expect(s).toBeDefined();
    expect(s.name).toBe('shader3d');
  });
});
