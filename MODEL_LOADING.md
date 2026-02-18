# mushu Model Loading System

A comprehensive 3D model loading and rendering system for mushu, supporting OBJ/MTL with textures and extensible to other formats like glTF, FBX, and BLEND.

## Features

### Core Features
- ✅ **OBJ Format**: Full OBJ file parsing with triangulation
- ✅ **MTL Materials**: Complete MTL parser with material properties
- ✅ **Textures**: Automatic texture loading and management
- ✅ **Scene Integration**: seamless integration with mushu scene system
- ✅ **GPU Support**: Works with flow(), scene(), and WebGL2 context
- ✅ **Format Extensibility**: Plugin architecture for additional formats

### Supported Formats
- **OBJ** (Wavefront) with MTL materials ✅
- **glTF 2.0** (JSON + GLB) - stub ready for full implementation
- **GLTF 2.0 Advanced** - complete implementation included
- **FBX/BLEND** - template loaders for custom implementation

---

## Installation & Usage

### Quick Start: Load OBJ with Materials

```javascript
import { mushuScene, camera, orbitControls } from 'mushu/core';

const scene = mushuScene('#canvas');

const cam = camera({ position: [0, 2, 5] });
scene.use(cam);

// Load OBJ model with MTL materials
await scene.loadModel('my-model', 'path/to/model.obj', {
    mtlUrl: 'path/to/model.mtl',
    texturePath: 'path/to/textures/',
    position: [0, 0, 0],
    scale: [1, 1, 1],
});

scene.go();
```

### Direct Loader Usage

```javascript
import { Loader } from 'mushu/core';

// Load with automatic format detection
const model = await Loader.model('path/to/file.obj', {
    texturePath: 'path/to/textures/',
});

// Explicit format
const gltfModel = await Loader.gltf('path/to/model.gltf');

// MTL-specific
const mtlMaterials = await Loader.mtl('path/to/model.mtl', 'path/to/textures/');
```

### Model Loader Instance (For Caching)

```javascript
import { ModelLoader } from 'mushu/core';

// Create a loader with shared settings
const modelLoader = new ModelLoader({
    texturePath: 'assets/models/textures/',
});

// Load multiple models with same settings
const model1 = await modelLoader.load('model1.obj');
const model2 = await modelLoader.load('model2.obj');

// Resources are cached automatically
modelLoader.clear(); // Clean up when done
```

---

## API Reference

### Scene Methods

#### `scene.loadModel(id, url, options)`

Load a 3D model file with automatic mesh instantiation.

**Parameters:**
- `id` (string): Unique identifier for the model group
- `url` (string): URL to model file (OBJ, glTF, etc.)
- `options` (object):
  - `texturePath` (string): Base path for texture references
  - `mtlUrl` (string, optional): MTL file URL for OBJ files
  - `material` (object, optional): Material to apply to all meshes
  - `position`, `rotation`, `scale` (arrays): Transform

**Returns:** Promise<SceneObject[]> - Array of loaded mesh objects

```javascript
const meshes = await scene.loadModel('statue', 'models/statue.obj', {
    texturePath: 'models/textures/',
    position: [0, 0, 0],
    scale: [2, 2, 2],
});

console.log(`Loaded ${meshes.length} meshes`);
meshes[0].setPosition(1, 0, 0);
```

#### `scene.loadModelWithLoader(id, url, loader, options)`

Load a model using a custom ModelLoader instance for caching.

```javascript
const loader = new ModelLoader({ texturePath: 'assets/textures/' });
const meshes = await scene.loadModelWithLoader('model', 'models/model.obj', loader);
```

### Loader Static Methods

#### `Loader.model(url, options)`

Load any supported model format with auto-detection.

```javascript
const model = await Loader.model('model.obj', {
    texturePath: 'textures/',
});
```

#### `Loader.obj(url, options)`

Load OBJ with explicit MTL support.

```javascript
const model = await Loader.obj('model.obj', {
    mtlUrl: 'model.mtl',
    texturePath: 'textures/',
});
```

#### `Loader.gltf(url, options)`

Load glTF 2.0 models (JSON or GLB).

```javascript
const model = await Loader.gltf('model.gltf');
const glbModel = await Loader.gltf('model.glb');
```

#### `Loader.mtl(url, texturePath)`

Load MTL materials separately.

```javascript
const materials = await Loader.mtl('model.mtl', 'textures/');
```

