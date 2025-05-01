import * as THREE from 'three';
import { ModelInfo } from '../types/ModelInfo';

export function extractModelInfo(object: THREE.Object3D): ModelInfo {
  let vertices = 0;
  let faces = 0;
  const materials: string[] = [];
  const materialMap = new Set<string>();
  
  // Calculate bounding box to get dimensions
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  
  // Traverse the object to count vertices, faces, and collect materials
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const geometry = child.geometry;
      
      // Count vertices
      if (geometry.attributes.position) {
        vertices += geometry.attributes.position.count;
      }
      
      // Count faces
      if (geometry.index) {
        faces += geometry.index.count / 3;
      } else if (geometry.attributes.position) {
        faces += geometry.attributes.position.count / 3;
      }
      
      // Collect materials
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat.name && !materialMap.has(mat.name)) {
              materialMap.add(mat.name);
              materials.push(mat.name || `Material ${materials.length + 1}`);
            }
          });
        } else if (child.material.name && !materialMap.has(child.material.name)) {
          materialMap.add(child.material.name);
          materials.push(child.material.name || `Material ${materials.length + 1}`);
        }
      }
    }
  });
  
  return {
    vertices,
    faces,
    dimensions: {
      x: size.x,
      y: size.y,
      z: size.z,
    },
    materials: materials.length > 0 ? materials : ['Default Material'],
  };
}