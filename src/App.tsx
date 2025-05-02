import React from 'react';
import { ModelViewer } from './components/ModelViewer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-mono">
      <main className="flex-grow flex">
        <ModelViewer />
      </main>
    </div>
  );
}

export default App;