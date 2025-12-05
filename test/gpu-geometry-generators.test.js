import { describe, it, expect } from 'vitest';
import { gpuCubeGeometry, gpuSphereGeometry, gpuPlaneGeometry, gpuTorusGeometry } from '../src/gpu/gpuGeometry.js';

describe('GPU geometry generators', () => {
  it('gpuCubeGeometry creates cube', () => {
    const cube = gpuCubeGeometry(1);
    expect(cube.positions).toBeDefined();
    expect(cube.indices).toBeDefined();
    expect(cube.normals).toBeDefined();
    expect(cube.positions.length).toBeGreaterThan(0);
  });

  it('gpuSphereGeometry creates sphere', () => {
    const sphere = gpuSphereGeometry(0.5, 16, 16);
    expect(sphere.positions).toBeDefined();
    expect(sphere.indices).toBeDefined();
    expect(sphere.positions.length).toBeGreaterThan(0);
  });

  it('gpuPlaneGeometry creates plane', () => {
    const plane = gpuPlaneGeometry(1, 1, 4, 4);
    expect(plane.positions).toBeDefined();
    expect(plane.indices).toBeDefined();
    expect(plane.uvs).toBeDefined();
    expect(plane.positions.length).toBeGreaterThan(0);
  });

  it('gpuTorusGeometry creates torus', () => {
    const torus = gpuTorusGeometry(0.5, 0.2, 16, 16);
    expect(torus.positions).toBeDefined();
    expect(torus.indices).toBeDefined();
    expect(torus.positions.length).toBeGreaterThan(0);
  });
});
