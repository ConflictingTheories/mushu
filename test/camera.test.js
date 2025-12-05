import { describe, it, expect } from 'vitest';
import { camera } from '../src/core/transforms.js';

describe('camera utilities', () => {
  it('camera creates a camera object', () => {
    const cam = camera();
    expect(cam).toBeDefined();
    expect(typeof cam).toBe('object');
  });

  it('camera with custom options', () => {
    const cam = camera({
      position: [0, 0, 5],
      target: [0, 0, 0],
      up: [0, 1, 0],
      fov: 45,
      aspect: 1.0,
      near: 0.1,
      far: 1000
    });
    expect(cam).toBeDefined();
    expect(cam.position).toBeDefined();
  });

  it('camera has matrices', () => {
    const cam = camera();
    expect(cam.view).toBeDefined();
    expect(cam.projection).toBeDefined();
    expect(cam.viewProjection).toBeDefined();
  });
});
