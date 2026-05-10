"use client";

import {
  PenTool, Square, RefreshCw, Trash2, Loader2, MousePointer
} from "lucide-react";

export default function SolarToolbar({
  step, drawMode,
  onDrawRoof, onDrawObstacle, onCancelDraw,
  onRegenerate, onClearObstacles,
  isLoading, hasRoof, hasObstacles,
}) {
  return (
    <div className="sd-toolbar">
      <div className="sd-toolbar-group">
        <span className="sd-toolbar-label">Drawing Tools</span>

        {/* Draw Roof */}
        <button
          className={`sd-tool-btn ${drawMode === "roof" ? "sd-tool-active" : ""}`}
          onClick={drawMode === "roof" ? onCancelDraw : onDrawRoof}
          disabled={isLoading}
          title={drawMode === "roof" ? "Cancel drawing" : "Draw roof polygon"}
        >
          {drawMode === "roof" ? (
            <>
              <MousePointer size={16} /> Cancel
            </>
          ) : (
            <>
              <PenTool size={16} /> Draw Roof
            </>
          )}
        </button>

        {/* Draw Obstacle */}
        <button
          className={`sd-tool-btn ${drawMode === "obstacle" ? "sd-tool-active" : ""}`}
          onClick={drawMode === "obstacle" ? onCancelDraw : onDrawObstacle}
          disabled={isLoading || !hasRoof}
          title="Draw obstacle area"
        >
          {drawMode === "obstacle" ? (
            <>
              <MousePointer size={16} /> Cancel
            </>
          ) : (
            <>
              <Square size={16} /> Add Obstacle
            </>
          )}
        </button>
      </div>

      {hasRoof && (
        <div className="sd-toolbar-group">
          <span className="sd-toolbar-label">Actions</span>

          {/* Regenerate */}
          <button
            className="sd-tool-btn sd-tool-accent"
            onClick={onRegenerate}
            disabled={isLoading}
            title="Regenerate panel layout"
          >
            {isLoading ? (
              <Loader2 size={16} className="sd-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Regenerate
          </button>

          {/* Clear obstacles */}
          {hasObstacles && (
            <button
              className="sd-tool-btn sd-tool-danger"
              onClick={onClearObstacles}
              disabled={isLoading}
              title="Clear all obstacles"
            >
              <Trash2 size={16} /> Clear Obstacles
            </button>
          )}
        </div>
      )}

      {/* Drawing instructions */}
      {drawMode && (
        <div className="sd-toolbar-hint">
          {drawMode === "roof"
            ? "Click on the map to place roof corners. Double-click or click the first point to finish."
            : "Click to draw obstacle boundary. Double-click to finish."}
        </div>
      )}
    </div>
  );
}
