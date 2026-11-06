import * as THREE from 'three';
import { ModelInfo } from '../types/ModelInfo';

/** Counts vertices and faces, measures the bounding box and lists material names. */
export function extractModelInfo(object: THREE.Object3D): ModelInfo {
  let vertices = 0;
  let faces = 0;
  const materials = new Set<string>();

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const geometry = child.geometry as THREE.BufferGeometry;
    const position = geometry.attributes.position;
    if (position) {
      vertices += position.count;
      faces += (geometry.index ? geometry.index.count : position.count) / 3;
    }

    const childMaterials: THREE.Material[] = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((material) => {
      if (material.name) materials.add(material.name);
    });
  });

  const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());

  return {
    vertices,
    faces,
    dimensions: { x: size.x, y: size.y, z: size.z },
    materials: [...materials],
  };
}
