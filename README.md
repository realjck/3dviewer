<p align="center">
  <img src="public/assets/images/3dviewer_logo_256px.png" alt="3D Viewer logo" width="128" />
</p>

# 3D Viewer

A browser-based 3D model viewer built with React, TypeScript, Three.js and Tailwind CSS. Files are loaded locally in the browser and are never uploaded to a server.

## Features

- Drag and drop (or click to pick) a model file
- Supported formats: glTF/GLB, OBJ, FBX, Collada (DAE), STL, 3DS
- Per-material texture assignment (PNG, JPG, TGA)
- Model information: file size, vertex and face counts, original dimensions, materials
- Orbit, zoom, wireframe and reset-view controls; models are auto-scaled and placed on a grid
- Resizable side panel; camera position persisted in `localStorage`

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check and build to `dist/`      |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run ESLint on `src/`                 |

## Project structure

```
src/
  components/   UI and Three.js scene (ModelViewer, ThreeScene, SidePanel, ...)
  hooks/        useLocalStorage, useMediaQuery
  utils/        Model loading, model info extraction, lights, grid
  types/        Shared TypeScript types
```

## Limitations

- Models must be self-contained: external resources referenced by a model (`.bin` files for glTF, `.mtl` files for OBJ, external textures) are not resolved. Prefer GLB for glTF assets.
- Textures only show up on models that have UV coordinates (STL files, for instance, have none).
