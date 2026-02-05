import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Grid, GizmoHelper, GizmoViewport, Sky, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { Eye, Grid as GridIcon, Layers, Sun, Map as MapIcon, Compass, Camera } from 'lucide-react';
import { AppStatus } from '../../types';

import { DollhouseScene } from './DollhouseScene';

// Helper to capture the canvas
const ScreenshotManager = () => {
  const { gl, scene, camera } = useThree();
  const captureRequest = useStore((state) => state.captureRequest);
  const setCaptureRequest = useStore((state) => state.setCaptureRequest);

  useEffect(() => {
    if (captureRequest) {
      gl.render(scene, camera);
      const screenshot = gl.domElement.toDataURL('image/png');
      
      // Capture Camera State
      const pCam = camera as THREE.PerspectiveCamera;
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      // Estimate target based on look direction (since we don't have direct access to OrbitControls target here)
      const target = new THREE.Vector3().copy(camera.position).add(direction.multiplyScalar(20));

      const cameraState = {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [target.x, target.y, target.z],
        fov: pCam.fov,
        aspect: pCam.aspect,
        up: [camera.up.x, camera.up.y, camera.up.z]
      };

      const event = new CustomEvent('canvas-snapshot', { 
        detail: {
          image: screenshot,
          camera: cameraState
        } 
      });
      window.dispatchEvent(event);
      setCaptureRequest(false);
    }
  }, [captureRequest, gl, scene, camera, setCaptureRequest]);

  return null;
};

// The loaded GLB model
const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  const setSelectedRoom = useStore((state) => state.setSelectedRoom);
  
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    // Center model but keep bottom at y=0
    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -box.min.y;
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
      onClick={(e: any) => {
        e.stopPropagation();
        setSelectedRoom(e.object.name || "Unknown Room");
      }}
    />
  );
};

// Simulated Neighborhood Context
const Neighborhood = () => {
  // Generate random building blocks
  const buildings = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 35 + Math.random() * 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const width = 10 + Math.random() * 10;
      const depth = 10 + Math.random() * 10;
      const height = 8 + Math.random() * 15;
      return { position: [x, height / 2, z] as [number, number, number], args: [width, height, depth] as [number, number, number] };
    });
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position} castShadow receiveShadow>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
      ))}
      {/* Street Grid */}
      <Grid 
        infiniteGrid 
        fadeDistance={100} 
        sectionColor="#94a3b8" 
        cellColor="#475569" 
        position={[0, -0.1, 0]} 
        cellThickness={0.5} 
        sectionThickness={1} 
        cellSize={2} 
        sectionSize={10} 
      />
    </group>
  );
};

