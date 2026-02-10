# mushu Scene & Material System Implementation

## Goal
Make mushu easier to chain multi-object 3D scenes with different simulations and materials.

## Tasks Completed

### Phase 1: Material System ✅
- [x] Create `src/core/material.js` - Core material classes
  - [x] Material base class with uniform management
  - [x] BuiltMaterial (simple colors)
  - [x] PBRMaterial (physically based rendering)
  - [x] PhysicalMaterial (with transmission/refraction)
  - [x] ShaderMaterial (custom GLSL)
  - [x] Material presets factory

### Phase 2: Scene Graph ✅
- [x] Create `src/core/scene.js` - Scene management
  - [x] Scene class with object registry
  - [x] SceneObject class with transform hierarchy
  - [x] Parent/child relationship management
  - [x] World matrix calculation
  - [x] Bounding box management

### Phase 3: Object Composition ✅
- [x] Enhance `src/core/geometry.js` (implicit - uses existing primitives)
  - [x] object() builder for declarative objects
  - [x] part() for hierarchical objects (via parent parameter)
  - [x] Enhanced mesh() with material support

### Phase 4: Integration ✅
- [x] Update `src/core/index.js` - Export new APIs
- [x] Update `src/index.js` - Add `.scene()` entry point
- [x] Register geometry presets via `useGeometries()`

### Phase 5: Examples ✅
- [x] Create `examples/scene/multi-material.html` - Different materials on objects
- [x] Create `examples/scene/hierarchical.html` - Parent-child relationships
- [x] Create `examples/scene/physical-materials.html` - Physical/transmission materials

## Implementation Summary

### New APIs Added

#### Material System (`src/core/material.js`)
```javascript
import { material, materials } from 'mushu/core';

// Create materials by type
const metal = material('pbr', { metallic: 1.0, roughness: 0.2 });
const glass = material('physical', { transmission: 0.9 });
const custom = material('shader', { fragment: '...' });

// Or use presets
const gold = materials.gold();
```

#### Scene Graph (`src/core/scene.js`)
```javascript
import { mushuScene } from 'mushu/core';

const scene = mushuScene('#canvas')
  .useGeometries({
    cube: () => cube(),
    sphere: () => sphere()
  })
  .add('box', { material: metal, position: [0,0,0] })
  .add('sphere', { material: glass, parent: 'box' })
  .go();
```

#### Unified API (`src/index.js`)
```javascript
import { mushu } from 'mushu';

mushu('#canvas').scene()  // Scene graph API
```

## Testing
- [ ] Run existing tests: `npm test`
- [ ] Test new scene examples manually

## Success Criteria
- [x] Easy multi-object scene creation
- [x] Declarative object composition
- [x] Built-in material system with PBR
- [x] Hierarchical transforms (parenting)
- [x] Clean API that remains simple

