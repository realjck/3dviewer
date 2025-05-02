import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Grid, Square } from 'lucide-react';

interface ViewControlsProps {
  wireframe: boolean;
  onWireframeChange: (value: boolean) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = () => {
  const handleZoomIn = () => {
    const event = new CustomEvent('viewer-zoom-in');
    window.dispatchEvent(event);
  };
  
  const handleZoomOut = () => {
    const event = new CustomEvent('viewer-zoom-out');
    window.dispatchEvent(event);
  };
  
  const handleReset = () => {
    const event = new CustomEvent('viewer-reset');
    window.dispatchEvent(event);
  };
  
  return (
    <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
      <div className="bg-white p-2 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Reset View"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};