import * as THREE from 'three';

type Renderable = THREE.Mesh | THREE.Line | THREE.Points;

function isRenderable(object: THREE.Object3D): object is Renderable {
  return object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points;
}

function materialsOf(object: Renderable): THREE.Material[] {
  return Array.isArray(object.material) ? object.material : [object.material];
}

export function setWireframe(object: THREE.Object3D, enabled: boolean): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      materialsOf(child).forEach((material) => {
        (material as THREE.MeshBasicMaterial).wireframe = enabled;
      });
    }
  });
}

/** Names unnamed materials so they can be listed and targeted by name. */
export function nameUnnamedMaterials(object: THREE.Object3D): void {
  let count = 0;
  object.traverse((child) => {
    if (!isRenderable(child)) return;
    materialsOf(child).forEach((material) => {
      if (!material.name) material.name = `Material ${++count}`;
    });
  });
}

/** Uses the texture as color map for every material with the given name. */
export function applyTexture(object: THREE.Object3D, materialName: string, texture: THREE.Texture): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    materialsOf(child).forEach((material) => {
      if (material.name !== materialName) return;
      const textured = material as THREE.MeshStandardMaterial;
      textured.map?.dispose();
      textured.map = texture;
      // White base color so the texture is not tinted
      textured.color.set(0xffffff);
      textured.needsUpdate = true;
    });
  });
}

/** Frees the GPU resources (geometries, materials, textures) held by an object tree. */
export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!isRenderable(child)) return;
    child.geometry.dispose();
    materialsOf(child).forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}
