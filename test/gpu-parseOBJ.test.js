import { describe, it, expect } from 'vitest';
import { parseOBJ } from '../src/gpu/gpuGeometry.js';

describe('gpu parseOBJ', () => {
  it('parses simple triangle', () => {
    const obj = `v 0 0 0\nv 1 0 0\nv 0 1 0\nvt 0 0\nvt 1 0\nvt 0 1\nvn 0 0 1\nvn 0 0 1\nvn 0 0 1\nf 1/1/1 2/2/2 3/3/3`;
    const geom = parseOBJ(obj);
    expect(geom.positions.length).toBe(9);
    expect(geom.uvs.length).toBe(6);
    expect(geom.normals.length).toBe(9);
    expect(geom.indices.length).toBe(3);
  });
});
