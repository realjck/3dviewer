import * as THREE from 'three';

export function setupLights(scene: THREE.Scene): void {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Directional light for shadows and highlights
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(5, 10, 7.5);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 1024;
  directionalLight1.shadow.mapSize.height = 1024;
  scene.add(directionalLight1);
  
  // Additional directional light from opposite side
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-5, 5, -7.5);
  scene.add(directionalLight2);
  
  // Add a hemisphere light for more natural lighting
  const hemisphereLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0.5);
  scene.add(hemisphereLight);
}