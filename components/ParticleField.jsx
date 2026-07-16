"use client";

/**
 * SunlightFlow — ambient light effect on every public page.
 *
 * A soft golden light source sits in the top-right corner. Broad, slowly
 * sweeping rays fall across the page toward the bottom-left, and tiny
 * glowing energy particles drift along those rays. Particles near the
 * cursor gently bend toward it, then rejoin their flow — sunlight moving
 * across the interface.
 *
 * Subtlety contract: pointer-events none, low alphas tuned for the site's
 * light backgrounds, DPR capped, paused on hidden tabs, and fully disabled
 * under prefers-reduced-motion.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";

const GOLD = { r: 246, g: 196, b: 69 };
const GREEN = { r: 53, g: 217, b: 154 };

const RAY_COUNT = 5;
const CURSOR_DIST = 150;
const CURSOR_PULL = 0.055; // gentle attraction, not a vortex
const FLOW_STEER = 0.035; // how quickly particles rejoin their ray
const MAX_SPEED = 1.5;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
}

/** True when motion is allowed; server snapshot renders nothing (SSR-safe). */
function useMotionAllowed() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

function makeRays() {
  // Angles point from the top-right source into the page (canvas coords:
  // +x right, +y down), fanned between "left" and "down-left".
  return Array.from({ length: RAY_COUNT }, (_, i) => {
    const t = i / (RAY_COUNT - 1);
    return {
      baseAngle: 2.32 + t * 0.62, // ~133° … ~168°
      swayAmp: 0.025 + Math.random() * 0.03,
      swaySpeed: 0.00008 + Math.random() * 0.00012,
      phase: Math.random() * Math.PI * 2,
      halfWidthEnd: 70 + Math.random() * 90,
      alpha: 0.045 + Math.random() * 0.03,
      angle: 0, // current angle, updated per frame
    };
  });
}

function spawnParticle(source, rays, rayLength, alongMax = 0.35) {
  const ray = Math.floor(Math.random() * rays.length);
  const angle = rays[ray].baseAngle;
  const along = Math.random() * rayLength * alongMax;
  const perp = (Math.random() - 0.5) * 60;
  const speed = 0.35 + Math.random() * 0.55;
  const color = Math.random() < 0.82 ? GOLD : GREEN;
  return {
    ray,
    x: source.x + Math.cos(angle) * along - Math.sin(angle) * perp,
    y: source.y + Math.sin(angle) * along + Math.cos(angle) * perp,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    speed,
    radius: 0.8 + Math.random() * 1.3,
    color,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.008 + Math.random() * 0.014,
  };
}

export default function ParticleField() {
  const canvasRef = useRef(null);
  const enabled = useMotionAllowed();

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = null;
    let running = true;

    const source = { x: 0, y: 0 };
    const rays = makeRays();
    let rayLength = 0;
    let particles = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const layout = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      source.x = width * 0.96;
      source.y = -height * 0.04;
      rayLength = Math.hypot(width, height) * 1.15;

      const count = Math.min(Math.round((width * height) / 17000), 140);
      particles = Array.from({ length: count }, () =>
        spawnParticle(source, rays, rayLength, 1) // initial fill along full rays
      );
    };
    layout();

    const onPointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) {
        pointer.x = t.clientX;
        pointer.y = t.clientY;
        pointer.active = true;
      }
    };

    const drawSourceGlow = (time) => {
      const pulse = 1 + Math.sin(time * 0.0006) * 0.07;
      const radius = Math.min(width, height) * 0.55 * pulse;
      const glow = ctx.createRadialGradient(
        source.x, source.y, 0,
        source.x, source.y, radius
      );
      glow.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.16)`);
      glow.addColorStop(0.4, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.06)`);
      glow.addColorStop(1, "rgba(246,196,69,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    };

    const drawRay = (ray, time) => {
      ray.angle = ray.baseAngle + Math.sin(time * ray.swaySpeed + ray.phase) * ray.swayAmp;
      const breathe = 0.75 + Math.sin(time * ray.swaySpeed * 1.7 + ray.phase) * 0.25;

      ctx.save();
      ctx.translate(source.x, source.y);
      ctx.rotate(ray.angle);

      // Trapezoid beam widening away from the source, fading along its length.
      const grad = ctx.createLinearGradient(0, 0, rayLength, 0);
      grad.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${ray.alpha * breathe})`);
      grad.addColorStop(0.55, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${ray.alpha * 0.45 * breathe})`);
      grad.addColorStop(1, "rgba(246,196,69,0)");

      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(rayLength, -ray.halfWidthEnd);
      ctx.lineTo(rayLength, ray.halfWidthEnd);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };

    const step = (time) => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      drawSourceGlow(time);
      for (const ray of rays) drawRay(ray, time);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.twinkle += p.twinkleSpeed;

        // Steer back toward the current direction of the particle's ray…
        const angle = rays[p.ray].angle || rays[p.ray].baseAngle;
        p.vx += (Math.cos(angle) * p.speed - p.vx) * FLOW_STEER;
        p.vy += (Math.sin(angle) * p.speed - p.vy) * FLOW_STEER;

        // …but bend toward the cursor when it's near.
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_DIST && dist > 1) {
            const pull = ((CURSOR_DIST - dist) / CURSOR_DIST) * CURSOR_PULL;
            p.vx += (dx / dist) * pull;
            p.vy += (dy / dist) * pull;
          }
        }

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Left the page → respawn near the light source.
        if (p.x < -30 || p.y > height + 30 || p.y < -height * 0.2 || p.x > width + 60) {
          particles[i] = spawnParticle(source, rays, rayLength);
          continue;
        }

        const alpha = 0.28 + Math.sin(p.twinkle) * 0.18;
        const { r, g, b } = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.75)`;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(step);
      else if (raf) cancelAnimationFrame(raf);
    };

    window.addEventListener("resize", layout);
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        pointerEvents: "none",
      }}
    />
  );
} 