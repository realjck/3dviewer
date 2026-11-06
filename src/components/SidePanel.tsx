import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { ModelInfo } from '../types/ModelInfo';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FileDropZone } from './FileDropZone';
import { TEXTURE_LOAD_EVENT, TextureLoadDetail } from '../types/textureEvent';

interface SidePanelProps {
  onModelLoad: (file: File) => void;
  onError: (message: string) => void;
  modelInfo: ModelInfo | null;
  model: File | null;
  error: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  onModelLoad,
  onError,
  modelInfo,
  model,
  error
}) => {
  const [loadedTextures, setLoadedTextures] = useState<{[key: string]: string}>({});
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    setLoadedTextures({});
  }, [model]);

  const getFormatLabel = (format: string): string => {
    const formatMap: { [key: string]: string } = {
      'gltf': 'glTF',
      'glb': 'GLB',
      'obj': 'OBJ',
      'fbx': 'FBX',
      'dae': 'Collada (DAE)',
      'stl': 'STL',
      '3ds': '3DS'
    };
    
    return formatMap[format.toLowerCase()] || format.toUpperCase();
  };

  const handleTextureSelectedForMaterial = (file: File, materialName: string) => {
    window.dispatchEvent(
      new CustomEvent<TextureLoadDetail>(TEXTURE_LOAD_EVENT, { detail: { file, materialName } })
    );
    setLoadedTextures(prev => ({
      ...prev,
      [materialName]: file.name
    }));
  };

  return (
    <div className={`flex flex-col ${isMobile ? 'p-4' : 'h-full p-6'}`}>
      <div className="flex items-center mb-4">
        <img src="/assets/images/3dviewer_logo_256px.png" alt="3D Viewer Logo" className="mr-2 w-24" />
        <h1 className="text-4xl font-bold">3D VIEWER</h1>
      </div>
      
      <FileDropZone onModelLoad={onModelLoad} onError={onError} />
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {modelInfo && modelInfo.materials && modelInfo.materials.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3">
            Textures
          </h3>
          <div className="space-y-4">
            {modelInfo.materials.map((material) => (
              <div key={material} className="border rounded-lg p-4">
                <p className="font-medium mb-2">{material}</p>
                <TextureDropZone
                  onTextureLoad={handleTextureSelectedForMaterial}
                  materialName={material}
                  loadedTexture={loadedTextures[material]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {model && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3">
            Model Information
          </h3>
          
          <div className="space-y-2 text-sm pb-6">
            <div>
              <span className="font-medium">File:</span> {model.name}
            </div>
            
            <div>
              <span className="font-medium">Format:</span> {
                model.name.split('.').pop() ? 
                getFormatLabel(model.name.split('.').pop()!) : 
                'Unknown'
              }
            </div>
            
            <div>
              <span className="font-medium">Size:</span> {(model.size / 1024).toFixed(2)} KB
            </div>
            
            {modelInfo && (
              <>
                <div>
                  <span className="font-medium">Vertices:</span> {modelInfo.vertices.toLocaleString()}
                </div>
                
                <div>
                  <span className="font-medium">Faces:</span> {modelInfo.faces.toLocaleString()}
                </div>
                
                <div>
                  <span className="font-medium">Dimensions:</span><br />
                  <span className="pl-2">W: {modelInfo.dimensions.x.toFixed(2)}</span><br />
                  <span className="pl-2">H: {modelInfo.dimensions.y.toFixed(2)}</span><br />
                  <span className="pl-2">D: {modelInfo.dimensions.z.toFixed(2)}</span>
                </div>
                
                {modelInfo.materials && modelInfo.materials.length > 0 && (
                  <div>
                    <span className="font-medium">Materials:</span> {modelInfo.materials.length}
                    <ul className="pl-2 mt-1">
                      {modelInfo.materials.map((material) => (
                        <li key={material} className="text-sm">• {material}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {!model && !error && (
        <div className="mt-6 text-center text-gray-500 italic">
          <p>Load a 3D model to see its details</p>
        </div>
      )}
    </div>
  );
};

const TEXTURE_FORMATS = ['png', 'jpg', 'jpeg', 'tga'];

interface TextureDropZoneProps {
  onTextureLoad: (file: File, materialName: string) => void;
  materialName: string;
  loadedTexture?: string;
}

const TextureDropZone: React.FC<TextureDropZoneProps> = ({
  onTextureLoad,
  materialName,
  loadedTexture
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!TEXTURE_FORMATS.includes(extension)) {
      setError(`Unsupported texture format. Use one of: ${TEXTURE_FORMATS.join(', ')}.`);
      return;
    }
    setError(null);
    onTextureLoad(file, materialName);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
        loadedTexture ? 'bg-green-50 border-green-500' : ''
      } ${dragActive ? 'bg-blue-50 border-blue-500' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={TEXTURE_FORMATS.map((format) => `.${format}`).join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {loadedTexture ? (
        <>
          <div className="text-green-600 mb-2">✓</div>
          <p className="text-sm text-green-700 break-all">Texture loaded: {loadedTexture}</p>
          <p className="text-xs text-gray-500 mt-1">Click or drop to replace</p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drop a texture for {materialName}</p>
        </>
      )}
      {error && <p role="alert" className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
};
