import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { loadModel } from './modelLoader';

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

/** Minimal glTF with a single triangle, its buffer at the URI built from the base64 data. */
function triangleGltf(bufferUri: (base64: string) => string): string {
  const bytes = new Uint8Array(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]).buffer);
  return JSON.stringify({
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ byteLength: bytes.length, uri: bufferUri(toBase64(bytes)) }],
    bufferViews: [{ buffer: 0, byteLength: bytes.length }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
  });
}

const dataUrl = (json: string) => `data:model/gltf+json;base64,${btoa(json)}`;

describe('loadModel', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects unsupported formats', async () => {
    await expect(loadModel('data:,', 'xyz')).rejects.toThrow('Could not load this XYZ file: Unsupported format: xyz');
  });

  it('explains .gltf files that reference external resources', async () => {
    const url = dataUrl(triangleGltf(() => 'triangle.bin'));

    await expect(loadModel(url, 'gltf')).rejects.toThrow(
      'Could not load this GLTF file: it references external files (triangle.bin)'
    );
  });

  it('loads .gltf files with embedded resources', async () => {
    // three's FileLoader reports progress with this browser-only event class
    vi.stubGlobal('ProgressEvent', class extends Event {});
    const url = dataUrl(triangleGltf((base64) => `data:application/octet-stream;base64,${base64}`));

    const object = await loadModel(url, 'GLTF');

    let vertices = 0;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) vertices += child.geometry.attributes.position.count;
    });
    expect(vertices).toBe(3);
  });
});
