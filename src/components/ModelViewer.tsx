import React, { useState, useCallback } from 'react';
import { SidePanel } from './SidePanel';
import { ThreeScene } from './ThreeScene';
import { ViewControls } from './ViewControls';
import { ModelInfo } from '../types/ModelInfo';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const ModelViewer: React.FC = () => {
  const [model, setModel] = useState<File | null>(null);
  const [modelURL, setModelURL] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(400);
  const isMobile = useMediaQuery('(max-width: 767px)');

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

  const handleModelInfo = useCallback((info: ModelInfo) => {
    setModelInfo(info);
    setLoading(false);
  }, []);

  const handleLoadError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();

    const startX = e.pageX;
    const startWidth = sidePanelWidth;

    const doDrag = (e: MouseEvent) => {
      // Below this width the logo and title header no longer fit
      setSidePanelWidth(Math.max(280, startWidth + e.pageX - startX));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // Mobile: viewer pinned on top, panel scrolling below. Desktop: resizable side panel.
  return (
    <div className={`flex w-full ${isMobile ? 'flex-col' : ''}`}>
      <div
        style={isMobile ? undefined : { width: sidePanelWidth }}
        className={isMobile ? 'order-last' : 'h-screen overflow-y-auto border-r border-gray-200 shrink-0'}
      >
        <SidePanel
          onModelLoad={handleModelLoad}
          modelInfo={modelInfo}
          model={model}
          error={error}
        />
      </div>

      {!isMobile && (
        <div
          className="w-1 bg-gray-200 hover:bg-indigo-500 cursor-col-resize transition-colors"
          onMouseDown={startResizing}
        />
      )}

      <div
        className={`relative overflow-hidden ${
          isMobile ? 'sticky top-0 z-20 h-[55svh] shrink-0' : 'flex-1 h-screen'
        }`}
      >
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
    </div>
  );
};
