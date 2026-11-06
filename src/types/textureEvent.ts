/** Window event dispatched when the user picks a texture for a material. */
export const TEXTURE_LOAD_EVENT = 'texture-load';

export interface TextureLoadDetail {
  file: File;
  materialName: string;
}
