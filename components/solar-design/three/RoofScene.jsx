"use client";

/**
 * RoofScene — 3D Review (viewer only, user amendment #5).
 *
 * Builds the scene straight from the store's 2D geometry projected into a
 * local metric plane, so panel positions/counts match the 2D design
 * EXACTLY (same engine projection). Building height and slope direction
 * are visualization assumptions and are labelled as such in the UI.
 *
 *  - Building mass extruded from the roof outline (3 m walls + parapet)
 *  - Panels as one merged mesh, tilted at the user-provided angle with the
 *    poleward edge raised (racking) or flush (pitched roofs)
 *  - Obstacles as extruded volumes at their entered heights
 *  - Ground textured with Mapbox satellite imagery around the site
 */

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDesignStore } from "../store/useDesignStore";
import { toPlane, ringOrigin } from "@/lib/solar-engine/geometry/plane";

const WALL_HEIGHT = 3;
const PARAPET_HEIGHT = 0.35;
const PARAPET_THICKNESS = 0.18;
const RACK_CLEARANCE = 0.25;
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function ringToLocal(ring, origin) {
  // Local plane: x = east, y = north  →  three.js: x = east, z = -north (y up)
  return ring.map((c) => {
    const [x, y] = toPlane(c, origin);
    return [x, -y];
  });
}

function shapeFromRing(localRing) {
  const shape = new THREE.Shape();
  localRing.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();
  return shape;
}

