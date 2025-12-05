import { describe, it, expect } from 'vitest';
import { mat4, vec4 } from '../src/core/transforms.js';

describe('mat4 utilities', () => {
  it('create identity matrix', () => {
    const m = mat4.create();
    expect(m[0]).toBe(1);
    expect(m[5]).toBe(1);
    expect(m[10]).toBe(1);
    expect(m[15]).toBe(1);
  });

  it('multiply matrices', () => {
    const a = mat4.create();
    const b = mat4.create();
    const out = mat4.create();
    mat4.multiply(out, a, b);
    expect(out[0]).toBe(1); // Should be identity * identity = identity
  });

  it('transpose matrix', () => {
    const m = new Float32Array(16);
    m.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const out = mat4.create();
    mat4.transpose(out, m);
    expect(out[1]).toBe(5); // Element at (0,1) swapped to (1,0)
  });

  it('invert matrix', () => {
    const m = mat4.create();
    const out = mat4.create();
    mat4.invert(out, m);
    // Identity inverse is identity
    expect(out[0]).toBe(1);
  });
});

describe('vec4 utilities', () => {
  it('create and access vec4', () => {
    const v = vec4.create(1, 2, 3, 4);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);
    expect(v[3]).toBe(4);
  });

  it('vec4 length and basic operations', () => {
    const v = vec4.create(1, 0, 0, 0);
    expect(vec4.length(v)).toBeCloseTo(1);
  });
});
