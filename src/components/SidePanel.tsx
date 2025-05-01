import React, { useState, useCallback } from 'react';
import { Upload, File } from 'lucide-react';
import { ModelInfo } from '../types/ModelInfo';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FileDropZone } from './FileDropZone';

interface SidePanelProps {
  onModelLoad: (file: File) => void;
  modelInfo: ModelInfo | null;
  model: File | null;
  error: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  onModelLoad, 
  modelInfo, 
  model, 
  error 
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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
      
      {model && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-3">
            Model Information
          </h3>
          
          <div className="space-y-2">
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