import { describe, it, expect } from 'vitest';
import { vec3 } from '../src/core/transforms.js';

describe('vec3 utilities', () => {
  it('create/clone/set', () => {
    const v = vec3.create(1, 2, 3);
    expect(v[0]).toBe(1);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(3);

    const c = vec3.clone(v);
    expect(c).toEqual(v);

    vec3.set(c, 4, 5, 6);
    expect(c[0]).toBe(4);
    expect(c[1]).toBe(5);
    expect(c[2]).toBe(6);
  });

  it('add/subtract/scale', () => {
    const a = vec3.create(1, 2, 3);
    const b = vec3.create(2, 1, 0);
    const out = vec3.create();
    vec3.add(out, a, b);
    expect(out).toEqual(new Float32Array([3,3,3]));
    vec3.subtract(out, a, b);
    expect(out).toEqual(new Float32Array([-1,1,3]));
    vec3.scale(out, a, 2);
    expect(out).toEqual(new Float32Array([2,4,6]));
  });

  it('dot/cross/length/normalize', () => {
    const a = vec3.create(1, 0, 0);
    const b = vec3.create(0, 1, 0);
    expect(vec3.dot(a, b)).toBe(0);
    const out = vec3.create();
    vec3.cross(out, a, b);
    expect(Array.from(out)).toEqual([0,0,1]);
    expect(vec3.length(a)).toBeCloseTo(1);
    const v = vec3.create(3, 0, 0);
    vec3.normalize(v, v);
    expect(v[0]).toBeCloseTo(1);
  });
});
