export interface ModelInfo {
  vertices: number;
  faces: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  originalDimensions: {
    width: number;
    height: number;
    depth: number;
  };
}
materials: string[];