import React, { useState, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';

const SUPPORTED_FORMATS = ['gltf', 'glb', 'obj', 'fbx', 'dae', 'stl', '3ds'];

interface FileDropZoneProps {
  onModelLoad: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onModelLoad }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!SUPPORTED_FORMATS.includes(extension)) {
      alert(`Unsupported file format. Please upload one of the following: ${SUPPORTED_FORMATS.join(', ')}`);
      return;
    }
    setUploadedFile(file);
    onModelLoad(file);
  }, [onModelLoad]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so selecting the same file again still triggers a change
    e.target.value = '';
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${
        uploadedFile ? 'border-4 bg-green-50 border-green-500' :
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={SUPPORTED_FORMATS.map((format) => `.${format}`).join(',')}
        onChange={handleFileChange}
      />

      {uploadedFile ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-green-600 mb-1">✓</div>
          <p className="text-sm text-green-700 break-all">{uploadedFile.name}</p>
          <p className="text-xs text-gray-500 mt-1">Click or drop to replace</p>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="mt-2 text-base font-medium">Drag and drop or click to load a model</p>
          <p className="mt-1 text-sm text-gray-500">Supported formats: GLTF/GLB, OBJ, FBX, DAE, STL, 3DS</p>
        </>
      )}
    </div>
  );
};
