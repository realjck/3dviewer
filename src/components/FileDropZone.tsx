import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onModelLoad: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onModelLoad }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const supportedFormats = ['gltf', 'glb', 'obj', 'fbx', 'dae', 'stl', '3ds'];
      
      if (fileExtension && supportedFormats.includes(fileExtension)) {
        onModelLoad(file);
      } else {
        alert(`Unsupported file format. Please upload one of the following: ${supportedFormats.join(', ')}`);
      }
    }
  }, [onModelLoad]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onModelLoad(file);
    }
  };
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept=".gltf,.glb,.obj,.fbx,.dae,.stl,.3ds"
        onChange={handleFileChange}
      />
      
      <Upload className="h-12 w-12 mx-auto text-gray-400" />
      
      <p className="mt-2 text-base font-medium">
        Drag and drop or click to upload
      </p>
      
      <p className="mt-1 text-sm text-gray-500">
        Supported formats: GLTF/GLB, OBJ, FBX, DAE, STL, 3DS
      </p>
    </div>
  );
};