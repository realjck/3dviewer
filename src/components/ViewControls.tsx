import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Grid } from 'lucide-react';

interface ViewControlsProps {
  wireframe: boolean;
  onWireframeChange: (value: boolean) => void;
}

const dispatch = (eventName: string) => () => window.dispatchEvent(new CustomEvent(eventName));

const buttonClass = 'p-2 hover:bg-gray-100 rounded-md transition-colors';

export const ViewControls: React.FC<ViewControlsProps> = ({ wireframe, onWireframeChange }) => (
  <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md">
    <div className="flex flex-col space-y-2">
      <button onClick={dispatch('viewer-zoom-in')} className={buttonClass} title="Zoom In">
        <ZoomIn size={20} />
      </button>
      <button onClick={dispatch('viewer-zoom-out')} className={buttonClass} title="Zoom Out">
        <ZoomOut size={20} />
      </button>
      <div className="border-t border-gray-200 my-1"></div>
      <button
        onClick={() => onWireframeChange(!wireframe)}
        className={`${buttonClass} ${wireframe ? 'bg-indigo-100 text-indigo-600' : ''}`}
        title="Toggle Wireframe"
        aria-pressed={wireframe}
      >
        <Grid size={20} />
      </button>
      <button onClick={dispatch('viewer-reset')} className={buttonClass} title="Reset View">
        <RotateCcw size={20} />
      </button>
    </div>
  </div>
);
