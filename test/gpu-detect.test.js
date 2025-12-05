import { describe, it, expect } from 'vitest';
import { hasWebGPU } from '../src/gpu/gpuFlow.js';

describe('GPU detection', () => {
  it('hasWebGPU returns a boolean', () => {
    const result = hasWebGPU();
    expect(typeof result).toBe('boolean');
  });
});
