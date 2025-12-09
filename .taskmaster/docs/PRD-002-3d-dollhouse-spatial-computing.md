# PRD-002: 3D Dollhouse & Spatial Computing

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** Visualization Engine
**Priority:** P1 (Core Feature)

---

## Overview

The 3D Dollhouse is the spatial computing core of RemodelVision—an interactive, data-driven visualization of properties that enables users to navigate, annotate, and capture viewports for AI processing. Unlike generic 3D modeling tools, the Dollhouse derives its geometry from structured PropertyContext data, ensuring accuracy matches real-world dimensions.

### Problem Statement

> "The 3D dollhouse shouldn't be perfect—that's not the main focus until the app fetches accurate property details just from the address."

Current 3D visualization tools require manual modeling or expensive 3D scanning. RemodelVision's approach:
1. **Data-first**: Generate geometry from structured measurements
2. **Progressive refinement**: Start with estimates, improve with documents
3. **AI-integration**: Every viewport is a potential input for image generation

---

## Current Implementation Status

### Already Built (from codebase analysis)

| Component | Status | Location |
|-----------|--------|----------|
| Three.js + React-Three-Fiber | ✅ Implemented | `components/canvas/DollhouseViewer.tsx` |
| OrbitControls | ✅ Implemented | Camera navigation |
| PlaceholderRoom geometry | ✅ Implemented | Demo room with walls/floor |
| Neighborhood context | ✅ Implemented | External site view |
| Solar study (time-of-day) | ✅ Implemented | Lighting simulation |
| GLB/GLTF model loading | ✅ Implemented | User uploads |
| Viewport capture to Base64 | ✅ Implemented | For AI processing |
| Property annotations | ✅ Implemented | Labels on 3D view |

### Needs Implementation

| Component | Priority | PRD Section |
|-----------|----------|-------------|
| PropertyContext-driven geometry | P0 | FR-001 |
| Room-by-room navigation | P0 | FR-002 |
| Measurement visualization | P1 | FR-003 |
| Schematic overlays | P1 | FR-004 |
| WebGPU compute acceleration | P2 | FR-005 |

---

## Functional Requirements

### FR-001: Property Data-Driven 3D Generation

**Description:** Generate 3D room geometry from PropertyContext measurements, not manual modeling.

**Data Flow:**
```
PropertyContext.rooms[] ───▶ GeometryGenerator ───▶ Three.js Scene
       │                           │                      │
       │                           │                      │
  ┌────▼────┐               ┌──────▼──────┐         ┌─────▼─────┐
  │ Room    │               │ Wall/Floor  │         │ Mesh      │
  │ Dims    │    ───▶       │ Algorithms  │  ───▶   │ Objects   │
  │ Features│               │ Window/Door │         │ Materials │
  │ Openings│               │ Placement   │         │ Lighting  │
  └─────────┘               └─────────────┘         └───────────┘
```

**Geometry Generation Algorithm:**

```typescript
// services/geometryGenerator.ts

interface GeneratedRoom {
  id: string;
  meshes: THREE.Mesh[];
  boundingBox: THREE.Box3;
  features: FeatureMesh[];
  labels: AnnotationLabel[];
}

function generateRoomGeometry(room: RoomContext): GeneratedRoom {
  const { dimensions, features, openings } = room.measurements;

  // 1. Create floor plane
  const floor = createFloor(dimensions.length, dimensions.width);

  // 2. Create walls with openings
  const walls = createWalls(dimensions, openings);

  // 3. Add ceiling
  const ceiling = createCeiling(dimensions);

  // 4. Place features (windows, doors)
  const featureMeshes = features.map(f => createFeatureMesh(f));

  // 5. Apply materials based on currentState
  applyMaterials({ floor, walls, ceiling }, room.currentState);

  return {
    id: room.id,
    meshes: [floor, ...walls, ceiling],
    boundingBox: calculateBoundingBox(dimensions),
    features: featureMeshes,
    labels: generateLabels(room),
  };
}
```

