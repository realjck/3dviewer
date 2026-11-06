import * as THREE from 'three';

/**
 * Adds a key/fill/sky light rig. Intensities are tuned so that summed light on a
 * white surface stays below 1, otherwise faces clip to pure white and lose shading.
 */
export function setupLights(scene: THREE.Scene): void {
  // Sky/ground ambient term: brighter on upward faces, darker on downward ones
  const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.4);
  scene.add(hemisphereLight);

  // Key light, casts shadows
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
  keyLight.position.set(5, 10, 7.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  // Cover the 10-unit area models are scaled to (default frustum is only 10x10 wide)
  const shadowCamera = keyLight.shadow.camera;
  shadowCamera.left = -10;
  shadowCamera.right = 10;
  shadowCamera.top = 10;
  shadowCamera.bottom = -10;
  scene.add(keyLight);

  // Fill light from the opposite side so back faces are not flat
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
  fillLight.position.set(-5, 5, -7.5);
  scene.add(fillLight);
}
