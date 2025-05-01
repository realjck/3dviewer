import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { setupLights } from '../utils/lights';
import { setupGrid } from '../utils/grid';
import { loadModel } from '../utils/modelLoader';
import { extractModelInfo } from '../utils/modelInfo';
import { ModelInfo } from '../types/ModelInfo';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const axesRef = useRef<THREE.AxesHelper | null>(null);

  const [showAxes, setShowAxes] = useLocalStorage('showAxes', true);
  const [cameraPosition, setCameraPosition] = useLocalStorage('cameraPosition', { x: 5, y: 5, z: 5 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2A2A2A);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.addEventListener('change', () => {
      if (cameraRef.current) {
        setCameraPosition({
          x: cameraRef.current.position.x,
          y: cameraRef.current.position.y,
          z: cameraRef.current.position.z
        });
      }
    });
    controlsRef.current = controls;

    setupLights(scene);
    setupGrid(scene);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    axesRef.current = axesHelper;
    axesHelper.visible = showAxes;

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    const handleResize = () => {
      if (
        containerRef.current &&
        rendererRef.current &&
        cameraRef.current
      ) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (axesRef.current) {
      axesRef.current.visible = showAxes;
    }
  }, [showAxes]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.wireframe = wireframe;
        }
      });
    }
  }, [wireframe]);

  useEffect(() => {
    if (!modelURL || !sceneRef.current) return;

    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }

    loadModel(modelURL, modelFormat)
      .then((object) => {
        if (!sceneRef.current) return;
        
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        
        object.position.x -= center.x;
        object.position.y -= center.y;
        object.position.z -= center.z;
        
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.wireframe = wireframe;
          }
        });
        
        sceneRef.current.add(object);
        modelRef.current = object;
        
        const modelInfo = extractModelInfo(object);
        onLoadComplete(modelInfo);
        
        if (cameraRef.current && controlsRef.current) {
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          const distance = maxDim / Math.tan(fov / 2);
          
          cameraRef.current.position.set(distance, distance, distance);
          cameraRef.current.lookAt(center);
          
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
          
          setCameraPosition({
            x: cameraRef.current.position.x,
            y: cameraRef.current.position.y,
            z: cameraRef.current.position.z
          });
        }
      })
      .catch((error) => {
        console.error('Error loading model:', error);
        onLoadError(`Failed to load model: ${error.message}`);
      });
  }, [modelURL, modelFormat, wireframe]);

  return <div ref={containerRef} className="w-full h-full" />;
};