**Acceptance Criteria:**
- [ ] Rooms render within ±2" of specified dimensions
- [ ] Windows and doors positioned correctly on walls
- [ ] Multiple rooms connected through openings
- [ ] Fallback to placeholder geometry when data missing
- [ ] Visual indicator of "estimated" vs. "measured" dimensions

---

### FR-002: Multi-Room Navigation

**Description:** Navigate between rooms with smooth camera transitions and context awareness.

**Navigation Modes:**

| Mode | Description | Camera Behavior |
|------|-------------|-----------------|
| **Dollhouse** | Full property from above | Isometric, zoom to room |
| **Floor Plan** | 2D top-down view | Orthographic, no tilt |
| **Room Focus** | Single room immersive | First-person perspective |
| **Walk-through** | Sequential room tour | Animated path |

**Room Selection Interface:**
```
┌────────────────────────────────────────────────────────────────┐
│  🏠 PROPERTY OVERVIEW                                          │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │         ┌─────────────┐                                   │ │
│  │         │   Bedroom   │                                   │ │
│  │         │     2       │                                   │ │
│  │         └─────────────┘                                   │ │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │ │
│  │   │  Kitchen    │   │   Living    │   │  Primary    │    │ │
│  │   │  [ACTIVE]   │───│    Room     │   │  Bedroom    │    │ │
│  │   │   12x14     │   │   18x22     │   │   14x16     │    │ │
│  │   └─────────────┘   └─────────────┘   └─────────────┘    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Rooms: [Kitchen ●] [Living] [Primary] [Bedroom 2] [Bath 1]    │
│                                                                 │
│  View: [🏠 Dollhouse] [📐 Floor Plan] [👁️ Room Focus]          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Camera Transition Code:**

```typescript
// hooks/useCameraNavigation.ts

function navigateToRoom(roomId: string, mode: ViewMode) {
  const room = scene.getObjectByName(`room-${roomId}`);
  if (!room) return;

  const targetPosition = calculateCameraPosition(room, mode);
  const targetLookAt = room.position.clone();

  // Smooth GSAP-style animation
  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 1.2,
    ease: 'power2.inOut',
  });

  gsap.to(controls.target, {
    x: targetLookAt.x,
    y: targetLookAt.y,
    z: targetLookAt.z,
    duration: 1.2,
  });
}
```

**Acceptance Criteria:**
- [ ] Click room in dollhouse → camera animates to room
- [ ] Room selector dropdown for quick navigation
- [ ] Breadcrumb showing current location
- [ ] Keyboard navigation (arrow keys)
- [ ] Touch/gesture support for mobile

---

### FR-003: Measurement Visualization

**Description:** Display dimensions, heights, and clearances directly on the 3D view.

**Measurement Types:**

```typescript
interface MeasurementDisplay {
  type: 'linear' | 'area' | 'height' | 'clearance';
  startPoint: Vector3;
  endPoint: Vector3;
  value: number;
  unit: 'ft' | 'in' | 'm';
  label: string;
  visibility: 'always' | 'hover' | 'selected';
  style: MeasurementStyle;
}

interface MeasurementStyle {
  lineColor: string;
  lineWidth: number;
  labelBackground: string;
  labelFont: string;
  endCaps: 'arrow' | 'tick' | 'none';
}
```

**Visual Representation:**

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│    ←────────────── 12' 4" ──────────────→                        │
│    ┌─────────────────────────────────────┐                       │
│    │                                     │    ↑                  │
│    │         KITCHEN                     │    │                  │
│    │                                     │   9' 0"               │
│    │    Island                           │    │                  │
│    │    ←4' 2"→                          │    ↓                  │
│    │    ┌─────┐       36" clearance      │                       │
│    │    │     │←─────────────────────────│                       │
│    │    └─────┘                          │                       │
│    │                                     │                       │
│    └──────────────────┬──────────────────┘                       │
│                       │ 32" door                                 │
│    ←───── 14' 2" ─────→                                          │
│                                                                   │
│    [📏 Toggle Measurements] [📐 Add Custom] [🎚️ Show Clearances] │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```typescript
// components/canvas/MeasurementLayer.tsx

