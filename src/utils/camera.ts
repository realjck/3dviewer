import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const STORAGE_KEY = 'cameraPosition';
const DEFAULT_POSITION = new THREE.Vector3(5, 5, 5);

/** Reads the last saved camera position, falling back to a default. */
export function loadCameraPosition(): THREE.Vector3 {
  try {
    const { x, y, z } = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    if ([x, y, z].every(Number.isFinite)) {
      return new THREE.Vector3(x, y, z);
    }
  } catch {
    // Missing or malformed value
  }
  return DEFAULT_POSITION.clone();
}

export function saveCameraPosition(position: THREE.Vector3): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: position.x, y: position.y, z: position.z }));
  } catch {
    // Storage may be unavailable (private mode, quota)
  }
}

/** Moves the camera along its view axis; factor < 1 zooms in, > 1 zooms out. */
export function zoomCamera(camera: THREE.Camera, controls: OrbitControls, factor: number): void {
  const target = controls.target;
  const direction = camera.position.clone().sub(target).normalize();
  const distance = Math.max(0.1, camera.position.distanceTo(target) * factor);
  camera.position.copy(target).add(direction.multiplyScalar(distance));
  controls.update();
}

/** Places the camera so the whole object is visible from a three-quarter view. */
export function frameObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  object: THREE.Object3D
): void {
  // A bounding sphere fits whatever the view angle, unlike the box's largest side
  const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere());
  const center = sphere.center;

  // Fit within the narrower of the vertical and horizontal fields of view
  const halfVerticalFov = THREE.MathUtils.degToRad(camera.fov) / 2;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * camera.aspect);
  const margin = 1.1;
  const distance = (margin * sphere.radius) / Math.sin(Math.min(halfVerticalFov, halfHorizontalFov));

  const viewDirection = new THREE.Vector3(0.7, 0.7, 1).normalize();
  camera.position.copy(center).addScaledVector(viewDirection, distance);
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
}
