/**
 * MeasuredPolygonMode — CAD-grade polygon drawing on top of
 * mapbox-gl-draw's draw_polygon:
 *
 *  - Right-angle snapping: while placing vertex n≥3, the new edge snaps to
 *    multiples of 90° relative to the previous edge when within tolerance.
 *  - Magnetic close: near the first vertex the cursor locks onto it, so
 *    "click the first point to close" always lands exactly.
 *  - Backspace removes the last placed vertex (Escape cancels and Enter /
 *    click-first-vertex finish, inherited from the base mode).
 *  - Fires `sd.measure` map events with the in-progress ring so the host
 *    can render live edge lengths and running area.
 */

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { toPlane, fromPlane } from "@/lib/solar-engine/geometry/plane";

const DrawPolygon = MapboxDraw.modes.draw_polygon;

const ANGLE_TOLERANCE_DEG = 8;
const CLOSE_SNAP_PX = 14;

function snapCandidate(map, state, e) {
  const ring = state.polygon.coordinates[0] ?? [];
  const placed = state.currentVertexPosition;
  if (placed === 0) return null;

  const first = ring[0];

  // Magnetic close (pixel space so it feels identical at every zoom).
  if (placed >= 3 && first) {
    const firstPx = map.project({ lng: first[0], lat: first[1] });
    const d = Math.hypot(e.point.x - firstPx.x, e.point.y - firstPx.y);
    if (d < CLOSE_SNAP_PX) {
      return { lng: first[0], lat: first[1], closing: true };
    }
  }

  // Right-angle snapping relative to the previous edge.
  if (placed >= 2) {
    const prev = ring[placed - 1];
    const prevPrev = ring[placed - 2];
    if (!prev || !prevPrev) return null;

    const origin = prev;
    const a = toPlane(prevPrev, origin);
    const p = toPlane([e.lngLat.lng, e.lngLat.lat], origin);

    const prevAngle = Math.atan2(-a[1], -a[0]); // direction prevPrev → prev
    const curAngle = Math.atan2(p[1], p[0]);
    const len = Math.hypot(p[0], p[1]);
    if (len < 0.05) return null;

    let rel = ((curAngle - prevAngle) * 180) / Math.PI;
    rel = ((rel % 360) + 360) % 360;
    const nearest = Math.round(rel / 90) * 90;
    const delta = rel - nearest;

    if (Math.abs(delta) <= ANGLE_TOLERANCE_DEG && Math.abs(delta) > 0.001) {
      const snappedAngle = prevAngle + (nearest * Math.PI) / 180;
      const snapped = fromPlane(
        [len * Math.cos(snappedAngle), len * Math.sin(snappedAngle)],
        origin
      );
      return { lng: snapped[0], lat: snapped[1], closing: false };
    }
  }

  return null;
}

function fireMeasure(map, state) {
  const ring = state.polygon.coordinates[0] ?? [];
  map.fire("sd.measure", {
    ring: ring.slice(0, state.currentVertexPosition + 1),
    drawing: true,
  });
}

export const MeasuredPolygonMode = {
  ...DrawPolygon,

  onSetup(opts) {
    const state = DrawPolygon.onSetup.call(this, opts);
    if (opts?.kind) state.polygon.setProperty("kind", opts.kind);
    return state;
  },

  onMouseMove(state, e) {
    const snapped = snapCandidate(this.map, state, e);
    if (snapped) {
      e.lngLat = { lng: snapped.lng, lat: snapped.lat };
    }
    DrawPolygon.onMouseMove.call(this, state, e);
    this.map.getCanvas().style.cursor = snapped?.closing ? "pointer" : "crosshair";
    fireMeasure(this.map, state);
  },

  clickAnywhere(state, e) {
    const snapped = snapCandidate(this.map, state, e);
    if (snapped) {
      e.lngLat = { lng: snapped.lng, lat: snapped.lat };
      if (snapped.closing) {
        // Land exactly on the first vertex → finish the ring.
        return this.clickOnVertex(state, e);
      }
    }
    const result = DrawPolygon.clickAnywhere.call(this, state, e);
    fireMeasure(this.map, state);
    return result;
  },

  onKeyDown(state, e) {
    if (e.keyCode === 8) {
      // Backspace: drop the last placed vertex instead of leaving the mode.
      e.preventDefault();
      if (state.currentVertexPosition > 0) {
        state.currentVertexPosition -= 1;
        state.polygon.removeCoordinate(`0.${state.currentVertexPosition}`);
        fireMeasure(this.map, state);
      }
    }
  },

  onStop(state) {
    this.map.fire("sd.measure", { ring: [], drawing: false });
    this.map.getCanvas().style.cursor = "";
    DrawPolygon.onStop.call(this, state);
  },
};