function MeasurementLayer({ room, visible }: Props) {
  const measurements = useMemo(() =>
    extractMeasurements(room), [room]
  );

  return (
    <group visible={visible}>
      {measurements.map(m => (
        <MeasurementLine
          key={m.id}
          start={m.startPoint}
          end={m.endPoint}
          label={formatMeasurement(m.value, m.unit)}
          style={m.style}
        />
      ))}
    </group>
  );
}

function MeasurementLine({ start, end, label, style }: LineProps) {
  const points = useMemo(() => [start, end], [start, end]);

  return (
    <>
      <Line
        points={points}
        color={style.lineColor}
        lineWidth={style.lineWidth}
      />
      <Html position={midpoint(start, end)}>
        <div className="measurement-label">
          {label}
        </div>
      </Html>
    </>
  );
}
```

**Acceptance Criteria:**
- [ ] Room dimensions displayed on walls
- [ ] Height dimensions on vertical elements
- [ ] Clearance indicators between objects
- [ ] Toggle visibility on/off
- [ ] Click-to-edit for user corrections

---

### FR-004: Schematic Overlay System

**Description:** Display trade-specific information as toggleable layers on the 3D view.

**Overlay Layers:**

| Layer | Visual Style | Elements |
|-------|--------------|----------|
| **Electrical** | Yellow, circuit symbols | Outlets, switches, panels, circuits |
| **Plumbing** | Blue, pipe symbols | Supply, drain, vents, fixtures |
| **HVAC** | Green, duct symbols | Ducts, vents, equipment |
| **Framing** | Orange, dashed lines | Studs, headers, load-bearing |
| **Demolition** | Red, hatched | Areas to be removed |

**Layer Toggle Interface:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 SCHEMATIC OVERLAYS                                              │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [3D VIEW WITH OVERLAYS]                                    │   │
│  │                                                             │   │
│  │     ⚡────○────○────○                                       │   │
│  │     │                                                       │   │
│  │     Panel                                                   │   │
│  │                                                             │   │
│  │     ◎ Outlet (20A)        ◎ Outlet (20A)                    │   │
│  │                                                             │   │
│  │         ═════════════════════                               │   │
│  │         HVAC Duct (12"x6")                                  │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Layers:                                                            │
│  [✓] 🔌 Electrical   [✓] 🚿 Plumbing   [ ] 🌡️ HVAC                  │
│  [ ] 🔨 Framing      [ ] 🗑️ Demo       [✓] 📐 Measurements          │
│                                                                     │
│  Legend:                                                            │
│  ○ Outlet  ⊙ Switch  ◆ GFCI  ═ Duct  ─ Supply  ─ Drain             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Implementation Architecture:**

```typescript
// components/canvas/SchematicOverlay.tsx

interface SchematicLayer {
  type: 'electrical' | 'plumbing' | 'hvac' | 'framing' | 'demolition';
  visible: boolean;
  elements: SchematicElement[];
  style: LayerStyle;
}

interface SchematicElement {
  id: string;
  type: string;       // e.g., 'outlet', 'switch', 'supply-line'
  position: Vector3;
  rotation?: Euler;
  data: Record<string, unknown>;  // Trade-specific data
  label?: string;
  connections?: string[];  // IDs of connected elements
}

