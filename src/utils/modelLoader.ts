import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';

export async function loadModel(
  url: string,
  format: string
): Promise<THREE.Object3D> {
  // Normalize format
  const modelFormat = format.toLowerCase();

  return new Promise((resolve, reject) => {
    // Select appropriate loader based on file format
    switch (modelFormat) {
      case 'gltf':
      case 'glb':
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          url,
          (gltf) => {
            resolve(gltf.scene);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading GLTF/GLB model: ${error.message}`));
          }
        );
        break;

      case 'obj':
        const objLoader = new OBJLoader();
        objLoader.load(
          url,
          (obj) => {
            resolve(obj);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading OBJ model: ${error.message}`));
          }
        );
        break;

      case 'fbx':
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          url,
          (fbx) => {
            resolve(fbx);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading FBX model: ${error.message}`));
          }
        );
        break;

      case 'dae':
        const colladaLoader = new ColladaLoader();
        colladaLoader.load(
          url,
          (collada) => {
            resolve(collada.scene);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading Collada model: ${error.message}`));
          }
        );
        break;

      case 'stl':
        const stlLoader = new STLLoader();
        stlLoader.load(
          url,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({
              color: 0x7777ff,
              metalness: 0.3,
              roughness: 0.6,
            });
            const mesh = new THREE.Mesh(geometry, material);
            resolve(mesh);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading STL model: ${error.message}`));
          }
        );
        break;

      case '3ds':
        const tdsLoader = new TDSLoader();
        tdsLoader.load(
          url,
          (object) => {
            resolve(object);
          },
          undefined,
          (error) => {
            reject(new Error(`Error loading 3DS model: ${error.message}`));
          }
        );
        break;

      default:
        reject(new Error(`Unsupported format: ${format}`));
    }
  });
}