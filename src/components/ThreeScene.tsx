import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
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

  const initScene = () => {
    if (!containerRef.current) return;

    // Initialisation de la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2A2A2A);
    sceneRef.current = scene;

    // Configuration de la caméra
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    cameraRef.current = camera;

    // Configuration du renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Configuration des contrôles
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

    // Ajout des éléments de base
    setupLights(scene);
    setupGrid(scene);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    axesRef.current = axesHelper;
    axesHelper.visible = showAxes;
  };

  const handleZoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      const target = controlsRef.current.target;
      const position = cameraRef.current.position;
      const direction = position.clone().sub(target).normalize();
      const distance = position.distanceTo(target);
      const newDistance = Math.max(0.1, distance * 0.8);
      cameraRef.current.position.copy(target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      const target = controlsRef.current.target;
      const position = cameraRef.current.position;
      const direction = position.clone().sub(target).normalize();
      const distance = position.distanceTo(target);
      const newDistance = distance * 1.2;
      cameraRef.current.position.copy(target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current && modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Calculer la distance optimale pour voir l'objet entier
      const fov = cameraRef.current.fov * (Math.PI / 180);
      const maxDim = Math.max(size.x, size.y, size.z);
      const aspectRatio = cameraRef.current.aspect;
      
      // Ajuster la distance en fonction du ratio d'aspect
      let distance = (maxDim / 2) / Math.tan(fov / 2);
      if (aspectRatio < 1) {
        // Pour les écrans en mode portrait
        distance = Math.max(distance, (maxDim / 2) / (Math.tan(fov / 2) * aspectRatio));
      }
      
      // Positionner la caméra avec un léger décalage pour une meilleure vue isométrique
      const offset = 1.2; // Facteur pour avoir une marge autour de l'objet
      cameraRef.current.position.set(
        distance * offset * 0.7,  // Réduire légèrement la composante X
        distance * offset * 0.7,  // Réduire légèrement la composante Y
        distance * offset         // Garder la composante Z complète
      );
      
      cameraRef.current.lookAt(center);
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    initScene();

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

    // Gestionnaires d'événements pour les contrôles de vue
    window.addEventListener('viewer-zoom-in', handleZoomIn);
    window.addEventListener('viewer-zoom-out', handleZoomOut);
    window.addEventListener('viewer-reset', handleReset);

    const handleResize = () => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
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
      window.removeEventListener('viewer-zoom-in', handleZoomIn);
      window.removeEventListener('viewer-zoom-out', handleZoomOut);
      window.removeEventListener('viewer-reset', handleReset);
      
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
        const size = box.getSize(new THREE.Vector3());
        
        // Sauvegarder les dimensions originales avant la mise à l'échelle
        const originalDimensions = {
          width: size.x,
          height: size.y,
          depth: size.z
        };
        
        // Calculer le facteur d'échelle pour ajuster l'objet dans une boîte 1x1x1
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxDimension;
        object.scale.multiplyScalar(scale);
        
        // Recentrer l'objet après la mise à l'échelle et placer le point le plus bas au niveau du sol
        const scaledBox = new THREE.Box3().setFromObject(object);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        
        object.position.x = -scaledCenter.x;
        object.position.y = -scaledCenter.y + (scaledSize.y / 2); // Ajustement pour placer l'objet sur le sol
        object.position.z = -scaledCenter.z;
        
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.wireframe = wireframe;
          }
        });
        
        sceneRef.current.add(object);
        modelRef.current = object;
        
        const modelInfo = extractModelInfo(object);
        // Ajouter les dimensions originales aux informations du modèle
        modelInfo.originalDimensions = originalDimensions;
        onLoadComplete(modelInfo);
        
        handleReset();
      })
      .catch((error) => {
        console.error('Error loading model:', error);
        onLoadError(`Failed to load model: ${error.message}`);
      });
  }, [modelURL, modelFormat, wireframe]);

  useEffect(() => {
    const handleTextureLoad = (event: CustomEvent) => {
      const { textureURL, materialName, fileName } = event.detail;
      console.log('Texture load event received:', textureURL, materialName, fileName);
      
      if (modelRef.current) {
        // Vérifier si c'est un fichier TGA en utilisant le nom de fichier original
        const isTGA = fileName ? fileName.toLowerCase().endsWith('.tga') : textureURL.toLowerCase().endsWith('.tga');
        
        if (isTGA) {
          // Utiliser TGALoader pour les fichiers Targa
          const tgaLoader = new TGALoader();
          tgaLoader.load(textureURL, 
            (texture) => {
              applyTextureToMaterial(texture, materialName);
            },
            undefined,
            (error) => {
              console.error('Error loading TGA texture:', error);
            }
          );
        } else {
          // Utiliser le TextureLoader standard pour les autres formats
          console.log('Using standard TextureLoader for', textureURL);
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(textureURL, (texture) => {
            console.log('Standard texture loaded successfully');
            applyTextureToMaterial(texture, materialName);
          });
        }
      }
    };
    
    // Fonction utilitaire pour appliquer la texture au matériau
    const applyTextureToMaterial = (texture: THREE.Texture, materialName: string) => {
      modelRef.current?.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.name === materialName) {
                mat.map = texture;
                // Définir la couleur sur blanc pour ne pas influencer la texture
                mat.color.set(0xFFFFFF);
                mat.needsUpdate = true;
              }
            });
          } else if (child.material.name === materialName) {
            child.material.map = texture;
            // Définir la couleur sur blanc pour ne pas influencer la texture
            child.material.color.set(0xFFFFFF);
            child.material.needsUpdate = true;
          }
        }
      });
    };

    window.addEventListener('texture-load', handleTextureLoad as EventListener);

    return () => {
      window.removeEventListener('texture-load', handleTextureLoad as EventListener);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