function SchematicOverlay({ layers, room }: Props) {
  return (
    <group name="schematics">
      {layers.filter(l => l.visible).map(layer => (
        <SchematicLayerGroup
          key={layer.type}
          layer={layer}
          roomBounds={room.boundingBox}
        />
      ))}
    </group>
  );
}
```

**Acceptance Criteria:**
- [ ] Independent toggle for each layer
- [ ] Symbols positioned accurately in 3D space
- [ ] Connections shown between related elements
- [ ] Hover for element details
- [ ] Export layer as 2D schematic

---

### FR-005: WebGPU Compute Acceleration

**Description:** Leverage WebGPU for advanced rendering and computational tasks.

**Use Cases:**

| Task | Current | With WebGPU | Improvement |
|------|---------|-------------|-------------|
| Geometry generation | CPU, sequential | GPU parallel | 10x faster |
| Lighting simulation | Pre-baked | Real-time ray tracing | Dynamic |
| Material preview | Basic PBR | Path-traced | Photorealistic |
| Collision detection | CPU loops | GPU compute | Instant |

**WebGPU Pipeline:**

```typescript
// services/webgpuCompute.ts

class WebGPUEngine {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;

  async initialize() {
    const adapter = await navigator.gpu.requestAdapter();
    this.device = await adapter.requestDevice();
  }

  async generateRoomGeometry(rooms: RoomContext[]): Promise<GeometryBuffer> {
    const shaderModule = this.device.createShaderModule({
      code: ROOM_GEOMETRY_SHADER,
    });

    // Parallel geometry generation on GPU
    const computePipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'generateWalls',
      },
    });

    // Execute on GPU
    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(computePipeline);
    passEncoder.dispatchWorkgroups(rooms.length);
    passEncoder.end();

    return this.readResults();
  }
}
```

**Feature Detection & Fallback:**

```typescript
// utils/renderingCapabilities.ts

async function detectCapabilities(): Promise<RenderingMode> {
  // Check WebGPU support
  if ('gpu' in navigator) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        return 'webgpu';
      }
    } catch (e) {
      console.warn('WebGPU not available, falling back');
    }
  }

  // Check WebGL2 support
  const canvas = document.createElement('canvas');
  if (canvas.getContext('webgl2')) {
    return 'webgl2';
  }

  // Fallback to basic WebGL
  return 'webgl';
}
```

**Acceptance Criteria:**
- [ ] WebGPU used when available (Chrome 113+)
- [ ] Graceful fallback to WebGL2/WebGL
- [ ] Performance metrics exposed for debugging
- [ ] GPU memory management (cleanup on scene change)

---

## Data Integration

### PropertyContext → 3D Scene

```typescript
// hooks/useSceneFromProperty.ts

function useSceneFromProperty(property: PropertyContext) {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('estimated');

  useEffect(() => {
    async function buildScene() {
      setLoading(true);

      const rooms = await Promise.all(
        property.rooms.map(room => generateRoomGeometry(room))
      );

      const scene = new THREE.Scene();

      // Position rooms based on floor plan
      const floorPlan = calculateFloorPlan(property.rooms);
      rooms.forEach((room, idx) => {
        const position = floorPlan.positions[idx];
        room.meshes.forEach(mesh => {
          mesh.position.add(position);
          scene.add(mesh);
        });
      });

      // Add lighting
      addLighting(scene, property.location.sunPath);

      // Add neighborhood context if in site mode
      if (showNeighborhood) {
        addNeighborhoodContext(scene, property.location);
      }

      setScene(scene);
      setAccuracy(calculateAccuracy(property));
      setLoading(false);
    }

    buildScene();
  }, [property]);

  return { scene, loading, accuracy };
}
```

### Accuracy Indicators

```typescript
type AccuracyLevel = 'estimated' | 'scraped' | 'document' | 'verified';

interface AccuracyIndicator {
  level: AccuracyLevel;
  color: string;
  icon: string;
  description: string;
}

