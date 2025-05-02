export interface ModelInfo {
  vertices: number;
  faces: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  originalDimensions: any;
  materials: string[];
}