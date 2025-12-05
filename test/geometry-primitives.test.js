import { describe, it, expect } from 'vitest';
import { plane, cube, sphere } from '../src/core/geometry.js';

describe('geometry primitives', () => {
  it('plane returns positions and indices', () => {
    const g = plane({ widthSegments: 2, heightSegments: 2 });
    expect(g.positions).toBeDefined();
    expect(g.indices).toBeDefined();
    expect(g.positions.length).toBeGreaterThan(0);
    expect(g.indices.length).toBeGreaterThan(0);
  });

  it('cube returns positions and indices', () => {
    const g = cube();
    expect(g.positions.length).toBeGreaterThan(0);
    expect(g.indices.length).toBeGreaterThan(0);
  });

  it('sphere returns positions and indices', () => {
    const g = sphere({ widthSegments: 8, heightSegments: 6 });
    expect(g.positions.length).toBeGreaterThan(0);
    expect(g.indices.length).toBeGreaterThan(0);
  });
});
