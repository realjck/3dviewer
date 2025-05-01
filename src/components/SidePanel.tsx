import React, { useState, useEffect, useCallback } from 'react';
import { Upload, File } from 'lucide-react';
import { ModelInfo } from '../types/ModelInfo';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FileDropZone } from './FileDropZone';

interface SidePanelProps {
  onModelLoad: (file: File) => void;
  onTextureLoad: (texture: File, materialName: string) => void;
  modelInfo: ModelInfo | null;
  model: File | null;
  error: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  onModelLoad, 
  onTextureLoad, // Gardez le nom de la prop originale pour la clarté externe
  modelInfo, 
  model, 
  error 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loadedTextures, setLoadedTextures] = useState<{[key: string]: string}>({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    // Réinitialiser les textures quand le modèle change
    setLoadedTextures({});
  }, [model]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onModelLoad(file);
    }
  };

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
    // Créer un objet URL pour le fichier
    const textureURL = URL.createObjectURL(file);
    
    // Créer et dispatcher un événement personnalisé avec le nom du fichier
    const event = new CustomEvent('texture-load', {
      detail: { 
        textureURL, 
        materialName,
        fileName: file.name
      }
    });
    window.dispatchEvent(event);
    
    // Mettre à jour l'état local pour l'UI
    setLoadedTextures(prev => ({
      ...prev,
      [materialName]: file.name
    }));
  };

  return (
    <div className={`flex flex-col ${isMobile ? 'p-4' : 'h-full p-6'}`}>
      <h2 className="text-xl font-bold mb-4">3D Model Viewer</h2>
      
      <FileDropZone onModelLoad={onModelLoad} />
      
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
            {modelInfo.materials.map((material, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="font-medium mb-2">{material}</p>
                <TextureDropZone
                  // Passez la nouvelle fonction combinée ici
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
                
                {modelInfo.dimensions && (
                  <div>
                    <span className="font-medium">Dimensions:</span><br />
                    <span className="pl-2">W: {modelInfo.originalDimensions.width.toFixed(2)}</span><br />
                    <span className="pl-2">H: {modelInfo.originalDimensions.height.toFixed(2)}</span><br />
                    <span className="pl-2">D: {modelInfo.originalDimensions.depth.toFixed(2)}</span>
                  </div>
                )}
                
                {modelInfo.materials && modelInfo.materials.length > 0 && (
                  <div>
                    <span className="font-medium">Materials:</span> {modelInfo.materials.length}
                    <ul className="pl-2 mt-1">
                      {modelInfo.materials.map((material, index) => (
                        <li key={index} className="text-sm">• {material}</li>
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
          <p>Upload a 3D model to view details</p>
        </div>
      )}
    </div>
  );
};

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onTextureLoad(file, materialName);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
        loadedTexture ? 'bg-green-50 border-green-500' : ''
      } ${dragActive ? 'bg-blue-50 border-blue-500' : ''}`}
      onClick={() => document.getElementById(`texture-${materialName}`)?.click()}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        id={`texture-${materialName}`}
        type="file"
        className="hidden"
        accept=".png,.jpg,.jpeg,.tga"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onTextureLoad(file, materialName); 
          }
        }}
      />
      {loadedTexture ? (
        <>
          <div className="text-green-600 mb-2">✓</div>
          <p className="text-sm text-green-700">
            Texture chargée : {loadedTexture}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Cliquez ou déposez pour changer
          </p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Déposer une texture pour {materialName}
          </p>
        </>
      )}
    </div>
  );
};