/** Extrude a footprint upward from z=0 to `height` (laid flat via rotation). */
function ExtrudedFootprint({ localRing, height, color, opacity = 1, base = 0 }) {
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shapeFromRing(localRing), {
      depth: height,
      bevelEnabled: false,
    });
    geo.rotateX(-Math.PI / 2); // shape plane (x,y) → ground plane (x,z), depth → +y
    geo.scale(1, 1, -1);
    return geo;
  }, [localRing, height]);

  return (
    <mesh geometry={geometry} position={[0, base, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

function Building({ roofRing }) {
  const outline = useMemo(() => {
    const pts = roofRing.map(([x, z]) => new THREE.Vector3(x, WALL_HEIGHT + 0.02, z));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [roofRing]);

  return (
    <group>
      <ExtrudedFootprint localRing={roofRing} height={WALL_HEIGHT} color="#b8b2a7" />
      <ExtrudedFootprint
        localRing={roofRing}
        height={PARAPET_HEIGHT}
        base={WALL_HEIGHT}
        color="#a49e93"
        opacity={0.55}
      />
      <line geometry={outline}>
        <lineBasicMaterial color="#f0ede6" />
      </line>
    </group>
  );
}

/** All panels merged into one geometry — matches 2D footprints exactly. */
function Panels({ panels, origin, tiltDeg, flushMount, latitude }) {
  const { geometry, edges } = useMemo(() => {
    const positions = [];
    const tilt = (Math.max(tiltDeg, 0) * Math.PI) / 180;
    const northPositive = latitude >= 0;

    for (const panel of panels) {
      const ring = panel.coordinates[0];
      if (!ring || ring.length < 4) continue;

      // Which footprint edge is poleward? That edge gets raised (racking).
      const edge01Lat = (ring[0][1] + ring[1][1]) / 2;
      const edge23Lat = (ring[2][1] + ring[3][1]) / 2;
      const edge01IsHigh = northPositive ? edge01Lat > edge23Lat : edge01Lat < edge23Lat;

      const [c0, c1, c2, c3] = ring.slice(0, 4).map((c) => {
        const [x, y] = toPlane(c, origin);
        return [x, -y];
      });

      // Footprint depth across rows (raised direction).
      const depth = Math.hypot(c3[0] - c0[0], c3[1] - c0[1]);
      const rise = flushMount ? 0 : depth * Math.tan(tilt);
      const zLow = WALL_HEIGHT + RACK_CLEARANCE;
      const zHigh = zLow + rise;

      const h01 = edge01IsHigh ? zHigh : zLow;
      const h23 = edge01IsHigh ? zLow : zHigh;

      const v0 = [c0[0], h01, c0[1]];
      const v1 = [c1[0], h01, c1[1]];
      const v2 = [c2[0], h23, c2[1]];
      const v3 = [c3[0], h23, c3[1]];

      // Two triangles per panel face.
      positions.push(...v0, ...v1, ...v2, ...v0, ...v2, ...v3);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return { geometry: geo, edges: new THREE.EdgesGeometry(geo, 30) };
  }, [panels, origin, tiltDeg, flushMount, latitude]);

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#10457a"
          metalness={0.55}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#9ecbff" transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

function Ground({ origin }) {
  // Static satellite image centered on the site; plane sized to its
  // real-world coverage so the building sits true to scale.
  const lat = origin[1];
  const zoom = 19;
  const px = 640;
  const coverageM = ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom) * px;

  const url =
    `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/` +
    `${origin[0]},${origin[1]},${zoom},0/${px}x${px}@2x?access_token=${TOKEN}&attribution=false&logo=false`;

  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[coverageM, coverageM]} />
      <meshStandardMaterial
        map={texture}
        map-colorSpace={THREE.SRGBColorSpace}
        roughness={1}
      />
    </mesh>
  );
}

function PlainGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color="#20262e" roughness={1} />
    </mesh>
  );
}

function Scene() {
  const roofPolygon = useDesignStore((s) => s.roof.polygon);
  const roofType = useDesignStore((s) => s.roof.roofType);
  const tiltDeg = useDesignStore((s) => s.roof.tiltDeg);
  const obstacles = useDesignStore((s) => s.obstacles);
  const design = useDesignStore((s) => s.design);
  const location = useDesignStore((s) => s.location);

  const data = useMemo(() => {
    if (!roofPolygon?.coordinates?.[0]) return null;
    const origin = ringOrigin(roofPolygon.coordinates[0]);
    return {
      origin,
      roofRing: ringToLocal(roofPolygon.coordinates[0], origin),
      obstacleRings: obstacles.map((o) => ({
        ring: ringToLocal(o.polygon.coordinates[0], origin),
        heightM: o.heightM ?? 1.5,
      })),
      panels: design?.panels?.filter((p) => p.enabled !== false) ?? [],
    };
  }, [roofPolygon, obstacles, design]);

  if (!data) return null;

  const lat = location?.coordinates?.[1] ?? 20;
  const sunElevation = ((90 - Math.abs(lat)) * Math.PI) / 180;
  const sunDir = [
    0,
    Math.sin(sunElevation) * 60,
    (lat >= 0 ? 1 : -1) * Math.cos(sunElevation) * 60,
  ];

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={sunDir}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <hemisphereLight args={["#bcd6ff", "#3a3a30", 0.35]} />

      {TOKEN ? <Ground origin={data.origin} /> : <PlainGround />}
      <Building roofRing={data.roofRing} />

      {data.obstacleRings.map((o, i) => (
        <ExtrudedFootprint
          key={i}
          localRing={o.ring}
          height={o.heightM}
          base={WALL_HEIGHT}
          color="#c2554f"
          opacity={0.92}
        />
      ))}

      <Panels
        panels={data.panels}
        origin={data.origin}
        tiltDeg={tiltDeg}
        flushMount={roofType === "pitched"}
        latitude={lat}
      />

      <OrbitControls
        target={[0, WALL_HEIGHT, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={140}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export default function RoofScene() {
  return (
    <div className="sd-three-overlay">
      <Canvas
        shadows
        // Static scene: render only when the camera moves or props change,
        // instead of burning a 60fps loop while the user just looks at it.
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ position: [24, 22, 24], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#101722");
          scene.fog = new THREE.Fog("#101722", 120, 260);
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