#### `Loader.createModelLoader(options)`

Create a ModelLoader instance.

```javascript
const loader = Loader.createModelLoader({
    texturePath: 'assets/textures/',
});
```

#### `Loader.registerFormat(format, loader)`

Register custom format loaders.

```javascript
import { GLTFLoader2 } from 'mushu/core/model-formats';
Loader.registerFormat('gltf2', new GLTFLoader2());
```

### ModelLoader Class

Manages model loading with automatic caching and resource management.

```javascript
import { ModelLoader } from 'mushu/core';

const loader = new ModelLoader({
    texturePath: 'assets/models/',
});

// Load and cache
const model = await loader.load('model.obj', {
    meshMaterials: true,
});

// Clear caches when done
loader.clear();
```

**Methods:**
- `load(url, options)` - Load with caching
- `clear()` - Clear all caches and textures

---

## Model Data Structure

### Model Object

```javascript
{
  meshes: [
    {
      name: string,
      material: { /* MTL data */ },
      geometry: {
        positions: Float32Array,
        normals: Float32Array,
        uvs: Float32Array,
        indices?: Uint32Array,
        colors?: Float32Array,
      }
    }
  ],
  materials: {
    [materialName]: {
      name: string,
      Ka: [r, g, b],        // Ambient
      Kd: [r, g, b],        // Diffuse
      Ks: [r, g, b],        // Specular
      Ns: number,           // Specular exponent
      d: number,            // Opacity
      map_Kd: string,       // Diffuse texture URL
      map_Bump: string,     // Normal map URL
      // ... other maps
    }
  },
  metadata: {
    format: string,
    meshCount: number,
    hasMaterials: boolean,
  }
}
```

---

## Extending with Custom Formats

### Creating a Custom Format Loader

```javascript
import { ModelFormatLoader, registerModelFormat } from 'mushu/core';

class MyFormatLoader extends ModelFormatLoader {
  load(content, options = {}) {
    // Parse your format
    const parser = new MyFormatParser(content);
    
    return {
      meshes: parser.getMeshes().map(mesh => ({
        name: mesh.name,
        material: mesh.material,
        geometry: {
          positions: mesh.positions,
          normals: mesh.normals,
          uvs: mesh.uvs,
          indices: mesh.indices,
        }
      })),
      materials: parser.getMaterials(),
      metadata: {
        format: 'myformat',
        meshCount: parser.getMeshCount(),
      }
    };
  }
  
  async loadAsync(url, options = {}) {
    const response = await fetch(url);
    const content = await response.text();
    return this.load(content, options);
  }
}

// Register the format
registerModelFormat('myfmt', new MyFormatLoader());

// Now you can load it
const model = await loadModel('model.myfmt');
```

### Built-in Format Templates

See `src/core/model-formats.js` for complete loaders:

#### GLTFLoader2 - Full glTF 2.0 Support

```javascript
import { GLTFLoader2 } from 'mushu/core/model-formats';

registerModelFormat('gltf2', new GLTFLoader2());

// Now supports:
// - JSON glTF files (.gltf)
// - Binary glTF files (.glb)
// - External buffers and images
// - PBR materials
// - Animations (metadata)
```

#### FBXLoader Template

```javascript
import { FBXLoader } from 'mushu/core/model-formats';

// Requires fbx-parser dependency
// npm install fbx-parser

registerModelFormat('fbx', new FBXLoader());
const model = await loadModel('model.fbx');
```

#### BlendLoader Template

Recommendations for Blender users:
1. Export as glTF 2.0 from Blender
2. Use GLTFLoader2
3. Or implement native .blend support with a parser library

---

## Integration with mushu Systems

### With Flow Runtime

```javascript
import { flow, shader } from 'mushu/core';

const myFlow = flow('#canvas')
  .use(shader(vertexShader, fragmentShader))
  .go();

// Load separate model data for custom rendering
const model = await Loader.model('model.obj');
```

### With GPU (WebGPU)

```javascript
import { gpu } from 'mushu/gpu';

const myGPU = gpu('#canvas');
// GPU support coming soon
```

### With Flow + Physics Simulation

```javascript
import { flow, simulation } from 'mushu/core';

const sim = flow('#canvas')
  .use(simulation())
  .go();

// Load model geometry into physics bodies
const model = await Loader.model('model.obj');
```

---

## Examples

### Complete Scene with Model

