import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

async function loadByFormat(url: string, format: string): Promise<THREE.Object3D> {
  switch (format) {
    case 'gltf':
    case 'glb':
      return (await new GLTFLoader().loadAsync(url)).scene;
    case 'obj':
      return new OBJLoader().loadAsync(url);
    case 'fbx':
      return new FBXLoader().loadAsync(url);
    case 'dae':
      return (await new ColladaLoader().loadAsync(url)).scene;
    case 'stl': {
      // STL has no material data, so give it a default one
      const geometry = await new STLLoader().loadAsync(url);
      const material = new THREE.MeshStandardMaterial({ color: 0x7777ff, metalness: 0.3, roughness: 0.6 });
      return new THREE.Mesh(geometry, material);
    }
    case '3ds':
      return new TDSLoader().loadAsync(url);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/** Loads a model from a URL using the loader matching its file extension. */
export async function loadModel(url: string, format: string): Promise<THREE.Object3D> {
  const modelFormat = format.toLowerCase();
  try {
    return await loadByFormat(url, modelFormat);
  } catch (error) {
    // Loaders may reject with a ProgressEvent rather than an Error
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error loading ${modelFormat.toUpperCase()} model: ${message}`);
  }
}
