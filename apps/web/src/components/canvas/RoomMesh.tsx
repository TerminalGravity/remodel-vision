
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoomLayout, Wall, Opening } from '../../types/property';
import { Html } from '@react-three/drei';

interface RoomMeshProps {
  layout: RoomLayout;
  name?: string;
  type?: string;
  onClick?: (e: any) => void;
}

/**
 * Parametric Room Mesh Generator
 * 
 * Renders a room based on its layout data (walls, openings).
 * Adjusts visual style based on data confidence (Tier 2/3/4).
 */
export const RoomMesh: React.FC<RoomMeshProps> = ({ layout, name, type, onClick }) => {
  const { walls, openings, ceilingHeight, confidence } = layout;

  // Determine Visual Style based on Confidence
  const style = useMemo(() => {
    if (confidence > 0.8) {
      // Tier 2: High Confidence (Measured)
      return {
        opacity: 1.0,
        transparent: false,
        roughness: 0.5,
        wireframe: false,
        color: type?.includes('kitchen') ? '#bbf7d0' : type?.includes('bath') ? '#bfdbfe' : '#e2e8f0'
      };
    } else if (confidence > 0.6) {
      // Tier 3: Medium Confidence (Vision)
      return {
        opacity: 0.8,
        transparent: true,
        roughness: 0.3,
        wireframe: false,
        color: type?.includes('kitchen') ? '#86efac' : type?.includes('bath') ? '#93c5fd' : '#cbd5e1'
      };
    } else {
      // Tier 4: Low Confidence (Heuristic)
      return {
        opacity: 0.3,
        transparent: true,
        roughness: 0.8,
        wireframe: false, // Keep solid but ghosted for better clickability
        color: '#94a3b8'
      };
    }
  }, [confidence, type]);

  // Generate Geometry for Walls
  const wallGeometries = useMemo(() => {
    return walls.map((wall, index) => {
      // 1. Calculate Wall Dimensions
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y; // Usually 0 for flat floor plan
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // 2. Create Base Shape (Face of the wall)
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(length, 0);
      shape.lineTo(length, ceilingHeight);
      shape.lineTo(0, ceilingHeight);
      shape.lineTo(0, 0);

      // 3. Add Holes for Openings
      const wallOpenings = openings.filter(o => o.wallIndex === index);
      wallOpenings.forEach(opening => {
        const hole = new THREE.Path();
        const x = opening.position;
        const y = opening.sillHeight || 0;
        const w = opening.width;
        const h = opening.height;

        hole.moveTo(x, y);
        hole.lineTo(x + w, y);
        hole.lineTo(x + w, y + h);
        hole.lineTo(x, y + h);
        hole.lineTo(x, y);
        shape.holes.push(hole);
      });

      // 4. Extrude
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: wall.thickness,
        bevelEnabled: false
      });

      // 5. Position and Rotate
      // ExtrudeGeometry extrudes along Z by default. 
      // We need to rotate it to stand up and align with the wall segment.
      // Initial shape is in XY plane.
      
      // Center geometry pivot for easier rotation? No, keep at start point.
      // Translate to start position
      geometry.rotateY(-angle); // Rotate to align with direction? 
      // Actually:
      // Shape is in XY. We want it standing up. So Y is Up. X is along length. Z is thickness.
      // Wall segment is in XZ plane of the house.
      // So we map Shape X -> House Wall Length
      // Shape Y -> House Height (Y)
      // Shape Extrude (Z) -> House Wall Thickness
      
      // But we need to rotate the whole thing so that Shape X aligns with (dx, dy) in the XZ plane.
      // wait, (dx, dy) above was calculated from x/y coordinates of walls.
      // If "top down" 2D coordinates are X,Y, then in 3D:
      // House X = Wall 2D X
      // House Z = Wall 2D Y
      // House Y = Height
      
      // So wall vector is (dx, 0, dy_2d)
      const angle2D = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
      
      // Reset geometry rotation logic:
      // 1. Create geometry. It stands in XY plane, depth is Z.
      // 2. We want it standing on XZ plane.
      //    So Shape Y should be World Y. (Correct)
      //    Shape X should be along the wall line.
      //    Shape Z (depth) should be perpendicular.
      
      // By default Extrude creates volume in +Z.
      // We rotate around Y axis to align with wall direction.
      // And we translate to start.
      
      // But wait, the shape itself is drawn in XY. 
      // So it is vertical wall by default if we just place it.
      // We just need to rotate it around Y axis (vertical) to point in correct direction.
      
      const rotY = -angle2D; // Counter-clockwise in 2D = Positive rotation around Y in 3D?
                             // ThreeJS: Y is up. Right-hand rule. 
                             // Z comes out of screen. X goes right.
                             // atan2(y, x): positive y is "down" in 2D canvas usually, but "up" or "back" in 3D?
                             // Let's assume standard top-down: +y is 'North' (negative Z in ThreeJS?) or +Z?
                             // Let's stick to Property coordinates: X/Y in 2D.
                             // We map 2D Y to 3D Z usually.
                             // So vector (dx, dy) -> (dx, 0, dy).
                             // Rotation is atan2(dy, dx).
      
      geometry.rotateY(-angle2D); 
      geometry.translate(wall.start.x, 0, wall.start.y); // Map 2D Y to 3D Z

      return geometry;
    });
  }, [walls, ceilingHeight]);

  return (
    <group onClick={onClick}>
        {wallGeometries.map((geo, i) => (
            <mesh 
                key={i} 
                geometry={geo} 
                castShadow 
                receiveShadow
            >
                <meshStandardMaterial 
                    color={style.color}
                    transparent={style.transparent}
                    opacity={style.opacity}
                    roughness={style.roughness}
                    wireframe={style.wireframe}
                    side={THREE.DoubleSide}
                />
            </mesh>
        ))}
        
        {/* Floor */}
        {/* Assuming convex hull of wall start points or simple bounding box for now */}
        {/* For Tier 4 generated rooms, they are rectangles, so we can just use a plane */}
        {/* But we need vertices. Let's just create a shape from wall starts */}
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
             <shapeGeometry args={[useMemo(() => {
                 const s = new THREE.Shape();
                 if (walls.length > 0) {
                     s.moveTo(walls[0].start.x, walls[0].start.y);
                     for (let i = 1; i < walls.length; i++) {
                         s.lineTo(walls[i].start.x, walls[i].start.y);
                     }
                 }
                 return s;
             }, [walls])]} />
             <meshStandardMaterial color="#cbd5e1" transparent opacity={style.opacity} />
        </mesh>

        {/* Label */}
        {name && (
             <mesh position={[
                 // Centroid approximation
                 walls.reduce((acc, w) => acc + w.start.x, 0) / walls.length, 
                 ceilingHeight / 2, 
                 walls.reduce((acc, w) => acc + w.start.y, 0) / walls.length // Map 2D Y to 3D Z
            ]}>
                 <Html center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div className={`pointer-events-none select-none text-xs font-semibold text-slate-700 bg-white/50 px-1 rounded whitespace-nowrap border ${confidence < 0.6 ? 'border-dashed border-slate-400' : 'border-slate-200'}`}>
                        {name} {confidence < 0.6 ? '(Est.)' : ''}
                    </div>
                 </Html>
             </mesh>
        )}
    </group>
  );
};

