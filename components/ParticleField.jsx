"use client";

/**
 * SunlightFlow — ambient light effect on every public page.
 *
 * A soft golden light source sits in the top-right corner. Broad, slowly
 * sweeping rays fall across the page toward the bottom and bottom-left,
 * and tiny glowing dust motes wander down along those rays. The cursor
 * acts like a puff of air: it briefly deflects nearby particles (and can
 * knock one onto a neighbouring ray) before the flow carries them on.
 *
 * Subtlety contract: pointer-events none, low alphas tuned for the site's
 * light backgrounds, DPR capped, paused on hidden tabs, and fully disabled
 * under prefers-reduced-motion.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";

const GOLD = { r: 246, g: 196, b: 69 };
const GREEN = { r: 53, g: 217, b: 154 };

const RAY_COUNT = 5;
const CURSOR_DIST = 130;
const CURSOR_PUSH = 0.09; // gentle deflection away from the cursor — a hindrance, not a magnet
const RAY_HOP_CHANCE = 0.03; // per-frame chance a strongly disturbed particle changes ray
const FLOW_STEER = 0.03; // how quickly particles rejoin their ray
const MAX_SPEED = 1.6;

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
  // +x right, +y down), fanned between "down" and "down-left/left".
  return Array.from({ length: RAY_COUNT }, (_, i) => {
    const t = i / (RAY_COUNT - 1);
    return {
      baseAngle: 1.88 + t * 1.0, // ~108° … ~165°
      swayAmp: 0.025 + Math.random() * 0.03,
      swaySpeed: 0.00008 + Math.random() * 0.00012,
      phase: Math.random() * Math.PI * 2,
      halfWidthEnd: 70 + Math.random() * 90,
      alpha: 0.045 + Math.random() * 0.03,
      angle: 0, // current angle, updated per frame
    };
  });
}

/**
 * Pre-rendered sprite for one particle color: a solid disc, no glow.
 * Rendered at high resolution so the downscaled edge stays smoothly
 * anti-aliased. drawImage keeps the frame loop cheap (no per-frame paths).
 */
function makeParticleSprite({ r, g, b }) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g2d = c.getContext("2d");
  g2d.fillStyle = `rgb(${r},${g},${b})`;
  g2d.beginPath();
  g2d.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  g2d.fill();
  return c;
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
    // Dust wander: each mote drifts side-to-side across its beam and
    // surges/slows a little instead of tracking the ray in a straight line.
    wanderPhase: Math.random() * Math.PI * 2,
    wanderSpeed: 0.008 + Math.random() * 0.02,
    wanderAmp: 0.25 + Math.random() * 0.45,
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
    const sprites = { gold: makeParticleSprite(GOLD), green: makeParticleSprite(GREEN) };

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

        // Steer toward the ray direction plus a wandering sideways drift —
        // dust floating in a sunbeam, not a bead on a wire.
        const angle = rays[p.ray].angle || rays[p.ray].baseAngle;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        p.wanderPhase += p.wanderSpeed;
        const sway = Math.sin(p.wanderPhase) * p.wanderAmp;
        const surge = 1 + Math.sin(p.wanderPhase * 0.7 + p.twinkle) * 0.25;
        p.vx += ((dirX - dirY * sway) * p.speed * surge - p.vx) * FLOW_STEER;
        p.vy += ((dirY + dirX * sway) * p.speed * surge - p.vy) * FLOW_STEER;

        // The cursor is a puff of air: nearby motes get nudged away with a
        // slight swirl, and a strongly disturbed one may hop to a
        // neighbouring ray — then the flow simply carries it on.
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_DIST && dist > 0.5) {
            const f = (1 - dist / CURSOR_DIST) * CURSOR_PUSH;
            p.vx += (dx / dist) * f - (dy / dist) * f * 0.6;
            p.vy += (dy / dist) * f + (dx / dist) * f * 0.6;
            if (dist < CURSOR_DIST * 0.6 && Math.random() < RAY_HOP_CHANCE) {
              const hop = Math.random() < 0.5 ? -1 : 1;
              p.ray = Math.min(rays.length - 1, Math.max(0, p.ray + hop));
            }
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

        const alpha = 0.45 + Math.sin(p.twinkle) * 0.28;
        const sprite = p.color === GOLD ? sprites.gold : sprites.green;
        const d = p.radius * 2.4; // solid dot, no halo
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(step);
      else if (raf) cancelAnimationFrame(raf);
    };

    // Debounced: layout() rebuilds the whole particle field, far too heavy
    // to run on every resize event (mobile browsers fire them during scroll
    // when the URL bar collapses).
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(step);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
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