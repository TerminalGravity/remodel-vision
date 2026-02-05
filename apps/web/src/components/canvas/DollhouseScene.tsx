import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { Html } from '@react-three/drei';
import { RoomMesh } from './RoomMesh';
import { RoomLayout } from '../../types/property';

const WALL_HEIGHT = 10; // ft

export const DollhouseScene = () => {
  const { activePropertyContext, setSelectedRoom } = useStore();
  const details = activePropertyContext?.details;
  const rooms = activePropertyContext?.rooms || [];
  const hasRooms = rooms.length > 0;

  // Calculate approximate dimensions from SQFT if not explicit
  // Assume generic rectangle if no rooms defined
  const houseDimensions = useMemo(() => {
    if (!details) return [20, WALL_HEIGHT, 20] as [number, number, number];
    const sqft = details.livingArea?.value || 2000;
    const side = Math.sqrt(sqft / (details.stories || 1));
    // Scale down for viz (1 unit = 1 ft approx)
    return [side, WALL_HEIGHT * (details.stories || 1), side] as [number, number, number];
  }, [details]);

  // Calculate bounds to center the house if we have rooms
  const houseCenterOffset = useMemo((): [number, number, number] => {
    if (!hasRooms) return [0, 0, 0];

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    rooms.forEach(room => {
        if (!room.position) return;
        const w = room.dimensions?.width || 0;
        const l = room.dimensions?.length || 0;

        minX = Math.min(minX, room.position.x);
        maxX = Math.max(maxX, room.position.x + w);
        minZ = Math.min(minZ, room.position.z);
        maxZ = Math.max(maxZ, room.position.z + l);
    });

    if (minX === Infinity) return [0, 0, 0];

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    return [-centerX, 0, -centerZ];
  }, [rooms, hasRooms]);

  // If no context, show placeholder
  if (!activePropertyContext) {
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
        <Html position={[0, 5, 0]} center>
          <div className="glass bg-card/90 text-muted-foreground px-4 py-2 rounded-xl text-xs backdrop-blur border border-border font-medium">
            No Property Data Loaded
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      {/* Foundation / Plot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* House Mass */}
      {hasRooms ? (
        <group position={[houseCenterOffset[0], houseCenterOffset[1], houseCenterOffset[2]]}>
            {rooms.map((room) => {
                if (!room.position) return null;
                
                // Fallback layout generation if missing
                const layout: RoomLayout = room.layout || {
                    confidence: 0.3,
                    source: 'heuristic',
                    ceilingHeight: 9,
                    walls: room.dimensions ? [
                        { start: { x: 0, y: 0 }, end: { x: room.dimensions.width!, y: 0 }, thickness: 0.5, height: 9 },
                        { start: { x: room.dimensions.width!, y: 0 }, end: { x: room.dimensions.width!, y: room.dimensions.length! }, thickness: 0.5, height: 9 },
                        { start: { x: room.dimensions.width!, y: room.dimensions.length! }, end: { x: 0, y: room.dimensions.length! }, thickness: 0.5, height: 9 },
                        { start: { x: 0, y: room.dimensions.length! }, end: { x: 0, y: 0 }, thickness: 0.5, height: 9 }
                    ] : [],
                    openings: []
                };

                return (
                    <group key={room.id} position={[room.position.x, room.position.y, room.position.z]}>
                        <RoomMesh 
                            layout={layout}
                            name={room.name}
                            type={room.type}
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedRoom(room.name); 
                            }}
                        />
                    </group>
                );
            })}
        </group>
      ) : (
        <group position={[0, houseDimensions[1] / 2, 0]}>
            {/* Main Volume (Ghosted) */}
            <mesh castShadow receiveShadow onClick={(e) => { e.stopPropagation(); setSelectedRoom("Main House Volume"); }}>
            <boxGeometry args={houseDimensions} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.1} wireframe />
            </mesh>
            
            {/* Solid floor */}
            <mesh position={[0, -houseDimensions[1] / 2 + 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[houseDimensions[0], houseDimensions[2]]} />
            <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            <Html position={[0, 0, 0]} center>
            <div className="flex flex-col items-center">
                <div className="bg-copper text-background px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-copper/30">
                {details?.livingArea?.value?.toLocaleString()} sqft
                </div>
                <div className="mt-2 glass bg-card/90 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border">
                {details?.bedrooms} Bed / {details?.bathrooms} Bath
                </div>
            </div>
            </Html>
        </group>
      )}
    </group>
  );
};
