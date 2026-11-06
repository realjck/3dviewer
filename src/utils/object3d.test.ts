import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { applyTexture, disposeObject, nameUnnamedMaterials, setWireframe } from './object3d';

const geometry = () => new THREE.BoxGeometry();

describe('nameUnnamedMaterials', () => {
  it('names unnamed materials once, keeping existing names', () => {
    const shared = new THREE.MeshStandardMaterial();
    const wood = new THREE.MeshStandardMaterial({ name: 'Wood' });
    const other = new THREE.MeshStandardMaterial();
    const group = new THREE.Group().add(
      new THREE.Mesh(geometry(), shared),
      new THREE.Mesh(geometry(), [wood, other]),
      new THREE.Mesh(geometry(), shared)
    );

    nameUnnamedMaterials(group);

    expect([shared.name, wood.name, other.name]).toEqual(['Material 1', 'Wood', 'Material 2']);
  });
});

describe('setWireframe', () => {
  it('applies to every material of multi-material meshes', () => {
    const materials = [new THREE.MeshStandardMaterial(), new THREE.MeshBasicMaterial()];
    const mesh = new THREE.Mesh(geometry(), materials);

    setWireframe(mesh, true);
    expect(materials.map((m) => m.wireframe)).toEqual([true, true]);

    setWireframe(mesh, false);
    expect(materials.map((m) => m.wireframe)).toEqual([false, false]);
  });
});

describe('applyTexture', () => {
  it('sets the map and a white color only on materials with the given name', () => {
    const target = new THREE.MeshStandardMaterial({ name: 'Body', color: 0xff0000 });
    const untouched = new THREE.MeshStandardMaterial({ name: 'Glass', color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry(), [target, untouched]);
    const texture = new THREE.Texture();

    applyTexture(mesh, 'Body', texture);

    expect(target.map).toBe(texture);
    expect(target.color.getHex()).toBe(0xffffff);
    expect(untouched.map).toBeNull();
    expect(untouched.color.getHex()).toBe(0xff0000);
  });

  it('disposes the texture it replaces', () => {
    const previous = new THREE.Texture();
    const dispose = vi.spyOn(previous, 'dispose');
    const material = new THREE.MeshStandardMaterial({ name: 'Body', map: previous });

    applyTexture(new THREE.Mesh(geometry(), material), 'Body', new THREE.Texture());

    expect(dispose).toHaveBeenCalledOnce();
  });
});

describe('disposeObject', () => {
  it('disposes geometries, materials and their textures', () => {
    const mesh = new THREE.Mesh(geometry(), new THREE.MeshStandardMaterial({ map: new THREE.Texture() }));
    const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());
    const spies = [
      vi.spyOn(mesh.geometry, 'dispose'),
      vi.spyOn(mesh.material, 'dispose'),
      vi.spyOn(mesh.material.map!, 'dispose'),
      vi.spyOn(line.geometry, 'dispose'),
      vi.spyOn(line.material as THREE.Material, 'dispose'),
    ];

    disposeObject(new THREE.Group().add(mesh, line));

    for (const spy of spies) expect(spy).toHaveBeenCalledOnce();
  });
});
