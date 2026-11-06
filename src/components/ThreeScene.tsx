import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupLights } from '../utils/lights';
import { setupGrid } from '../utils/grid';
import { loadModel } from '../utils/modelLoader';
import { loadTexture } from '../utils/textureLoader';
import { extractModelInfo } from '../utils/modelInfo';
import { frameObject, loadCameraPosition, saveCameraPosition, zoomCamera } from '../utils/camera';
import { applyTexture, disposeObject, nameUnnamedMaterials, setWireframe } from '../utils/object3d';
import { ModelInfo } from '../types/ModelInfo';
import { TEXTURE_LOAD_EVENT, TextureLoadDetail } from '../types/textureEvent';

interface ThreeSceneProps {
  modelURL: string | null;
  modelFormat: string;
  onLoadComplete: (info: ModelInfo) => void;
  onLoadError: (error: string) => void;
  wireframe: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  modelURL,
  modelFormat,
  onLoadComplete,
  onLoadError,
  wireframe,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const wireframeRef = useRef(wireframe);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.copy(loadCameraPosition());

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Persist on 'end' rather than 'change', which fires every frame while damping
    controls.addEventListener('end', () => saveCameraPosition(camera.position));

    setupLights(scene);
    setupGrid(scene);
    scene.add(new THREE.AxesHelper(5));

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleZoomIn = () => zoomCamera(camera, controls, 0.8);
    const handleZoomOut = () => zoomCamera(camera, controls, 1.2);
    const handleReset = () => {
      if (modelRef.current) frameObject(camera, controls, modelRef.current);
    };
    const handleResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('viewer-zoom-in', handleZoomIn);
    window.addEventListener('viewer-zoom-out', handleZoomOut);
    window.addEventListener('viewer-reset', handleReset);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('viewer-zoom-in', handleZoomIn);
      window.removeEventListener('viewer-zoom-out', handleZoomOut);
      window.removeEventListener('viewer-reset', handleReset);
      window.removeEventListener('resize', handleResize);

      cancelAnimationFrame(frameId);
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      container.removeChild(renderer.domElement);

      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    wireframeRef.current = wireframe;
    if (modelRef.current) {
      setWireframe(modelRef.current, wireframe);
    }
  }, [wireframe]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!modelURL || !scene) return;

    if (modelRef.current) {
      scene.remove(modelRef.current);
      disposeObject(modelRef.current);
      modelRef.current = null;
    }

    // Ignore the result if a newer model was requested meanwhile
    let cancelled = false;

    loadModel(modelURL, modelFormat)
      .then((object) => {
        if (cancelled || !cameraRef.current || !controlsRef.current) {
          disposeObject(object);
          return;
        }

        nameUnnamedMaterials(object);
        // Extract info before scaling so dimensions are the model's original ones
        const modelInfo = extractModelInfo(object);
        const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());

        // Fit the model into a 10-unit box, matching the grid size
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        object.scale.multiplyScalar(10 / maxDimension);

        // Center the model horizontally and rest its lowest point on the ground
        const scaledBox = new THREE.Box3().setFromObject(object);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        object.position.sub(scaledCenter);
        object.position.y += scaledSize.y / 2;

        setWireframe(object, wireframeRef.current);
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) child.castShadow = true;
        });

        scene.add(object);
        modelRef.current = object;

        onLoadComplete(modelInfo);
        frameObject(cameraRef.current, controlsRef.current, object);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        console.error('Error loading model:', error);
        onLoadError(`Failed to load model: ${error.message}`);
      });

    return () => {
      cancelled = true;
    };
  }, [modelURL, modelFormat, onLoadComplete, onLoadError]);

  useEffect(() => {
    const handleTextureLoad = (event: Event) => {
      const { file, materialName } = (event as CustomEvent<TextureLoadDetail>).detail;
      const model = modelRef.current;
      if (!model) return;

      const url = URL.createObjectURL(file);
      loadTexture(url, file.name)
        .then((texture) => {
          if (modelRef.current !== model) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          // glTF UVs use a top-left origin, unlike the other formats
          texture.flipY = !['gltf', 'glb'].includes(modelFormat);
          applyTexture(model, materialName, texture);
        })
        .catch((error) => console.error('Error loading texture:', error))
        .finally(() => URL.revokeObjectURL(url));
    };

    window.addEventListener(TEXTURE_LOAD_EVENT, handleTextureLoad);
    return () => window.removeEventListener(TEXTURE_LOAD_EVENT, handleTextureLoad);
  }, [modelFormat]);

  return <div ref={containerRef} className="w-full h-full" />;
};