const ACCURACY_INDICATORS: Record<AccuracyLevel, AccuracyIndicator> = {
  estimated: {
    level: 'estimated',
    color: '#FFA500',  // Orange
    icon: '⚠️',
    description: 'AI-estimated from address. Verify with measurements.',
  },
  scraped: {
    level: 'scraped',
    color: '#87CEEB',  // Light blue
    icon: '🔍',
    description: 'Populated from public records. May need verification.',
  },
  document: {
    level: 'document',
    color: '#90EE90',  // Light green
    icon: '📄',
    description: 'Extracted from uploaded documents.',
  },
  verified: {
    level: 'verified',
    color: '#00FF00',  // Green
    icon: '✓',
    description: 'User-verified accurate dimensions.',
  },
};
```

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial load | <3 seconds | Time to first meaningful render |
| Room navigation | <500ms | Camera transition time |
| Viewport capture | <100ms | For AI processing |
| Memory usage | <500MB | Typical property |
| Frame rate | 60fps | During navigation |
| Large property | <5 seconds | 10+ rooms |

---

## Technical Architecture

### Scene Graph Structure

```
Scene
├── Lights
│   ├── AmbientLight
│   ├── DirectionalLight (sun)
│   └── PointLights (interior)
├── Property
│   ├── Room: Kitchen
│   │   ├── Floor
│   │   ├── Walls[]
│   │   ├── Ceiling
│   │   ├── Features[]
│   │   └── Annotations[]
│   ├── Room: Living
│   │   └── ...
│   └── Room: Bedroom
│       └── ...
├── Overlays
│   ├── Measurements
│   ├── Electrical
│   ├── Plumbing
│   └── HVAC
├── Neighborhood (conditional)
│   ├── Ground
│   ├── Trees
│   └── Buildings
└── Controls
    ├── OrbitControls
    ├── TransformControls
    └── Annotations
```

### Component Hierarchy

```
DollhouseViewer
├── Canvas (react-three-fiber)
│   ├── Camera
│   ├── Lights
│   ├── PropertyModel
│   │   ├── RoomGroup (per room)
│   │   │   ├── FloorMesh
│   │   │   ├── WallMeshes
│   │   │   ├── CeilingMesh
│   │   │   └── FeatureMeshes
│   │   └── ConnectionMeshes
│   ├── SchematicOverlay
│   ├── MeasurementLayer
│   ├── AnnotationLayer
│   ├── OrbitControls
│   └── Effects (postprocessing)
├── ControlsOverlay (HTML)
│   ├── ViewModeSelector
│   ├── RoomNavigator
│   ├── LayerToggles
│   └── CaptureButton
└── AccuracyIndicator
```

---

## Integration Points

### With Property Context (PRD-001)
- Room dimensions → 3D geometry
- Features → Meshes (windows, doors)
- Constraints → Overlay annotations

### With Gemini AI (PRD-003)
- Viewport capture → Image input
- Scene metadata → Prompt context
- Generated images → Texture application

### With Image Generation (PRD-004)
- 3D viewport → Reference image
- Camera position → Perspective matching
- Style context → Material suggestions

### With GC Intelligence (PRD-007)
- Schematic data → Overlay layers
- Annotations → 3D callouts
- Trade views → Layer presets

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex geometry | Slow rendering | LOD (Level of Detail) system |
| Memory leaks | Browser crashes | Strict cleanup on unmount |
| Mobile performance | Unusable on phones | Adaptive quality settings |
| Inaccurate estimates | Misleading visualization | Clear accuracy indicators |
| WebGPU unavailable | Feature gaps | Robust fallback chain |

---

## Future Enhancements

1. **AR Mode** - View 3D model in real space via device camera
2. **VR Walkthrough** - Immersive property tours with VR headsets
3. **Matterport Import** - Import existing 3D scans
4. **LiDAR Integration** - Generate geometry from iPhone/iPad LiDAR
5. **Collaborative Viewing** - Multiple users in same 3D session
6. **Time-lapse** - Show construction progress over time

---

*Document maintained by RemodelVision Team*
