import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react'; // Retirer l'import de X

interface FileDropZoneProps {
  onModelLoad: (file: File | null) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onModelLoad }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
        setUploadedFile(file);
        onModelLoad(file);
      } else {
        alert(`Unsupported file format. Please upload one of the following: ${supportedFormats.join(', ')}`);
        setUploadedFile(null);
        onModelLoad(null);
      }
    }
  }, [onModelLoad]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       const fileExtension = file.name.split('.').pop()?.toLowerCase();
       const supportedFormats = ['gltf', 'glb', 'obj', 'fbx', 'dae', 'stl', '3ds'];

       if (fileExtension && supportedFormats.includes(fileExtension)) {
         setUploadedFile(file);
         onModelLoad(file);
       } else {
         alert(`Unsupported file format. Please upload one of the following: ${supportedFormats.join(', ')}`);
         setUploadedFile(null);
         onModelLoad(null);
         e.target.value = '';
       }
    } else {
        setUploadedFile(null); // Réinitialiser si aucun fichier n'est sélectionné
        onModelLoad(null);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${ // Toujours cursor-pointer
        uploadedFile ? 'border-4 bg-green-50 border-green-500' : // Style vert si fichier chargé
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()} // Toujours permettre le clic
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept=".gltf,.glb,.obj,.fbx,.dae,.stl,.3ds"
        onChange={handleFileChange}
        // Retirer l'attribut disabled
      />

      {uploadedFile ? (
        <div className="flex flex-col items-center justify-center">
           <div className="text-green-600 mb-1">✓</div> {/* Indicateur de succès */}
           <p className="text-sm text-green-700 break-all">
             {uploadedFile.name}
           </p>
           <p className="text-xs text-gray-500 mt-1">
             Cliquez ou déposez pour changer
           </p>
        </div>
      ) : (
        // Afficher l'icône et le texte par défaut
        <>
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="mt-2 text-base font-medium">
            Glissez-déposez ou cliquez pour charger
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Formats supportés: GLTF/GLB, OBJ, FBX, DAE, STL, 3DS
          </p>
        </>
      )}
    </div>
  );
};