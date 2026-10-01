import React, { useEffect, useRef } from 'react';

interface InteractiveStarfieldProps {
  isWarping?: boolean;
  onWarpComplete?: () => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  origZ: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  color: string;
  vx: number;
  vy: number;
}

export default function InteractiveStarfield({
  isWarping = false,
  onWarpComplete,
}: InteractiveStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    let mouseX = width / 2;
    let mouseY = height / 2;

    const starCount = 380;
    const stars: Star[] = [];
    const colors = ['#00F5D4', '#38BDF8', '#FFB703', '#F43F5E', '#FFFFFF', '#A78BFA'];

    for (let i = 0; i < starCount; i++) {
      const z = Math.random() * 1000 + 1;
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z,
        origZ: z,
        radius: Math.random() * 1.6 + 0.6,
        baseRadius: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    let warpSpeed = 1.0;
    let warpTimer = 0;

    const render = () => {
      // Background clear with slight trail during warp
      if (isWarping) {
        ctx.fillStyle = 'rgba(5, 8, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);
        warpSpeed = Math.min(38, warpSpeed + 0.8);
        warpTimer++;

        if (warpTimer > 75 && onWarpComplete) {
          onWarpComplete();
          return;
        }
      } else {
        ctx.clearRect(0, 0, width, height);
        warpSpeed = 1.0;
        warpTimer = 0;
      }

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];

        if (isWarping) {
          // Accelerate stars toward camera in 3D
          const prevX = (star.x / star.z) * 350 + cx;
          const prevY = (star.y / star.z) * 350 + cy;

          star.z -= warpSpeed;
          if (star.z <= 0) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const curX = (star.x / star.z) * 350 + cx;
          const curY = (star.y / star.z) * 350 + cy;

          // Draw warp streak lines
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(curX, curY);
          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.min(3.5, (1000 - star.z) / 220);
          ctx.stroke();
        } else {
          // Gentle floating in 2D space
          star.x += star.vx;
          star.y += star.vy;

          if (star.x < -width / 2) star.x = width / 2;
          if (star.x > width / 2) star.x = -width / 2;
          if (star.y < -height / 2) star.y = height / 2;
          if (star.y > height / 2) star.y = -height / 2;

          const screenX = star.x + cx;
          const screenY = star.y + cy;

          // Mouse proximity glow
          const dx = screenX - mouseX;
          const dy = screenY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let currentRadius = star.baseRadius;
          let currentAlpha = star.alpha;

          if (dist < 130) {
            const factor = 1 - dist / 130;
            currentRadius = star.baseRadius + factor * 2.2;
            currentAlpha = Math.min(1, star.alpha + factor * 0.6);

            // Draw subtle constellation line to mouse
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(0, 245, 212, ${0.15 * factor})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(screenX, screenY, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [isWarping, onWarpComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
