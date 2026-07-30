import { useEffect, useRef } from 'react';

interface MatrixGlobeProps {
  isProcessing?: boolean;
  isListening?: boolean;
  size?: number;
}

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function MatrixGlobe({ isProcessing = false, isListening = false, size = 400 }: MatrixGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    char: string;
    speed: number;
    brightness: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    // Initialize particles on sphere surface
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        particlesRef.current.push({
          x: theta,
          y: phi,
          z: Math.random() * 0.5,
          char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
          speed: 0.002 + Math.random() * 0.004,
          brightness: 0.5 + Math.random() * 0.5,
        });
      }
    }

    let rotation = 0;
    let pulsePhase = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, size, size);

      const rotationSpeed = isProcessing ? 0.015 : 0.005;
      rotation += rotationSpeed;
      pulsePhase += isProcessing ? 0.08 : 0.02;

      const pulseScale = isProcessing 
        ? 1 + Math.sin(pulsePhase) * 0.12 
        : 1 + Math.sin(pulsePhase) * 0.03;

      const currentRadius = radius * pulseScale;

      // Sort particles by z-depth for proper rendering
      const sortedParticles = [...particlesRef.current].sort((a, b) => {
        const aZ = Math.cos(a.y) * currentRadius;
        const bZ = Math.cos(b.y) * currentRadius;
        return aZ - bZ;
      });

      sortedParticles.forEach((particle) => {
        // Update particle position
        particle.x += particle.speed;
        
        // Randomize character occasionally
        if (Math.random() < 0.01) {
          particle.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }

        // Convert spherical to cartesian with rotation
        const x3d = Math.sin(particle.y) * Math.cos(particle.x + rotation) * currentRadius;
        const y3d = Math.sin(particle.y) * Math.sin(particle.x + rotation) * currentRadius;
        const z3d = Math.cos(particle.y) * currentRadius;

        // Project to 2D
        const perspective = 500;
        const scale = perspective / (perspective + z3d);
        const x2d = centerX + x3d * scale;
        const y2d = centerY + y3d * scale;

        // Calculate opacity based on depth
        const depthOpacity = (z3d + currentRadius) / (currentRadius * 2);
        const opacity = depthOpacity * particle.brightness;

        // Brighter when processing
        const baseBrightness = isProcessing ? 1.4 : 1.0;
        const brightness = opacity * baseBrightness;

        // Matrix green color
        const green = Math.floor(255 * brightness);
        
        // Draw particle
        ctx.font = `${12 * scale}px "Space Mono", monospace`;
        ctx.fillStyle = `rgba(0, ${green}, 65, ${opacity})`;
        ctx.fillText(particle.char, x2d - 6 * scale, y2d + 4 * scale);

        // Add glow for front particles
        if (z3d > 0 && opacity > 0.7) {
          ctx.shadowBlur = isProcessing ? 15 : 8;
          ctx.shadowColor = `rgba(0, 255, 65, ${opacity * 0.8})`;
          ctx.fillText(particle.char, x2d - 6 * scale, y2d + 4 * scale);
          ctx.shadowBlur = 0;
        }
      });

      // Draw listening pulse rings
      if (isListening) {
        const pulseRings = 3;
        for (let i = 0; i < pulseRings; i++) {
          const ringPhase = (pulsePhase * 2 + i * 0.5) % 2;
          const ringRadius = currentRadius * (0.8 + ringPhase * 0.4);
          const ringOpacity = Math.max(0, 1 - ringPhase);
          
          ctx.strokeStyle = `rgba(0, 255, 65, ${ringOpacity * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw core glow
      const glowRadius = currentRadius * 0.3;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      gradient.addColorStop(0, `rgba(0, 255, 65, ${isProcessing ? 0.4 : 0.2})`);
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, isProcessing, isListening]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{ filter: isProcessing ? 'brightness(1.2)' : 'brightness(1)' }}
      />
      {isListening && (
        <div 
          className="absolute inset-0 rounded-full animate-[listening-pulse_2s_ease-out_infinite]"
          style={{ 
            width: size, 
            height: size,
            boxShadow: '0 0 0 0 rgba(0, 255, 65, 0.7)'
          }}
        />
      )}
    </div>
  );
}
