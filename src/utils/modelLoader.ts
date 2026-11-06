import * as THREE from 'three';

interface GltfJson {
  buffers?: { uri?: string }[];
  images?: { uri?: string }[];
}

/**
 * A single .gltf file cannot resolve its relative .bin or image files from a blob
 * URL, so detect them upfront and explain instead of failing on a missing buffer.
 */
async function assertSelfContainedGltf(url: string): Promise<void> {
  let gltf: GltfJson;
  try {
    gltf = await (await fetch(url)).json();
  } catch {
    return; // Not valid JSON: let GLTFLoader report the problem
  }
  const external = [...(gltf.buffers ?? []), ...(gltf.images ?? [])]
    .map((resource) => resource.uri)
    .filter((uri): uri is string => !!uri && !uri.startsWith('data:'));
  if (external.length > 0) {
    throw new Error(
      `it references external files (${external.join(', ')}). Use a .glb file or a .gltf with embedded resources.`
    );
  }
}

async function loadGltf(url: string): Promise<THREE.Object3D> {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  return (await new GLTFLoader().loadAsync(url)).scene;
}

// Loaders are imported on demand so each format's code is only downloaded when used
async function loadByFormat(url: string, format: string): Promise<THREE.Object3D> {
  switch (format) {
    case 'gltf':
      await assertSelfContainedGltf(url);
      return loadGltf(url);
    case 'glb':
      return loadGltf(url);
    case 'obj': {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      return new OBJLoader().loadAsync(url);
    }
    case 'fbx': {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      return new FBXLoader().loadAsync(url);
    }
    case 'dae': {
      const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js');
      return (await new ColladaLoader().loadAsync(url)).scene;
    }
    case 'stl': {
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
      // STL has no material data, so give it a default one
      const geometry = await new STLLoader().loadAsync(url);
      const material = new THREE.MeshStandardMaterial({ color: 0x7777ff, metalness: 0.3, roughness: 0.6 });
      return new THREE.Mesh(geometry, material);
    }
    case '3ds': {
      const { TDSLoader } = await import('three/examples/jsm/loaders/TDSLoader.js');
      return new TDSLoader().loadAsync(url);
    }
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
    throw new Error(`Could not load this ${modelFormat.toUpperCase()} file: ${message}`);
  }
}
