import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, ArrowUpRight, Grid3X3, Eye, Compass } from 'lucide-react';
import { RiskBadge, Button } from './primitives';

// 3D coordinate mapping: Perf (X), Potential (Y), Flight Risk (Z)
function mapTo3D(perf, pot, risk) {
  const x = ((perf - 1) / 4) * 3.6 - 1.8;
  const y = ((pot - 1) / 4) * 3.6 - 1.8;
  const z = risk * 3.6 - 1.8;
  return [x, y, z];
}

// Camera controller component inside Canvas
function CameraController({ cameraView }) {
  const { camera } = useThree();

  React.useEffect(() => {
    if (cameraView === 'classic-9box') {
      camera.position.set(0, 7.2, 0.01);
      camera.up.set(0, 0, -1);
    } else if (cameraView === 'risk-profile') {
      camera.position.set(7.5, 0, 0);
      camera.up.set(0, 1, 0);
    } else {
      // Default: Isometric 3D
      camera.position.set(4.8, 3.8, 5.8);
      camera.up.set(0, 1, 0);
    }
    camera.lookAt(0, 0, 0);
  }, [cameraView, camera]);

  return null;
}

function PrismScene({ employees, onSelectEmployee, hoveredEmp, setHoveredEmp, cameraView }) {
  const controlsRef = useRef();
  const groupRef = useRef();

  // Theme-safe contrast colors
  const colors = useMemo(() => {
    return {
      high: '#E11D48',
      medium: '#D97706',
      low: '#059669',
      border: '#38BDF8',
      grid: '#475569',
      dangerPlane: '#F43F5E'
    };
  }, []);

  return (
    <>
      <CameraController cameraView={cameraView} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 8, 6]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-6, -4, -4]} intensity={0.8} color="#38bdf8" />

      {/* Static Group without any continuous auto-rotation */}
      <group ref={groupRef}>
        {/* 1. Volumetric 4x4x4 Bounding Wireframe Cube */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(4, 4, 4)]} />
          <lineBasicMaterial color={colors.border} transparent opacity={0.4} />
        </lineSegments>

        {/* 2. Floor Grid */}
        <gridHelper args={[4, 8, colors.border, colors.grid]} position={[0, -2, 0]} />

        {/* 3. Translucent Danger Zone Plane (Z = 1.0 for Risk > 75%) */}
        <mesh position={[0, 0, 1.0]}>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial color={colors.dangerPlane} transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments position={[0, 0, 1.0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(4, 4)]} />
          <lineBasicMaterial color={colors.dangerPlane} transparent opacity={0.5} />
        </lineSegments>

        {/* 4. Axis Ticks & Labels */}
        <Text position={[2.2, -1.9, 0]} fontSize={0.16} color="#94A3B8" anchorX="left">
          Perf (X) &rarr;
        </Text>
        <Text position={[-1.9, 2.2, 0]} fontSize={0.16} color="#94A3B8" anchorY="bottom">
          &uarr; Pot (Y)
        </Text>
        <Text position={[0, -1.9, 2.2]} fontSize={0.16} color="#F43F5E" anchorX="center">
          Flight Risk (Z) &rarr;
        </Text>

        {/* 5. Employee Nodes plotted in 3D Space */}
        {employees.map((emp) => {
          const perf = emp.perf || 4.2;
          const pot = emp.pot || 4.5;
          const risk = emp.attrition_probability || 0.75;
          const [x, y, z] = mapTo3D(perf, pot, risk);
          const isHigh = risk >= 0.75;
          const isMedium = risk >= 0.4 && risk < 0.75;
          const nodeColor = isHigh ? colors.high : isMedium ? colors.medium : colors.low;
          const isHovered = hoveredEmp?.global_id === emp.global_id;

          return (
            <group key={emp.global_id}>
              {/* Drop line to floor */}
              <line>
                <bufferGeometry
                  attach="geometry"
                  onUpdate={(self) =>
                    self.setFromPoints([new THREE.Vector3(x, y, z), new THREE.Vector3(x, -2, z)])
                  }
                />
                <lineBasicMaterial color={nodeColor} transparent opacity={0.35} />
              </line>

              {/* Sphere Node */}
              <mesh
                position={[x, y, z]}
                scale={isHovered ? 1.3 : 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEmployee && onSelectEmployee(emp);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredEmp(emp);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredEmp((prev) => (prev?.global_id === emp.global_id ? null : prev));
                }}
              >
                <sphereGeometry args={[0.18, 20, 20]} />
                <meshStandardMaterial
                  color={nodeColor}
                  metalness={0.6}
                  roughness={0.2}
                  emissive={nodeColor}
                  emissiveIntensity={isHovered ? 0.6 : 0.3}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* OrbitControls: smooth damping, user manual control only (no auto-spin) */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={14}
        makeDefault
      />
    </>
  );
}

export function TalentPrism3D({ employees = [], onSelectEmployee }) {
  const [hoveredEmp, setHoveredEmp] = useState(null);
  const [cameraView, setCameraView] = useState('isometric'); // 'isometric' | 'classic-9box' | 'risk-profile'

  return (
    <div className="relative w-full h-[540px] rounded-enterprise border border-border-strong bg-slate-950 overflow-hidden shadow-card">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [4.8, 3.8, 5.8], fov: 45 }}
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <PrismScene
            employees={employees}
            onSelectEmployee={onSelectEmployee}
            hoveredEmp={hoveredEmp}
            setHoveredEmp={setHoveredEmp}
            cameraView={cameraView}
          />
        </Suspense>
      </Canvas>

      {/* Top Left HUD: Title & 3D Axes Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 p-1.5 rounded-enterprise bg-card border border-border-strong text-xs font-mono shadow-md">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-accent font-bold">
            <Activity className="size-3.5" />
            <span>3D TALENT PRISM</span>
          </div>
          <span className="text-[10.5px] text-text-muted pr-2">Perf (X) • Pot (Y) • Flight Risk (Z)</span>
        </div>
      </div>

      {/* Top Right HUD: Perspective View Switcher (Static, Clean Presets - NO Dumb Auto-Rotation) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <div className="inline-flex p-1 rounded-enterprise bg-card border border-border-strong shadow-md text-xs font-mono">
          <button
            type="button"
            onClick={() => setCameraView('isometric')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              cameraView === 'isometric'
                ? 'bg-accent text-accent-fg font-bold shadow-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Compass className="size-3.5" />
            <span>Isometric</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraView('classic-9box')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              cameraView === 'classic-9box'
                ? 'bg-accent text-accent-fg font-bold shadow-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Grid3X3 className="size-3.5" />
            <span>Top (9-Box)</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraView('risk-profile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              cameraView === 'risk-profile'
                ? 'bg-accent text-accent-fg font-bold shadow-subtle'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Eye className="size-3.5" />
            <span>Side (Risk)</span>
          </button>
        </div>
      </div>

      {/* Bottom Left HUD: Hover Tooltip Overlay (DOM overlay) */}
      {hoveredEmp && (
        <div className="absolute bottom-4 left-4 z-10 max-w-xs w-full p-4 rounded-enterprise bg-card border border-border-strong shadow-2xl text-xs font-mono space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
            <span className="font-bold text-text-primary text-sm truncate">{hoveredEmp.name}</span>
            <RiskBadge
              status={hoveredEmp.attrition_probability >= 0.75 ? 'HIGH' : 'LOW'}
              label={`${(hoveredEmp.attrition_probability * 100).toFixed(0)}%`}
              size="xs"
            />
          </div>
          <div className="text-[11px] text-text-secondary truncate">
            {hoveredEmp.job_role} • {hoveredEmp.department}
          </div>
          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-1.5 rounded bg-muted border border-border-subtle">
              <span className="text-[9px] text-text-muted block uppercase">Perf (X)</span>
              <span className="font-bold text-text-primary">{hoveredEmp.perf || 4.2}</span>
            </div>
            <div className="p-1.5 rounded bg-muted border border-border-subtle">
              <span className="text-[9px] text-text-muted block uppercase">Pot (Y)</span>
              <span className="font-bold text-text-primary">{hoveredEmp.pot || 4.5}</span>
            </div>
          </div>
          <div className="pt-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-[11px]"
              rightIcon={ArrowUpRight}
              onClick={() => onSelectEmployee && onSelectEmployee(hoveredEmp)}
            >
              Inspect in Detail Drawer
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Right HUD: Legend */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-enterprise bg-card border border-border-strong text-[11px] font-mono text-text-secondary shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-danger" />
          <span>Flight Danger (&gt;75%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-success" />
          <span>Stable</span>
        </div>
      </div>
    </div>
  );
}

export default TalentPrism3D;