```javascript
import { 
  mushuScene, 
  camera, 
  orbitControls, 
  material, 
  shader3d 
} from 'mushu/core';

const scene = mushuScene('#canvas');

// Setup camera
const cam = camera({
  fov: 45,
  position: [0, 2, 5],
  target: [0, 0, 0],
});

// Setup controls
const controls = orbitControls(cam, {
  autoRotate: true,
  autoRotateSpeed: 0.5,
});

scene.use(cam).use(controls);

// Load model
const meshes = await scene.loadModel('chair', 'models/chair.obj', {
  texturePath: 'models/textures/',
  position: [0, 0, 0],
  scale: [1, 1, 1],
});

// Apply custom material (optional override)
const metalMaterial = material('pbr', {
  metallic: 0.8,
  roughness: 0.2,
});

// meshes.forEach(m => m.material = metalMaterial);

scene.go();
```

### Multiple Models

```javascript
const modelLoader = new ModelLoader({
  texturePath: 'assets/models/',
});

// Load multiple models
const chair = await scene.loadModelWithLoader(
  'chair',
  'models/chair.obj',
  modelLoader
);

const table = await scene.loadModelWithLoader(
  'table', 
  'models/table.obj',
  modelLoader
);

// Position them
const chairGroup = scene.get('chair');
chairGroup.setPosition(2, 0, 0);

const tableGroup = scene.get('table');
tableGroup.setPosition(0, 0, 0);

modelLoader.clear();
```

### Dynamic Model Loading

```javascript
// Load models on demand
const loadModelButton = document.getElementById('load-btn');
loadModelButton.addEventListener('click', async () => {
  const file = await selectFile(); // user selects file
  const arrayBuffer = await file.arrayBuffer();
  
  // Parse OBJ from buffer
  const text = new TextDecoder().decode(arrayBuffer);
  const geometry = loadOBJ(text);
  
  scene.add('dynamic-model', {
    geometry,
    material: defaultMaterial,
    position: [0, 0, 0],
  });
});
```

---

## Material System Integration

MTL materials are parsed into a consistent format that works with mushu's material system:

```javascript
const materialData = {
  name: 'Material.001',
  Ka: [0.2, 0.2, 0.2],      // Ambient
  Kd: [0.8, 0.8, 0.8],      // Diffuse
  Ks: [1.0, 1.0, 1.0],      // Specular
  Ns: 32,                    // Specular exponent
  d: 1.0,                    // Opacity
  illum: 2,                  // Illumination model
  map_Kd: 'diffuse.jpg',    // Diffuse texture
  map_Bump: 'normal.jpg',   // Normal map
};

// Convert to mushu material
const mushuMaterial = createMaterialFromMTL(materialData, textureMap);
```

---

## Performance Considerations

### Caching
Use ModelLoader for repeated loading:
```javascript
const loader = new ModelLoader();
// Reuses cached models and textures
const m1 = await loader.load('same-model.obj');
const m2 = await loader.load('same-model.obj'); // instant
```

### Large Models
Split large models into separate OBJ files or use glTF with LOD:
```javascript
// Load LOD0 (high detail)
const model = await Loader.model('model-lod0.obj');

// Switch to LOD1 on distance/performance
const modelLOD1 = await Loader.model('model-lod1.obj');
```

### Texture Optimization
- Use compressed formats (WebP, ASTC)
- Provide multiple mipmap levels
- Reference textures by name only (caching handled)

---

## Troubleshooting

### Model doesn't appear
1. Check camera position: `console.log(cam.position)`
2. Verify model bounds: examine geometry.positions
3. Check texture paths are correct
4. Ensure material is set

### Textures missing
1. Verify texturePath is correct
2. Check MTL file references
3. CORS: ensure textures are accessible (crossOrigin)
4. Use browser DevTools Network tab

### Format not supported
1. Check FORMAT_LOADERS.keys()
2. Register custom loader if needed
3. Use model-formats.js templates

### Performance issues
- Use ModelLoader for caching
- Reduce polygon count with external tools
- Use LOD systems for large scenes
- Profile with DevTools

---

## API Compatibility

### mushu Core
- ✅ `material()` system
- ✅ `flow()` runtime
- ✅ `scene` graph
- ✅ GPU flow (coming)

### External
- ✅ Standard WebGL 2.0
- ✅ Fetch API (CORS required)
- ✅ TextEncoder/Decoder

---

## License

Part of mushu rendering library. See LICENSE file.

