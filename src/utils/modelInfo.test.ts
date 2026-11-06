import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { extractModelInfo } from './modelInfo';

describe('extractModelInfo', () => {
  it('counts vertices and faces of indexed geometry and measures dimensions', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 6), new THREE.MeshStandardMaterial({ name: 'Box' }));

    const info = extractModelInfo(mesh);

    // BoxGeometry: 6 faces x 4 vertices, 6 faces x 2 triangles
    expect(info.vertices).toBe(24);
    expect(info.faces).toBe(12);
    expect(info.dimensions).toEqual({ x: 2, y: 4, z: 6 });
    expect(info.materials).toEqual(['Box']);
  });

  it('counts faces of non-indexed geometry from its vertices', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry().toNonIndexed());

    const info = extractModelInfo(mesh);

    expect(info.vertices).toBe(36);
    expect(info.faces).toBe(12);
  });

  it('lists each named material once across meshes', () => {
    const wood = new THREE.MeshStandardMaterial({ name: 'Wood' });
    const metal = new THREE.MeshStandardMaterial({ name: 'Metal' });
    const unnamed = new THREE.MeshStandardMaterial();
    const group = new THREE.Group().add(
      new THREE.Mesh(new THREE.BoxGeometry(), wood),
      new THREE.Mesh(new THREE.BoxGeometry(), [metal, wood, unnamed])
    );

    expect(extractModelInfo(group).materials).toEqual(['Wood', 'Metal']);
  });
});
