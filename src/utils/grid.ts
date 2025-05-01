import * as THREE from 'three';

export function setupGrid(scene: THREE.Scene): void {
  // Create a grid helper with blue color (#2ba6ff)
  const gridHelper = new THREE.GridHelper(10, 10, 0x2ba6ff, 0x2ba6ff);
  gridHelper.position.y = -0.01; // Slightly below origin to avoid z-fighting
  scene.add(gridHelper);
  
  // Create a plane for shadow casting
  const planeGeometry = new THREE.PlaneGeometry(20, 20);
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);
}