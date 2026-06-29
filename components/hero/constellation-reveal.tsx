"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  ambientOffset: number;
  ambientSpeed: number;
  ambientRadius: number;
  isMonogram: boolean;
}

export default function ConstellationReveal() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    let nodes: Node[] = [];
    const nodeCount = 45;
    let startTime = Date.now();
    const duration = 2500; // 2.5 seconds for convergence

    const initNodes = () => {
      nodes = [];
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Determine monogram scale based on screen size
      const isMobile = width < 768;
      const R = isMobile ? 70 : 110; // Outer radius of "C"
      const r = isMobile ? 40 : 65;  // Inner radius of "C"

      // 1. Create Monogram Nodes (forming a stylized wireframe "C")
      // We will place nodes along an arc from 45 degrees (pi/4) to 315 degrees (7*pi/4)
      const startAngle = Math.PI * 0.22;
      const endAngle = Math.PI * 1.78;
      const steps = 9;

      const monogramNodes: { tx: number; ty: number }[] = [];

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const angle = startAngle + t * (endAngle - startAngle);

        // Outer arc point
        const ox = centerX + R * Math.cos(angle);
        const oy = centerY + R * Math.sin(angle);
        monogramNodes.push({ tx: ox, ty: oy });

        // Inner arc point
        const ix = centerX + r * Math.cos(angle);
        const iy = centerY + r * Math.sin(angle);
        monogramNodes.push({ tx: ix, ty: iy });
      }

      // Add a few cross-bracing nodes to make the wireframe look technical
      monogramNodes.push({ tx: centerX - (R + r) / 2, ty: centerY });
      monogramNodes.push({ tx: centerX + R * Math.cos(startAngle) - 15, ty: centerY + R * Math.sin(startAngle) - 15 });
      monogramNodes.push({ tx: centerX + R * Math.cos(endAngle) - 15, ty: centerY + R * Math.sin(endAngle) + 15 });

      // Initialize all nodes
      for (let i = 0; i < nodeCount; i++) {
        // Scatter origin points across the canvas
        const originX = Math.random() * width;
        const originY = Math.random() * height;

        let targetX = Math.random() * width;
        let targetY = Math.random() * height;
        let isMonogram = false;

        // If we have monogram points left, assign this node to one
        if (i < monogramNodes.length) {
          targetX = monogramNodes[i].tx;
          targetY = monogramNodes[i].ty;
          isMonogram = true;
        }

        nodes.push({
          x: prefersReducedMotion ? targetX : originX,
          y: prefersReducedMotion ? targetY : originY,
          originX,
          originY,
          targetX,
          targetY,
          vx: 0,
          vy: 0,
          size: isMonogram ? (Math.random() * 1.5 + 1.5) : (Math.random() * 1.0 + 0.8), // Monogram nodes are slightly larger
          ambientOffset: Math.random() * Math.PI * 2,
          ambientSpeed: 0.0008 + Math.random() * 0.0012,
          ambientRadius: isMonogram ? 3 + Math.random() * 4 : 15 + Math.random() * 25, // Background nodes float wider
          isMonogram,
        });
      }
    };

    initNodes();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();
      const elapsed = now - startTime;
      
      // Progress of convergence (0 to 1)
      const progress = prefersReducedMotion ? 1 : Math.min(elapsed / duration, 1);
      
      // Easing function for smooth arrival (easeOutCubic)
      const ease = 1 - Math.pow(1 - progress, 3);

      const time = now;

      // Update positions
      nodes.forEach((node) => {
        // 1. Calculate base position (interpolating from scattered origin to target)
        const baseX = node.originX + (node.targetX - node.originX) * ease;
        const baseY = node.originY + (node.targetY - node.originY) * ease;

        // 2. Add ambient floating motion (slow circle/lissajous float)
        const angle = time * node.ambientSpeed + node.ambientOffset;
        const floatX = Math.cos(angle) * node.ambientRadius;
        const floatY = Math.sin(angle * 1.5) * node.ambientRadius;

        node.x = baseX + floatX;
        node.y = baseY + floatY;
      });

      // Draw Connections (Lines)
      ctx.lineWidth = 0.75;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connection rules:
          // - Monogram nodes connect to other monogram nodes if they are relatively close
          // - Background nodes connect to any nodes if they are very close
          let maxDist = 95;
          let opacityMultiplier = 1;

          if (n1.isMonogram && n2.isMonogram) {
            maxDist = width < 768 ? 80 : 120; // Allow longer connections in the monogram wireframe
            opacityMultiplier = 1.3;
          } else if (!n1.isMonogram && !n2.isMonogram) {
            maxDist = 65; // Background nodes have shorter connection range
            opacityMultiplier = 0.5;
          } else {
            maxDist = 55; // Monogram-to-background connection range
            opacityMultiplier = 0.3;
          }

          if (dist < maxDist) {
            // Calculate opacity based on distance and animation progress
            const baseAlpha = (1 - dist / maxDist) * 0.12 * opacityMultiplier;
            // Lines fade in as the constellation converges
            const alpha = baseAlpha * (0.3 + 0.7 * progress);

            ctx.strokeStyle = `rgba(139, 127, 232, ${alpha})`; // Wisteria color
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes (Dots)
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        
        // Color: Wisteria for monogram, Skyline for background ambient nodes
        const color = node.isMonogram ? "139, 127, 232" : "91, 141, 239";
        const baseAlpha = node.isMonogram ? 0.45 : 0.2;
        // Nodes pulse slightly over time
        const pulse = 0.8 + 0.2 * Math.sin(time * node.ambientSpeed * 5 + node.ambientOffset);
        const alpha = baseAlpha * pulse * (0.5 + 0.5 * progress);

        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();

        // Glowing halo around monogram nodes
        if (node.isMonogram && progress > 0.8) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha * 0.25})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      startTime = Date.now(); // Restart convergence on resize to adapt positions
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