// Property Information Labels
const PropertyAnnotations = ({ visible }: { visible: boolean }) => {
  const { activePropertyMeta } = useStore();
  
  if (!visible) return null;

  return (
    <group>
       <Html position={[10, 2, 10]} center distanceFactor={15}>
          <div className="bg-copper/90 text-background px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg backdrop-blur border border-copper-light/20">
            Property Line
          </div>
       </Html>
       <Html position={[-10, 2, -10]} center distanceFactor={15}>
          <div className="bg-copper/90 text-background px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg backdrop-blur border border-copper-light/20">
             Setback: 10ft
          </div>
       </Html>
       {activePropertyMeta && (
         <Html position={[0, 8, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
           <div className="glass bg-card/90 border border-border text-foreground p-3 rounded-xl flex flex-col items-center gap-1.5 shadow-2xl">
             <div className="text-[10px] uppercase text-copper font-bold tracking-wider">Zoning</div>
             <div className="text-sm font-bold font-display">{activePropertyMeta.zoning}</div>
             <div className="w-full h-px bg-border my-1"></div>
             <div className="text-[10px] text-copper-light">Lot: {activePropertyMeta.lotSize}</div>
           </div>
         </Html>
       )}
    </group>
  );
};


export const DollhouseViewer = () => {
  const { modelUrl, siteMode, setSiteMode, setCaptureRequest, setStatus, addMessage, activeMediaType } = useStore();
  const [showGrid, setShowGrid] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState(14); // 24hr format, default 2 PM

  // Calculate sun position based on time
  const sunPosition = useMemo(() => {
    const angle = ((timeOfDay - 6) / 18) * Math.PI; // Map 6am-12am to 0-PI
    const x = Math.cos(angle) * 50;
    const y = Math.sin(angle) * 50;
    return [x, y, 20] as [number, number, number];
  }, [timeOfDay]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-card relative group overflow-hidden">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [20, 20, 20], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Sky sunPosition={sunPosition} turbidity={8} rayleigh={6} mieCoefficient={0.005} mieDirectionalG={0.8} />
          
          <ambientLight intensity={siteMode ? 0.3 : 0.6} />
          <directionalLight 
            position={sunPosition} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
            shadow-bias={-0.0001}
          />
          
          {modelUrl ? <Model url={modelUrl} /> : <DollhouseScene />}
          
          {/* Site Context Elements */}
          {siteMode && (
            <>
              <Neighborhood />
              <PropertyAnnotations visible={true} />
              <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
                 <planeGeometry args={[200, 200]} />
                 <meshStandardMaterial color="#334155" />
              </mesh>
            </>
          )}

          {!siteMode && showGrid && (
             <Grid infiniteGrid fadeDistance={40} sectionColor="#4f46e5" cellColor="#64748b" position={[0, 0.01, 0]} cellThickness={0.5} sectionThickness={1} />
          )}

          <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.4} far={10} color="#000000" />
          
          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1} 
            maxDistance={siteMode ? 100 : 30}
          />
          
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
          </GizmoHelper>
          
          <ScreenshotManager />
        </Suspense>
      </Canvas>
      
      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-3">
        {/* View Modes */}
        <div className="glass bg-card/90 border border-border p-1.5 rounded-xl flex gap-1 shadow-xl">
           <button
             onClick={() => setSiteMode(false)}
             className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${!siteMode ? 'bg-copper text-background shadow-lg shadow-copper/25' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
           >
             <Layers className="w-3 h-3" />
             Interior
           </button>
           <button
             onClick={() => setSiteMode(true)}
             className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${siteMode ? 'bg-copper text-background shadow-lg shadow-copper/25' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
           >
             <MapIcon className="w-3 h-3" />
             Site Context
           </button>
        </div>

        {/* Environmental Controls */}
        <div className="glass bg-card/90 border border-border p-4 rounded-xl text-foreground shadow-xl min-w-[200px]">
           <h3 className="text-xs font-bold text-copper uppercase tracking-wider mb-4 flex items-center gap-2">
             <Sun className="w-3 h-3 text-copper-light" />
             Solar Study
           </h3>

           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                 <span>6 AM</span>
                 <span>12 PM</span>
                 <span>8 PM</span>
               </div>
               <input
                 type="range"
                 min="6"
                 max="20"
                 step="0.5"
                 value={timeOfDay}
                 onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                 className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-copper"
               />
               <div className="text-center text-xs font-mono text-copper-light mt-1">
                 {Math.floor(timeOfDay)}:{timeOfDay % 1 === 0 ? '00' : '30'}
               </div>
             </div>
           </div>
        </div>

        {/* Layer Toggles */}
        {!siteMode && (
          <div className="glass bg-card/90 border border-border p-2 rounded-xl text-foreground shadow-xl">
             <button
               onClick={() => setShowGrid(!showGrid)}
               className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all ${showGrid ? 'bg-copper/20 text-copper' : 'hover:bg-secondary text-muted-foreground'}`}
             >
               <GridIcon className="w-3 h-3" />
               {showGrid ? 'Hide Floor Grid' : 'Show Floor Grid'}
             </button>
          </div>
        )}

        {/* Action Button */}
        <div className="glass bg-card/90 border border-border p-2 rounded-xl shadow-xl mt-2">
            <button
              onClick={() => {
                setStatus(activeMediaType === 'video' ? AppStatus.GENERATING_VIDEO : AppStatus.GENERATING_IMAGE);
                addMessage({ role: 'system', content: `Capturing view for ${activeMediaType}...` });
                setCaptureRequest(true);
              }}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold bg-copper hover:bg-copper-dark text-background transition-all shadow-lg shadow-copper/25 hover:shadow-copper/40 justify-center btn-press"
            >
              <Camera className="w-4 h-4" />
              Visualize This View
            </button>
        </div>
      </div>
      
      {/* Compass / Orientation */}
      <div className="absolute top-6 right-6 pointer-events-none">
         <div className="glass bg-card/80 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground flex items-center gap-2">
           <Compass className="w-3 h-3 text-copper" />
           <span>N 0°</span>
         </div>
      </div>
    </div>
  );
};