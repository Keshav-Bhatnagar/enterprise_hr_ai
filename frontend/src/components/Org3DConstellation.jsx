import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, ShieldAlert, Users, Layers, RotateCw, ZoomIn, Info } from 'lucide-react';

const DEPARTMENTS_3D = [
  { id: 'ai', name: 'AI Research', color: 0x38bdf8, headcount: 86, risk: 24, pos: [0, 1.8, 0], lead: 'Vikramaditya Rao' },
  { id: 'eng', name: 'Platform Engineering', color: 0x3b82f6, headcount: 412, risk: 42, pos: [2.2, 0.4, 1.0], lead: 'Christopher Benson' },
  { id: 'prod', name: 'Product Management', color: 0x8b5cf6, headcount: 140, risk: 18, pos: [-2.0, 0.2, 1.2], lead: 'Priya Sundaram' },
  { id: 'sales', name: 'Sales Engineering', color: 0xf59e0b, headcount: 195, risk: 36, pos: [1.4, -1.4, -1.2], lead: 'Ananya Deshmukh' },
  { id: 'exec', name: 'Executive Operations', color: 0x10b981, headcount: 48, risk: 6, pos: [-1.4, -1.2, -1.0], lead: 'Priya Sharma (CHRO)' }
];

export default function Org3DConstellation({ theme, onSelectDepartment }) {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(DEPARTMENTS_3D[1]);
  const [viewMode, setViewMode] = useState('risk'); // 'risk' | 'headcount'
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 6.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for entire constellation
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // 1. Central Core Node (NeMo Enterprise Hub)
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x60a5fa : 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    constellationGroup.add(coreMesh);

    // 2. Concentric Orbit Rings
    const ringGeo1 = new THREE.RingGeometry(2.4, 2.42, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x3f3f46 : 0xd4d4d8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.x = Math.PI / 2.3;
    constellationGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.2, 3.22, 64);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 5;
    constellationGroup.add(ring2);

    // 3. Department Nodes & Satellite Risk Particles
    const interactiveMeshes = [];

    DEPARTMENTS_3D.forEach((dept) => {
      // Dept Main Sphere
      const sphereGeo = new THREE.SphereGeometry(0.28, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: dept.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: dept.color,
        emissiveIntensity: 0.25
      });
      const deptMesh = new THREE.Mesh(sphereGeo, sphereMat);
      deptMesh.position.set(...dept.pos);
      deptMesh.userData = dept;
      constellationGroup.add(deptMesh);
      interactiveMeshes.push(deptMesh);

      // Connecting Beam to Core
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...dept.pos)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: dept.color,
        transparent: true,
        opacity: 0.3
      });
      const beam = new THREE.Line(lineGeo, lineMat);
      constellationGroup.add(beam);

      // Satellites representing high-risk individuals
      const satellitesCount = Math.max(3, Math.round(dept.risk / 8));
      for (let i = 0; i < satellitesCount; i++) {
        const satGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const satMat = new THREE.MeshBasicMaterial({
          color: dept.risk > 30 ? 0xf43f5e : 0xfbbf24,
          transparent: true,
          opacity: 0.9
        });
        const satMesh = new THREE.Mesh(satGeo, satMat);
        const angle = (i / satellitesCount) * Math.PI * 2;
        const radius = 0.55 + (i * 0.08);
        satMesh.position.set(
          dept.pos[0] + Math.cos(angle) * radius,
          dept.pos[1] + (Math.sin(angle) * 0.2),
          dept.pos[2] + Math.sin(angle) * radius
        );
        constellationGroup.add(satMesh);
      }
    });

    // 4. Background Starfield / Particle Cloud
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: theme === 'dark' ? 0x71717a : 0xa1a1aa,
      transparent: true,
      opacity: 0.6
    });
    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.8);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // Mouse Interaction / Orbit Dragging
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        constellationGroup.rotation.y += deltaX * 0.005;
        constellationGroup.rotation.x += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const hitDept = intersects[0].object.userData;
        setSelectedNode(hitDept);
        if (onSelectDepartment) onSelectDepartment(hitDept.name);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ambient rotation
      if (autoRotateRef.current && !isDragging) {
        constellationGroup.rotation.y += 0.003;
      }

      // Core pulsation
      coreMesh.rotation.y = elapsedTime * 0.4;
      coreMesh.rotation.x = elapsedTime * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);

      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-white/80 to-zinc-50 dark:from-[#0c0c0f] dark:to-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Controls (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">
            <Activity className="size-3.5" />
            <span>3D Org Constellation</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono pr-2">WebGL Engine</span>
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
          <button
            onClick={() => setViewMode('risk')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              viewMode === 'risk'
                ? 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Flight Risk Satellites
          </button>
          <button
            onClick={() => setViewMode('headcount')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              viewMode === 'headcount'
                ? 'bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Headcount Density
          </button>
        </div>
      </div>

      {/* Floating Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition flex items-center gap-1.5 shadow-sm ${
            autoRotate
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className={`size-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* Interactive 3D Node Telemetry Card (Bottom-Left) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: `#${selectedNode.color.toString(16).padStart(6, '0')}` }} />
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{selectedNode.name}</h4>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              Department Node
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Active Headcount</div>
              <div className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                {selectedNode.headcount} Team
              </div>
            </div>

            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Critical Flight Risk</div>
              <div className={`text-base font-black mt-0.5 tabular-nums ${
                selectedNode.risk > 30 ? 'text-rose-500' : 'text-amber-500'
              }`}>
                {selectedNode.risk} At-Risk
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex justify-between items-center">
            <span>Department Lead:</span>
            <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{selectedNode.lead}</strong>
          </div>

          <div className="text-[10px] text-zinc-400 italic">
            💡 Drag cursor to rotate in 3D • Click any orbital department node to inspect telemetry.
          </div>
        </div>
      )}

      {/* Instruction Badge (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-mono">
        <span>3D Orbital Controls: Rotate • Orbit • Inspect</span>
      </div>
    </div>
  );
}

