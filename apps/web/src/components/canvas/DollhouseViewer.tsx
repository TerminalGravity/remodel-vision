import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Grid, GizmoHelper, GizmoViewport, Sky, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { Eye, Grid as GridIcon, Layers, Sun, Map as MapIcon, Compass } from 'lucide-react';

// Helper to capture the canvas
const ScreenshotManager = () => {
  const { gl, scene, camera } = useThree();
  const captureRequest = useStore((state) => state.captureRequest);
  const setCaptureRequest = useStore((state) => state.setCaptureRequest);

  useEffect(() => {
    if (captureRequest) {
      gl.render(scene, camera);
      const screenshot = gl.domElement.toDataURL('image/png');
      const event = new CustomEvent('canvas-snapshot', { detail: screenshot });
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
          <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg backdrop-blur">
            Property Line
          </div>
       </Html>
       <Html position={[-10, 2, -10]} center distanceFactor={15}>
          <div className="bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap shadow-lg backdrop-blur">
             Setback: 10ft
          </div>
       </Html>
       {activePropertyMeta && (
         <Html position={[0, 8, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
           <div className="bg-slate-900/80 border border-slate-600 text-white p-2 rounded flex flex-col items-center gap-1 shadow-2xl backdrop-blur">
             <div className="text-[10px] uppercase text-slate-400 font-bold">Zoning</div>
             <div className="text-sm font-bold">{activePropertyMeta.zoning}</div>
             <div className="w-full h-px bg-slate-700 my-1"></div>
             <div className="text-[10px] text-green-400">Lot: {activePropertyMeta.lotSize}</div>
           </div>
         </Html>
       )}
    </group>
  );
};

const PlaceholderRoom = () => {
  const setSelectedRoom = useStore((state) => state.setSelectedRoom);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={(e) => { e.stopPropagation(); setSelectedRoom("Floor Plan Area"); }}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, -5]} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); setSelectedRoom("North Wall"); }}>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); setSelectedRoom("West Wall"); }}>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow onClick={(e) => { e.stopPropagation(); setSelectedRoom("Kitchen Island Mockup"); }}>
        <boxGeometry args={[3, 1, 1.2]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
};

export const DollhouseViewer = () => {
  const { modelUrl, siteMode, setSiteMode } = useStore();
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
    <div className="w-full h-full bg-gradient-to-b from-sky-900 to-slate-900 relative group overflow-hidden">
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
          
          {modelUrl ? <Model url={modelUrl} /> : <PlaceholderRoom />}
          
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
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-1.5 rounded-lg flex gap-1 shadow-xl">
           <button 
             onClick={() => setSiteMode(false)}
             className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${!siteMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <Layers className="w-3 h-3" />
             Interior
           </button>
           <button 
             onClick={() => setSiteMode(true)}
             className={`px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors ${siteMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <MapIcon className="w-3 h-3" />
             Site Context
           </button>
        </div>

        {/* Environmental Controls */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg text-white shadow-xl min-w-[200px]">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Sun className="w-3 h-3 text-orange-400" />
             Solar Study
           </h3>
           
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-[10px] text-slate-400 mb-1">
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
                 className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
               <div className="text-center text-xs font-mono text-orange-400 mt-1">
                 {Math.floor(timeOfDay)}:{timeOfDay % 1 === 0 ? '00' : '30'}
               </div>
             </div>
           </div>
        </div>

        {/* Layer Toggles */}
        {!siteMode && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg text-white shadow-xl">
             <button 
               onClick={() => setShowGrid(!showGrid)}
               className={`flex items-center gap-2 w-full px-3 py-2 rounded text-xs transition-colors ${showGrid ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-slate-300'}`}
             >
               <GridIcon className="w-3 h-3" />
               {showGrid ? 'Hide Floor Grid' : 'Show Floor Grid'}
             </button>
          </div>
        )}
      </div>
      
      {/* Compass / Orientation */}
      <div className="absolute top-6 right-6 pointer-events-none">
         <div className="bg-black/50 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/70 flex items-center gap-2">
           <Compass className="w-3 h-3" />
           <span>N 0°</span>
         </div>
      </div>
    </div>
  );
};