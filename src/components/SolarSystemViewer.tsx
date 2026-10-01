import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanetId, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';
import { RotateCw, ZoomIn, Play, Pause, FastForward, Sparkles, Compass } from 'lucide-react';

interface SolarSystemViewerProps {
  onSelectPlanet: (planet: PlanetId) => void;
  language: Language;
}

interface PlanetConfig {
  id: string;
  nameEn: string;
  nameBn: string;
  symbol: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  color: string;
  descEn: string;
  descBn: string;
  hasRings?: boolean;
  isMissionTarget?: boolean;
  targetId?: PlanetId;
}

export default function SolarSystemViewer({ onSelectPlanet, language }: SolarSystemViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('sun');
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isDiving, setIsDiving] = useState(false);

  // Reference for camera focus animation
  const focusTargetRef = useRef<THREE.Vector3 | null>(null);
  const simSpeedRef = useRef<number>(1);
  simSpeedRef.current = simSpeed;

  const planetsList: PlanetConfig[] = [
    {
      id: 'sun',
      nameEn: 'The Sun',
      nameBn: 'সূর্য',
      symbol: '☀️',
      radius: 12,
      orbitRadius: 0,
      orbitSpeed: 0,
      rotationSpeed: 0.002,
      color: '#FFB703',
      descEn: 'The blazing heart of our solar system, powering life across space.',
      descBn: 'আমাদের সৌরজগতের প্রাণকেন্দ্র, যার আলো ও তাপে পুরো জগত সচল।',
    },
    {
      id: 'mercury',
      nameEn: 'Mercury',
      nameBn: 'বুধ',
      symbol: '☿',
      radius: 2.2,
      orbitRadius: 26,
      orbitSpeed: 0.016,
      rotationSpeed: 0.008,
      color: '#9E9E9E',
      descEn: 'Innermost rocky world with extreme temperatures and craters.',
      descBn: 'সূর্যের সবচেয়ে কাছের ধূসর পাথুরে গ্রহ, তীব্র উত্তাপ ও শীতলতার জগত।',
    },
    {
      id: 'venus',
      nameEn: 'Venus',
      nameBn: 'শুক্র',
      symbol: '♀',
      radius: 3.8,
      orbitRadius: 40,
      orbitSpeed: 0.012,
      rotationSpeed: 0.004,
      color: '#E0A96D',
      descEn: 'Shining golden evening star shrouded in thick volcanic atmosphere.',
      descBn: 'ঘন মেঘে ঢাকা সোনালি গ্রহ, সৌরজগতের সবচেয়ে উত্তপ্ত পৃষ্ঠ।',
    },
    {
      id: 'earth',
      nameEn: 'Earth',
      nameBn: 'পৃথিবী',
      symbol: '🌍',
      radius: 4.2,
      orbitRadius: 58,
      orbitSpeed: 0.009,
      rotationSpeed: 0.015,
      color: '#2196F3',
      descEn: 'Our vibrant blue home world, sheltered by liquid oceans and clouds.',
      descBn: 'আমাদের নীল গ্রহ, প্রাণের স্পন্দন ও মহাসাগরে আবৃত স্বর্গ।',
    },
    {
      id: 'moon',
      nameEn: 'The Moon',
      nameBn: 'চাঁদ',
      symbol: '🌕',
      radius: 1.6,
      orbitRadius: 65, // Relative display in toolbar
      orbitSpeed: 0.025,
      rotationSpeed: 0.01,
      color: '#ECEFF1',
      descEn: 'Earth’s faithful companion, resting site of Apollo 11 & Surveyor.',
      descBn: 'অ্যাপোলো ১১ ও সার্ভেয়ারের পদচিহ্নবাহী রূপালি উপগ্রহ।',
      isMissionTarget: true,
      targetId: 'moon',
    },
    {
      id: 'mars',
      nameEn: 'Mars',
      nameBn: 'মঙ্গল',
      symbol: '♂',
      radius: 3.2,
      orbitRadius: 82,
      orbitSpeed: 0.007,
      rotationSpeed: 0.014,
      color: '#E64A19',
      descEn: 'The silent Red Planet, where Opportunity, Spirit & InSight rest.',
      descBn: 'ধূলিঝড়ে ঘুমিয়ে থাকা অপরচুনিটি ও ইনসাইট রোভারদের লাল গ্রহ।',
      isMissionTarget: true,
      targetId: 'mars',
    },
    {
      id: 'jupiter',
      nameEn: 'Jupiter',
      nameBn: 'বৃহস্পতি',
      symbol: '♃',
      radius: 8.5,
      orbitRadius: 118,
      orbitSpeed: 0.004,
      rotationSpeed: 0.02,
      color: '#D4A373',
      descEn: 'Colossal gas giant with swirling atmospheric bands & Great Red Spot.',
      descBn: 'সৌরজগতের বৃহত্তম গ্রহ, যার বুকে শত শত বছরের লাল ঝড় ঘূর্ণায়মান।',
    },
    {
      id: 'saturn',
      nameEn: 'Saturn',
      nameBn: 'শনি',
      symbol: '♄',
      radius: 7.2,
      orbitRadius: 154,
      orbitSpeed: 0.0028,
      rotationSpeed: 0.018,
      color: '#E9C46A',
      hasRings: true,
      descEn: 'The jewel of the solar system, surrounded by spectacular ice rings.',
      descBn: 'বরফ ও ধূলিকণার অনিন্দ্যসুন্দর বলয়ে ঘেরা এক অপূর্ব মহাজাগতিক বিস্ময়।',
    },
    {
      id: 'uranus',
      nameEn: 'Uranus',
      nameBn: 'ইউরেনাস',
      symbol: '♅',
      radius: 5.2,
      orbitRadius: 190,
      orbitSpeed: 0.002,
      rotationSpeed: 0.012,
      color: '#48CAE4',
      descEn: 'Tilted icy cyan giant rotating on its side in frozen isolation.',
      descBn: 'নীলচে-সবুজ বরফে আচ্ছাদিত গ্রহ, যা হেলে হেলে আবর্তন করে।',
    },
    {
      id: 'neptune',
      nameEn: 'Neptune',
      nameBn: 'নেপচুন',
      symbol: '♆',
      radius: 5.0,
      orbitRadius: 225,
      orbitSpeed: 0.0015,
      rotationSpeed: 0.013,
      color: '#023E8A',
      descEn: 'Deep azure blue world of supersonic winds on the outer frontier.',
      descBn: 'সৌরজগতের দূরতম নীল গ্রহ, প্রবল গতিসম্পন্ন মহাজাগতিক ঝড়ের রাজ্য।',
    },
  ];

  // Procedural canvas textures
  const createSunTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#FFD166');
    grad.addColorStop(0.3, '#FF8500');
    grad.addColorStop(0.7, '#FF3F00');
    grad.addColorStop(1, '#FFB703');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 220, 0.45)' : 'rgba(220, 60, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 9 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  };

  const createEarthTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#082545';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#1e7c3b';
    for (let i = 0; i < 55; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 80 + 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#d4a373';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 45 + 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 35);
    ctx.fillRect(0, 477, 1024, 35);
    return new THREE.CanvasTexture(canvas);
  };

  const createMarsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#c1440e';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#6e1d08';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 65 + 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e76f51';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 50 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1024, 25);
    ctx.fillRect(0, 487, 1024, 25);
    return new THREE.CanvasTexture(canvas);
  };

  const createJupiterTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(0, 0, 1024, 512);

    const bands = [
      '#e0a96d', '#8b5a2b', '#c68b59', '#633917', '#e7bc91', '#b07d62', '#8b5a2b', '#d4a373'
    ];
    for (let i = 0; i < 512; i += 18) {
      ctx.fillStyle = bands[Math.floor(i / 64) % bands.length];
      ctx.fillRect(0, i, 1024, 18);
    }
    // Great Red Spot
    ctx.fillStyle = '#b7094c';
    ctx.beginPath();
    ctx.ellipse(650, 320, 75, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  };

  const createSaturnRingsTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, 'rgba(233, 196, 106, 0)');
    grad.addColorStop(0.2, 'rgba(233, 196, 106, 0.85)');
    grad.addColorStop(0.48, 'rgba(180, 140, 80, 0.7)');
    grad.addColorStop(0.52, 'rgba(0, 0, 0, 0.1)'); // Cassini division gap
    grad.addColorStop(0.56, 'rgba(233, 196, 106, 0.9)');
    grad.addColorStop(0.85, 'rgba(244, 226, 169, 0.6)');
    grad.addColorStop(1, 'rgba(233, 196, 106, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 64);
    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060914, 0.001);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 65, 140);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Dynamic Deep Space Starfield Background
    const starCount = 3000;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 600 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorVal = Math.random();
      if (colorVal > 0.8) {
        starColors[i * 3] = 0.5; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0;
      } else if (colorVal > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 0.5;
      } else {
        starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0;
      }
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // Ambient & Central Point Light (Illuminates day/night on all planets)
    const ambientLight = new THREE.AmbientLight(0x223048, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xfff5d0, 4.0, 1400, 0.45);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 1. Central Blazing Sun
    const sunGeom = new THREE.SphereGeometry(12, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ map: createSunTexture() });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.userData = { id: 'sun', name: 'The Sun' };
    scene.add(sunMesh);

    // Sun Corona Glow
    const coronaGeom = new THREE.SphereGeometry(14.8, 36, 36);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(1.0, 0.65, 0.15, 1.0) * intensity * 1.6;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    scene.add(coronaMesh);

    // Planet Meshes and Pivots Dictionary
    const planetMeshes: Record<string, THREE.Mesh> = { sun: sunMesh };
    const planetPivots: Record<string, THREE.Group> = {};
    const orbitSpeeds: Record<string, number> = {};
    const rotSpeeds: Record<string, number> = {};

    // Orbit Path Line Generator
    const createOrbitRing = (radius: number, colorHex: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(140);
      const geom = new THREE.BufferGeometry().setFromPoints(
        points.map((p) => new THREE.Vector3(p.x, 0, p.y))
      );
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.28,
      });
      return new THREE.Line(geom, mat);
    };

    // Instantiate all solar planets
    planetsList.forEach((p) => {
      if (p.id === 'sun' || p.id === 'moon') return;

      const pivot = new THREE.Group();
      scene.add(pivot);
      planetPivots[p.id] = pivot;
      orbitSpeeds[p.id] = p.orbitSpeed;
      rotSpeeds[p.id] = p.rotationSpeed;

      // Orbit Ring
      scene.add(createOrbitRing(p.orbitRadius, parseInt(p.color.replace('#', '0x'))));

      let texture: THREE.Texture;
      if (p.id === 'earth') texture = createEarthTexture();
      else if (p.id === 'mars') texture = createMarsTexture();
      else if (p.id === 'jupiter') texture = createJupiterTexture();
      else {
        // Procedural gradient for other planets
        const c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = p.color;
        ctx.fillRect(0, 0, 512, 256);
        texture = new THREE.CanvasTexture(c);
      }

      const geom = new THREE.SphereGeometry(p.radius, 48, 48);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.x = p.orbitRadius;
      mesh.userData = { id: p.id, name: p.nameEn };
      pivot.add(mesh);
      planetMeshes[p.id] = mesh;

      // Add Saturn Rings
      if (p.hasRings) {
        const ringGeom = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.4, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          map: createSaturnRingsTexture(),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.35;
        mesh.add(ringMesh);
      }
    });

    // Sub-orbit for The Moon around Earth
    const earthMesh = planetMeshes['earth'];
    const moonPivot = new THREE.Group();
    earthMesh.add(moonPivot);

    const moonGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.9,
    });
    const moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.position.x = 8.5;
    moonMesh.userData = { id: 'moon', name: 'The Moon' };
    moonPivot.add(moonMesh);
    planetMeshes['moon'] = moonMesh;

    // Sub-orbit line for Moon
    const moonOrbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.EllipseCurve(0, 0, 8.5, 8.5, 0, 2 * Math.PI, false, 0)
          .getPoints(60)
          .map((p) => new THREE.Vector3(p.x, 0, p.y))
      ),
      new THREE.LineBasicMaterial({ color: 0x90caf9, transparent: true, opacity: 0.4 })
    );
    earthMesh.add(moonOrbitLine);

    // Asteroid Belt between Mars & Jupiter (300 particles)
    const asteroidCount = 400;
    const asteroidGeom = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i++) {
      const r = 96 + Math.random() * 16;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 6;
      asteroidPos[i * 3] = r * Math.cos(angle);
      asteroidPos[i * 3 + 1] = height;
      asteroidPos[i * 3 + 2] = r * Math.sin(angle);
    }
    asteroidGeom.setAttribute('position', new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({
      color: 0x8d99ae,
      size: 1.5,
      transparent: true,
      opacity: 0.7,
    });
    const asteroidBelt = new THREE.Points(asteroidGeom, asteroidMat);
    scene.add(asteroidBelt);

    // Mouse Drag, Pan & Wheel Zoom Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cameraAngleY = 0;
    let cameraAngleX = 0.35;
    let cameraDistance = 140;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        cameraAngleY += deltaX * 0.005;
        cameraAngleX += deltaY * 0.005;
        cameraAngleX = Math.max(-0.6, Math.min(1.25, cameraAngleX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance += e.deltaY * 0.08;
      cameraDistance = Math.max(35, Math.min(380, cameraDistance));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        cameraAngleY += deltaX * 0.006;
        cameraAngleX += deltaY * 0.006;
        cameraAngleX = Math.max(-0.6, Math.min(1.25, cameraAngleX));
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const speedMult = simSpeedRef.current;

      // Sun self-spin
      sunMesh.rotation.y += 0.002 * speedMult;
      asteroidBelt.rotation.y += 0.0008 * speedMult;

      // Revolve planets
      Object.keys(planetPivots).forEach((key) => {
        planetPivots[key].rotation.y += orbitSpeeds[key] * speedMult;
        planetMeshes[key].rotation.y += rotSpeeds[key] * speedMult;
      });

      // Moon orbit
      moonPivot.rotation.y += 0.02 * speedMult;

      // Camera positioning / tracking target
      if (!isDiving) {
        let centerPoint = new THREE.Vector3(0, 0, 0);
        if (selectedPlanetKey && selectedPlanetKey !== 'sun') {
          const targetMesh = planetMeshes[selectedPlanetKey];
          if (targetMesh) {
            targetMesh.getWorldPosition(centerPoint);
          }
        }

        const cx = centerPoint.x + Math.sin(cameraAngleY) * cameraDistance * Math.cos(cameraAngleX);
        const cz = centerPoint.z + Math.cos(cameraAngleY) * cameraDistance * Math.cos(cameraAngleX);
        const cy = centerPoint.y + 35 + Math.sin(cameraAngleX) * (cameraDistance * 0.65);

        camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.05);
        camera.lookAt(centerPoint);
      }

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
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleSelectKey = (key: string) => {
    soundEffects.playClick();
    setSelectedPlanetKey(key);
  };

  const handleInitiateMission = (planetId: PlanetId) => {
    soundEffects.playWarp();
    setIsDiving(true);
    setTimeout(() => {
      onSelectPlanet(planetId);
    }, 1800);
  };

  const currentPlanetData =
    planetsList.find((p) => p.id === selectedPlanetKey) || planetsList[0];

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#060914] select-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top HUD Status Card */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none">
        <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-cyan-400/40 shadow-xl backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
              {language === 'bn' ? '3D সোলার সিস্টেম • লাইভ সিমুলেশন' : '3D Solar System • Live Simulation'}
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white font-space">
              {language === 'bn' ? 'সম্পূর্ণ গ্রহজগৎ পরিদর্শন করুন' : 'Interactive Celestial Explorer'}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Speed Controls (Top Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-1.5 glass-panel p-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-md">
        <button
          onClick={() => setSimSpeed(simSpeed === 0 ? 1 : 0)}
          className={`p-2 rounded-xl text-xs font-bold transition-all ${
            simSpeed === 0
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={simSpeed === 0 ? 'চালু করুন' : 'পজ করুন'}
        >
          {simSpeed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setSimSpeed(1)}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
            simSpeed === 1
              ? 'bg-cyan-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          1x
        </button>
        <button
          onClick={() => setSimSpeed(3)}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
            simSpeed === 3
              ? 'bg-cyan-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          3x
        </button>
        <button
          onClick={() => setSimSpeed(6)}
          className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
            simSpeed === 6
              ? 'bg-cyan-400 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          6x
        </button>
      </div>

      {/* Selected Planet HUD Card (Top Center) */}
      <div className="absolute top-18 sm:top-20 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-md pointer-events-none">
        <div className="glass-panel p-4 rounded-3xl border border-cyan-400/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(0,245,212,0.4)]">
              {currentPlanetData.symbol}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-space">
                  {language === 'bn' ? currentPlanetData.nameBn : currentPlanetData.nameEn}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold">
                  {currentPlanetData.orbitRadius === 0
                    ? language === 'bn'
                      ? 'কেন্দ্র'
                      : 'Center'
                    : `${currentPlanetData.orbitRadius} AU (rel)`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-2">
                {language === 'bn' ? currentPlanetData.descBn : currentPlanetData.descEn}
              </p>
            </div>
          </div>

          {/* If Moon or Mars: Quick Dive Action Button */}
          {currentPlanetData.isMissionTarget && (
            <button
              onClick={() => handleInitiateMission(currentPlanetData.targetId!)}
              className="pointer-events-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀</span>
              <span>{language === 'bn' ? 'অবতরণ করুন' : 'Land Here'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Warp Dive Cinematic Banner */}
      {isDiving && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/50 backdrop-blur-sm pointer-events-none animate-pulse">
          <div className="text-cyan-300 font-mono text-sm tracking-widest uppercase mb-2">
            {language === 'bn' ? 'হাইপারড্রাইভ সক্রিয় হচ্ছে...' : 'Warp Descent Engaged...'}
          </div>
          <div className="text-2xl sm:text-4xl font-black text-white tracking-wider font-space">
            {language === 'bn'
              ? `${
                  currentPlanetData.id === 'moon' ? 'চন্দ্র' : 'মঙ্গল'
                } পৃষ্ঠের প্রত্নতাত্ত্বিক সাইটে নামছি...`
              : `Descending to ${currentPlanetData.nameEn} Archaeological Sites...`}
          </div>
        </div>
      )}

      {/* Bottom Planet Selector Toolbar (ASMR Coding Video Style) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-3xl">
        <div className="glass-panel p-2 rounded-3xl border border-cyan-400/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {planetsList.map((p) => {
            const isSelected = selectedPlanetKey === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectKey(p.id)}
                className={`flex-1 min-w-[55px] sm:min-w-[65px] py-2 px-1 rounded-2xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-400/30 to-cyan-500/10 border border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 border border-transparent'
                }`}
              >
                <span className="text-xl sm:text-2xl">{p.symbol}</span>
                <span className="text-[10px] sm:text-[11px] font-bold font-space truncate w-full text-center">
                  {language === 'bn' ? p.nameBn : p.nameEn}
                </span>
                {p.isMissionTarget && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
