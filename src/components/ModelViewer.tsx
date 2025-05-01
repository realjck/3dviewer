import React, { useState, useRef } from 'react';
import { SidePanel } from './SidePanel';
import { ThreeScene } from './ThreeScene';
import { ViewControls } from './ViewControls';
import { ModelInfo } from '../types/ModelInfo';

export const ModelViewer: React.FC = () => {
  const [model, setModel] = useState<File | null>(null);
  const [modelURL, setModelURL] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const [sidePanelWidth, setSidePanelWidth] = useState(300);

  const handleModelLoad = (file: File) => {
    setModel(file);
    setError(null);
    setLoading(true);
    
    if (modelURL) {
      URL.revokeObjectURL(modelURL);
    }
    
    const url = URL.createObjectURL(file);
    setModelURL(url);
  };

  const handleModelInfo = (info: ModelInfo) => {
    setModelInfo(info);
    setLoading(false);
  };

  const handleLoadError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.pageX;
    const startWidth = sidePanelWidth;
    
    const doDrag = (e: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + e.pageX - startX);
      setSidePanelWidth(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <>
      <div style={{ width: sidePanelWidth }} className="h-screen overflow-y-auto border-r border-gray-200">
        <SidePanel 
          onModelLoad={handleModelLoad} 
          modelInfo={modelInfo}
          model={model}
          error={error}
        />
      </div>
      
      <div 
        ref={resizerRef}
        className="w-1 bg-gray-200 hover:bg-indigo-500 cursor-col-resize transition-colors"
        onMouseDown={startResizing}
      />
      
      <div ref={containerRef} className="flex-1 relative h-screen overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2">Loading model...</p>
            </div>
          </div>
        )}
        
        <ThreeScene 
          modelURL={modelURL} 
          modelFormat={model?.name.split('.').pop()?.toLowerCase() || ''}
          onLoadComplete={handleModelInfo}
          onLoadError={handleLoadError}
          wireframe={wireframe}
        />
        
        <ViewControls 
          wireframe={wireframe}
          onWireframeChange={setWireframe}
        />
      </div>
    </>
  );
};