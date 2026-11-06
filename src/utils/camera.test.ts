import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { frameObject, loadCameraPosition, saveCameraPosition, zoomCamera } from './camera';

// frameObject and zoomCamera only use the target and update(), so no DOM is needed
function fakeControls(): OrbitControls {
  return { target: new THREE.Vector3(), update: vi.fn() } as unknown as OrbitControls;
}

function boxMesh(width: number, height: number, depth: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth));
  mesh.position.y = height / 2;
  mesh.updateMatrixWorld();
  return mesh;
}

/** Projects the 8 bounding box corners to normalized device coordinates. */
function projectedCorners(object: THREE.Object3D, camera: THREE.PerspectiveCamera): THREE.Vector3[] {
  camera.updateMatrixWorld();
  const { min, max } = new THREE.Box3().setFromObject(object);
  return [min.x, max.x].flatMap((x) =>
    [min.y, max.y].flatMap((y) => [min.z, max.z].map((z) => new THREE.Vector3(x, y, z).project(camera)))
  );
}

describe('frameObject', () => {
  const shapes: [string, THREE.Mesh][] = [
    ['cube', boxMesh(10, 10, 10)],
    ['wide', boxMesh(10, 2, 2)],
    ['tall', boxMesh(2, 10, 2)],
  ];
  const aspects = [0.5, 0.8, 1, 1.8, 3];

  for (const [name, mesh] of shapes) {
    for (const aspect of aspects) {
      it(`keeps the whole ${name} in view at aspect ${aspect}`, () => {
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        frameObject(camera, fakeControls(), mesh);

        const corners = projectedCorners(mesh, camera);
        for (const corner of corners) {
          expect(Math.abs(corner.x)).toBeLessThanOrEqual(1);
          expect(Math.abs(corner.y)).toBeLessThanOrEqual(1);
        }
        // Not framed absurdly far away either
        const extent = Math.max(...corners.map((c) => Math.max(Math.abs(c.x), Math.abs(c.y))));
        expect(extent).toBeGreaterThan(0.4);
      });
    }
  }

  it('targets the object center', () => {
    const mesh = boxMesh(10, 10, 10);
    const controls = fakeControls();
    frameObject(new THREE.PerspectiveCamera(45, 1, 0.1, 1000), controls, mesh);
    expect(controls.target.toArray()).toEqual([0, 5, 0]);
  });
});

describe('zoomCamera', () => {
  it('scales the distance to the target along the view axis', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 10);
    zoomCamera(camera, fakeControls(), 0.8);
    expect(camera.position.z).toBeCloseTo(8);
    expect(camera.position.x).toBe(0);
  });

  it('never gets closer than 0.1 to the target', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0.1);
    zoomCamera(camera, fakeControls(), 0.5);
    expect(camera.position.length()).toBeCloseTo(0.1);
  });
});

describe('camera position storage', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips a saved position', () => {
    saveCameraPosition(new THREE.Vector3(1, 2, 3));
    expect(loadCameraPosition().toArray()).toEqual([1, 2, 3]);
  });

  it.each([
    ['nothing saved', undefined],
    ['malformed JSON', '{oops'],
    ['non-numeric values', '{"x":"a","y":2,"z":3}'],
  ])('falls back to the default with %s', (_, value) => {
    if (value !== undefined) store.set('cameraPosition', value);
    expect(loadCameraPosition().toArray()).toEqual([5, 5, 5]);
  });
});
