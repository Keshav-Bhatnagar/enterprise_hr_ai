import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, RotateCw, Eye, AlertTriangle, UserCheck, ArrowUpRight } from 'lucide-react';

export default function Talent3DCube({ employees = [], onSelectEmployee, onOpenSimulator }) {
  const containerRef = useRef(null);
  const initialEmp = employees[0] || {
    name: 'Christopher Benson',
    job_role: 'Lead Platform Architect',
    department: 'Engineering',
    perf: 5.0,
    pot: 4.9,
    attrition_probability: 0.9948,
    monthly_salary: 115000
  };
  const [selectedNode, setSelectedNode] = useState(initialEmp);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;
  const cameraRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera centered on origin (0, 0, 0)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.8, 3.8, 5.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for the 3D prism & data points
    const prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // 2. High-Visibility Volumetric Bounding Box (Dimension 4 x 4 x 4 centered at origin)
    const boxGeo = new THREE.BoxGeometry(4, 4, 4);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0x38BDF8, // Vibrant Sky Blue
      transparent: true,
      opacity: 0.55
    });
    const boundingBox = new THREE.LineSegments(edgesGeo, boxMat);
    prismGroup.add(boundingBox);

    // 3. Grid Floor Helper (Elevated Contrast)
    const gridHelper = new THREE.GridHelper(4, 8, 0x38BDF8, 0x334155);
    gridHelper.position.y = -2;
    prismGroup.add(gridHelper);

    // 4. Danger Zone Translucent Plane (At Risk > 75%, Z > 1.0)
    const dangerPlaneGeo = new THREE.PlaneGeometry(4, 4);
    const dangerPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xF43F5E, // Vibrant Rose / Red
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const dangerPlane = new THREE.Mesh(dangerPlaneGeo, dangerPlaneMat);
    dangerPlane.position.z = 1.0;
    prismGroup.add(dangerPlane);

    // Danger Plane Wireframe outline
    const dangerEdgeGeo = new THREE.EdgesGeometry(dangerPlaneGeo);
    const dangerEdgeMat = new THREE.LineBasicMaterial({ color: 0xF43F5E, transparent: true, opacity: 0.65 });
    const dangerEdge = new THREE.LineSegments(dangerEdgeGeo, dangerEdgeMat);
    dangerEdge.position.z = 1.0;
    prismGroup.add(dangerEdge);

    // 5. Employee Nodes plotted in 3D Space
    const interactiveMeshes = [];

    const mapTo3D = (perf, pot, risk) => {
      const x = ((perf - 1) / 4) * 3.6 - 1.8;
      const y = ((pot - 1) / 4) * 3.6 - 1.8;
      const z = risk * 3.6 - 1.8;
      return [x, y, z];
    };

    employees.forEach((emp) => {
      const perf = emp.perf || 4.2;
      const pot = emp.pot || (emp.risk_tier === 'HIGH' ? 4.8 : 3.8);
      const risk = emp.attrition_probability || 0.75;
      const [x, y, z] = mapTo3D(perf, pot, risk);

      const isHighRisk = risk >= 0.75;
      const sphereGeo = new THREE.SphereGeometry(0.22, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isHighRisk ? 0xF43F5E : 0x10B981, // Coral Rose vs Emerald
        roughness: 0.15,
        metalness: 0.7,
        emissive: isHighRisk ? 0xF43F5E : 0x10B981,
        emissiveIntensity: 0.45
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(x, y, z);
      mesh.userData = { ...emp, perf, pot, risk, pos3D: [x, y, z] };
      prismGroup.add(mesh);
      interactiveMeshes.push(mesh);

      // Vertical drop line to floor grid for 3D depth perception
      const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, -2, z)
      ]);
      const dropLineMat = new THREE.LineDashedMaterial({
        color: isHighRisk ? 0xF43F5E : 0x10B981,
        dashSize: 0.12,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.45
      });
      const dropLine = new THREE.Line(dropLineGeo, dropLineMat);
      dropLine.computeLineDistances();
      prismGroup.add(dropLine);
    });

    // 6. Lighting for rich metallic sheen
    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0x38BDF8, 1.4);
    dirLight1.position.set(6, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xF43F5E, 0.9);
    dirLight2.position.set(-5, -3, 4);
    scene.add(dirLight2);

    // 7. Interaction Handlers
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prismGroup.rotation.y += dx * 0.007;
        prismGroup.rotation.x += dy * 0.007;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - prevX;
        const dy = e.touches[0].clientY - prevY;
        prismGroup.rotation.y += dx * 0.008;
        prismGroup.rotation.x += dy * 0.008;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => { isDragging = false; };

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(interactiveMeshes);
      if (hits.length > 0) {
        const clicked = hits[0].object.userData;
        setSelectedNode(clicked);
        if (onSelectEmployee) onSelectEmployee(clicked);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize handler & ResizeObserver
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Initial size alignment
    handleResize();

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotateRef.current && !isDragging) {
        prismGroup.rotation.y += 0.0035;
      }
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);

      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      boxGeo.dispose();
      edgesGeo.dispose();
      boxMat.dispose();
      dangerPlaneGeo.dispose();
      dangerPlaneMat.dispose();
      dangerEdgeGeo.dispose();
      dangerEdgeMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [employees]);

  // View preset angles
  const setCameraView = (type) => {
    if (!cameraRef.current) return;
    setAutoRotate(false);
    if (type === 'isometric') {
      cameraRef.current.position.set(4.8, 3.8, 5.8);
    } else if (type === 'classic-9box') {
      cameraRef.current.position.set(0, 0, 7.5);
    } else if (type === 'risk-profile') {
      cameraRef.current.position.set(7.5, 0, 0);
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Safe numerical risk calculation (Guarantees zero NaN)
  const nodeRisk = selectedNode
    ? (Number.isFinite(selectedNode.risk)
        ? selectedNode.risk
        : Number.isFinite(selectedNode.attrition_probability)
        ? selectedNode.attrition_probability
        : 0.75)
    : 0.75;

  return (
    <div
      className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-border-subtle shadow-2xl"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #0f172a 60%, #020617 100%)'
      }}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD: Title & 3D Axes Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-sky-400 font-mono text-[11px] font-bold">
            <Activity className="size-3.5 text-sky-400" />
            <span>3D TALENT & RISK PRISM</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 pr-2">Perf (X) • Pot (Y) • Flight Risk (Z)</span>
        </div>

        {/* View Presets */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setCameraView('isometric')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Isometric 3D
          </button>
          <button
            type="button"
            onClick={() => setCameraView('classic-9box')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Classic 9-Box (Top)
          </button>
          <button
            type="button"
            onClick={() => setCameraView('risk-profile')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Risk Profile (Side)
          </button>
        </div>
      </div>

      {/* Top Right: Rotation Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase transition border backdrop-blur-md ${
            autoRotate
              ? 'bg-slate-900/90 text-sky-400 border-sky-500/50 shadow-sm shadow-sky-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <RotateCw className={`size-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* Bottom Left HUD: Spotlit Employee Coordinates */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full p-4 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-slate-700/80 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                COORDINATE SPOTLIGHT
              </span>
              <h4 className="font-display font-extrabold text-base text-white mt-0.5">
                {selectedNode.name}
              </h4>
            </div>
            <span
              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                nodeRisk >= 0.75 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/40' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/40'
              }`}
            >
              {(nodeRisk * 100).toFixed(1)}% RISK (Z)
            </span>
          </div>

          <div className="text-[11px] text-slate-300">
            {selectedNode.job_role} • <strong className="text-white">{selectedNode.department}</strong>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <div className="text-[9.5px] font-mono text-slate-400 uppercase">Performance (X)</div>
              <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
                {selectedNode.perf || 4.2} / 5.0
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <div className="text-[9.5px] font-mono text-slate-400 uppercase">Potential (Y)</div>
              <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
                {selectedNode.pot || 4.5} / 5.0
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <div className="text-[9.5px] font-mono text-slate-400 uppercase">Replacement Loss</div>
              <div className="text-sm font-bold text-rose-400 mt-0.5 tabular-nums">
                ₹{((((selectedNode.monthly_salary || 115000) * 18) / 100000)).toFixed(1)}L
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => onOpenSimulator && onOpenSimulator(selectedNode)}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
            >
              <span>Simulate Retention Package</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Legend */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-[10.5px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
          <span>High Flight Risk (&gt;75%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          <span>Stable Retention</span>
        </div>
      </div>
    </div>
  );
}
