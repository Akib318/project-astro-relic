import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetId, Language } from '../types';
import { RELICS_DATA } from '../data/relicsData';
import { soundEffects } from '../utils/soundEffects';
import { ArrowLeft, Radio, Compass, Sparkles, MapPin } from 'lucide-react';

interface PlanetarySurfaceViewerProps {
  planet: PlanetId;
  onBackToOrbit: () => void;
  onSelectRelic: (relicId: string) => void;
  language: Language;
}

export default function PlanetarySurfaceViewer({
  planet,
  onBackToOrbit,
  onSelectRelic,
  language,
}: PlanetarySurfaceViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRelicId, setHoveredRelicId] = useState<string | null>(null);

  // Filter relics situated on this planet
  const planetRelics = Object.values(RELICS_DATA).filter((r) => r.planet === planet);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const isMars = planet === 'mars';
    const fogColor = isMars ? 0x240d07 : 0x05070f;
    scene.fog = new THREE.FogExp2(fogColor, 0.0035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 48);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(isMars ? 0x6e2c1a : 0x223344, 1.4);
    scene.add(ambientLight);

    const sunDir = new THREE.DirectionalLight(isMars ? 0xffccaa : 0xffffff, 2.5);
    sunDir.position.set(30, 40, 20);
    scene.add(sunDir);

    // Procedural Mountain/Crater Terrain Plane
    const terrainGeom = new THREE.PlaneGeometry(160, 160, 64, 64);
    terrainGeom.rotateX(-Math.PI / 2);

    const posAttr = terrainGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Gentle rolling dunes and crater impressions
      const y =
        Math.sin(x * 0.06) * Math.cos(z * 0.06) * 4.5 +
        Math.sin(x * 0.15 + z * 0.1) * 1.5;
      posAttr.setY(i, y);
    }
    terrainGeom.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: isMars ? 0xa83a15 : 0x5a6578,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.position.y = -2;
    scene.add(terrainMesh);

    // Scattered boulders and rocks
    const rockGeom = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: isMars ? 0x5a1805 : 0x3d434f,
      roughness: 0.95,
    });
    for (let i = 0; i < 40; i++) {
      const rock = new THREE.Mesh(rockGeom, rockMat);
      const rx = (Math.random() - 0.5) * 110;
      const rz = (Math.random() - 0.5) * 110;
      const s = Math.random() * 1.4 + 0.4;
      rock.scale.set(s, s * 0.7, s);
      rock.position.set(rx, 0, rz);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(rock);
    }

    // Atmospheric Stardust / Sand Drift Particles
    const dustCount = 350;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 140;
      dustPositions[i * 3 + 1] = Math.random() * 35;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isMars ? 0xff8c42 : 0x90e0ef,
      size: 1.2,
      transparent: true,
      opacity: 0.6,
    });
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // Camera rotation drag controls
    let isDragging = false;
    let prevMouseX = 0;
    let cameraAngleY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        cameraAngleY += deltaX * 0.004;
        prevMouseX = e.clientX;
      }
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      // Atmospheric particles subtle drifting
      const positions = dustGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        positions[i * 3] += (isMars ? 0.08 : 0.02);
        if (positions[i * 3] > 70) positions[i * 3] = -70;
      }
      dustGeom.attributes.position.needsUpdate = true;

      // Camera panning
      camera.position.x = Math.sin(cameraAngleY) * 48;
      camera.position.z = Math.cos(cameraAngleY) * 48;
      camera.lookAt(0, 4, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [planet]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#070b19] select-none">
      {/* 3D Surface Canvas */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Left Navigation Bar */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBackToOrbit();
          }}
          className="px-3.5 py-2.5 rounded-2xl glass-panel hover:bg-slate-800/80 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'সোলার সিস্টেমে ফিরুন' : 'Back to Orbit'}</span>
        </button>

        <div className="glass-panel px-4 py-2.5 rounded-2xl border border-slate-700 shadow-xl hidden sm:flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white font-space">
            {planet === 'mars'
              ? language === 'bn'
                ? 'মঙ্গল গ্রহের সারফেস • ঐতিহাসিক ল্যান্ডিং সাইট'
                : 'Mars Surface • Archaeological Landing Sites'
              : language === 'bn'
              ? 'চাঁদের রূপালি সারফেস • ঐতিহাসিক ল্যান্ডিং সাইট'
              : 'Lunar Surface • Archaeological Landing Sites'}
          </span>
        </div>
      </div>

      {/* Relic Archaeological Radio Beacon Cards (Bottom Overlay) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-4xl">
        <div className="text-center mb-2">
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30">
            {language === 'bn'
              ? 'নিচের যেকোনো রোভারে ক্লিক করে ভেতরে প্রবেশ করুন'
              : 'Select a relic beacon below to awaken & inspect'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {planetRelics.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectRelic(r.id)}
              onMouseEnter={() => setHoveredRelicId(r.id)}
              onMouseLeave={() => setHoveredRelicId(null)}
              className="glass-panel p-4 rounded-3xl border-2 border-slate-700/80 hover:border-cyan-400 transition-all cursor-pointer group shadow-2xl hover:scale-102 active:scale-98 bg-[#091124]/90 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 font-bold">
                    {r.codeName}
                  </span>
                </div>
                <Radio className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white font-space group-hover:text-cyan-300 transition-colors">
                {language === 'bn' ? r.nameBn : r.name}
              </h3>

              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {language === 'bn' ? r.heroicStoryBn : r.heroicStory}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-amber-300">
                <span>{language === 'bn' ? r.landingDateBn : r.landingDate}</span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  {language === 'bn' ? 'জাগিয়ে তুলুন →' : 'Awaken →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
