import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, RotateCw, Eye, AlertTriangle, UserCheck, ArrowUpRight } from 'lucide-react';

export default function Talent3DCube({ employees, onSelectEmployee, onOpenSimulator }) {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(employees[0] || null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;
  const cameraRef = useRef(null);
  const controlsRef = useRef({ isDragging: false, prevX: 0, prevY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.8, 6.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for the 3D prism & data points
    const prismGroup = new THREE.Group();
    scene.add(prismGroup);

    // 1. Volumetric 3D Grid Cube (Dimension 4 x 4 x 4 centered at origin)
    // Box dimensions: X (-2 to 2) = Perf (1 to 5), Y (-2 to 2) = Pot (1 to 5), Z (-2 to 2) = Risk (0% to 100%)
    const boxGeo = new THREE.BoxGeometry(4, 4, 4);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0xEDE7DC,
      transparent: true,
      opacity: 0.18
    });
    const boundingBox = new THREE.LineSegments(edgesGeo, boxMat);
    prismGroup.add(boundingBox);

    // 2. Axis Grid Lines
    const gridHelper = new THREE.GridHelper(4, 4, 0x3f3f46, 0x27272a);
    gridHelper.position.y = -2;
    prismGroup.add(gridHelper);

    // 3. Danger Zone 3D Translucent Plane (At Risk > 75%, Z > 1.0)
    const dangerPlaneGeo = new THREE.PlaneGeometry(4, 4);
    const dangerPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xE8913C,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const dangerPlane = new THREE.Mesh(dangerPlaneGeo, dangerPlaneMat);
    dangerPlane.position.z = 1.0; // Corresponds to > 75% flight risk
    prismGroup.add(dangerPlane);

    // Danger Plane Wireframe outline
    const dangerEdgeGeo = new THREE.EdgesGeometry(dangerPlaneGeo);
    const dangerEdgeMat = new THREE.LineBasicMaterial({ color: 0xE8913C, transparent: true, opacity: 0.45 });
    const dangerEdge = new THREE.LineSegments(dangerEdgeGeo, dangerEdgeMat);
    dangerEdge.position.z = 1.0;
    prismGroup.add(dangerEdge);

    // 4. Employee Nodes plotted in 3D Space
    const interactiveMeshes = [];

    // Coordinate mapping helper
    // perf (1 to 5) -> X (-1.8 to 1.8)
    // pot (1 to 5) -> Y (-1.8 to 1.8)
    // risk (0 to 1) -> Z (-1.8 to 1.8)
    const mapTo3D = (perf, pot, risk) => {
      const x = ((perf - 1) / 4) * 3.6 - 1.8;
      const y = ((pot - 1) / 4) * 3.6 - 1.8;
      const z = risk * 3.6 - 1.8;
      return [x, y, z];
    };

    employees.forEach((emp, i) => {
      const perf = emp.perf || 4.2;
      const pot = emp.pot || (emp.risk_tier === 'HIGH' ? 4.8 : 3.8);
      const risk = emp.attrition_probability || 0.75;
      const [x, y, z] = mapTo3D(perf, pot, risk);

      const isHighRisk = risk >= 0.75;
      const sphereGeo = new THREE.SphereGeometry(0.18, 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isHighRisk ? 0xE8913C : 0x2E6B72,
        roughness: 0.2,
        metalness: 0.8,
        emissive: isHighRisk ? 0xE8913C : 0x2E6B72,
        emissiveIntensity: 0.35
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(x, y, z);
      mesh.userData = { ...emp, perf, pot, risk, pos3D: [x, y, z] };
      prismGroup.add(mesh);
      interactiveMeshes.push(mesh);

      // Vertical drop line to floor grid for depth perception
      const dropLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x, -2, z)
      ]);
      const dropLineMat = new THREE.LineDashedMaterial({
        color: isHighRisk ? 0xE8913C : 0x2E6B72,
        dashSize: 0.1,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.25
      });
      const dropLine = new THREE.Line(dropLineGeo, dropLineMat);
      dropLine.computeLineDistances();
      prismGroup.add(dropLine);
    });

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xE8913C, 0.6);
    dirLight2.position.set(-5, -3, 4);
    scene.add(dirLight2);

    // Interaction handlers
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
        prismGroup.rotation.y += dx * 0.006;
        prismGroup.rotation.x += dy * 0.006;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onMouseUp = () => { isDragging = false; };

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

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize
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

    // Render loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotateRef.current && !isDragging) {
        prismGroup.rotation.y += 0.0035;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
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
      cameraRef.current.position.set(4.5, 3.8, 6.2);
    } else if (type === 'classic-9box') {
      cameraRef.current.position.set(0, 0, 7.5); // Looking flat at Perf (X) and Pot (Y)
    } else if (type === 'risk-profile') {
      cameraRef.current.position.set(7.5, 0, 0); // Looking at Pot (Y) and Risk (Z)
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD: Title & 3D Axes Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0A0C0E]/90 backdrop-blur-md border border-[rgba(237,231,220,0.13)] text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101317] border border-[rgba(237,231,220,0.1)] text-[#EDE7DC] font-mono text-[11px] font-bold">
            <Activity className="size-3.5 text-[#E8913C]" />
            <span>3D TALENT & RISK PRISM</span>
          </div>
          <span className="text-[10px] font-mono text-[#9EA5A8] pr-2">Perf (X) • Pot (Y) • Flight Risk (Z)</span>
        </div>

        {/* View Presets */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A0C0E]/90 backdrop-blur-md border border-[rgba(237,231,220,0.13)] text-xs">
          <button
            type="button"
            onClick={() => setCameraView('isometric')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-[#9EA5A8] hover:text-[#EDE7DC] transition"
          >
            Isometric 3D
          </button>
          <button
            type="button"
            onClick={() => setCameraView('classic-9box')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-[#9EA5A8] hover:text-[#EDE7DC] transition"
          >
            Classic 9-Box (Top)
          </button>
          <button
            type="button"
            onClick={() => setCameraView('risk-profile')}
            className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold text-[#9EA5A8] hover:text-[#EDE7DC] transition"
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
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md border transition flex items-center gap-1.5 ${
            autoRotate
              ? 'bg-[#101317] text-[#E8913C] border-[#E8913C]'
              : 'bg-[#0A0C0E]/80 border-[rgba(237,231,220,0.13)] text-[#9EA5A8]'
          }`}
        >
          <RotateCw className={`size-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* Bottom Left HUD: Spotlit Employee Coordinates */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full p-4 rounded-2xl bg-[#0A0C0E]/95 backdrop-blur-lg border border-[rgba(237,231,220,0.16)] shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(237,231,220,0.13)]">
            <div>
              <span className="font-mono text-[10px] text-[#E8913C] font-bold uppercase tracking-wider">
                COORDINATE SPOTLIGHT
              </span>
              <h4 className="font-display font-extrabold text-base text-[#EDE7DC] mt-0.5">
                {selectedNode.name}
              </h4>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
              selectedNode.risk >= 0.75 ? 'text-[#E8913C] border border-[#E8913C]/40' : 'text-[#2E6B72] border border-[#2E6B72]/40'
            }`}>
              {(selectedNode.risk * 100).toFixed(1)}% RISK (Z)
            </span>
          </div>

          <div className="text-[11px] text-[#9EA5A8]">
            {selectedNode.job_role} • <strong className="text-[#EDE7DC]">{selectedNode.department}</strong>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#101317] border border-[rgba(237,231,220,0.08)]">
              <div className="text-[9.5px] font-mono text-[#9EA5A8] uppercase">Performance (X)</div>
              <div className="text-sm font-bold text-[#EDE7DC] mt-0.5 tabular-nums">
                {selectedNode.perf || 4.2} / 5.0
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#101317] border border-[rgba(237,231,220,0.08)]">
              <div className="text-[9.5px] font-mono text-[#9EA5A8] uppercase">Potential (Y)</div>
              <div className="text-sm font-bold text-[#EDE7DC] mt-0.5 tabular-nums">
                {selectedNode.pot || 4.5} / 5.0
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#101317] border border-[rgba(237,231,220,0.08)]">
              <div className="text-[9.5px] font-mono text-[#9EA5A8] uppercase">Replacement Loss</div>
              <div className="text-sm font-bold text-[#E8913C] mt-0.5 tabular-nums">
                ₹{((selectedNode.monthly_salary * 18) / 100000).toFixed(1)}L
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onOpenSimulator && onOpenSimulator(selectedNode)}
              className="flex-1 py-2 rounded-xl bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[10.5px] font-bold tracking-wider uppercase transition flex items-center justify-center gap-1.5"
            >
              <span>Simulate Retention Package</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Legend */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-4 px-3 py-1.5 rounded-xl bg-[#0A0C0E]/80 backdrop-blur-md border border-[rgba(237,231,220,0.13)] text-[10.5px] font-mono text-[#9EA5A8]">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#E8913C]" />
          <span>High Flight Risk (&gt;75%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#2E6B72]" />
          <span>Stable Retention</span>
        </div>
      </div>
    </div>
  );
}

