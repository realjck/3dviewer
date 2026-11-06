import * as THREE from 'three';

/** Loads a texture from a URL; TGA support is imported on demand. */
export async function loadTexture(url: string, fileName: string): Promise<THREE.Texture> {
  if (fileName.toLowerCase().endsWith('.tga')) {
    const { TGALoader } = await import('three/examples/jsm/loaders/TGALoader.js');
    return new TGALoader().loadAsync(url);
  }
  return new THREE.TextureLoader().loadAsync(url);
}
