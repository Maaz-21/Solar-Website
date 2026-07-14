"use client";

import { MapPin, ArrowRight, Move } from "lucide-react";
import AddressSearchBar from "../AddressSearchBar";
import { useDesignStore } from "../store/useDesignStore";

export default function Step1_Locate() {
  const location = useDesignStore((s) => s.location);
  const setLocation = useDesignStore((s) => s.setLocation);
  const confirmPin = useDesignStore((s) => s.confirmPin);
  const nextStep = useDesignStore((s) => s.nextStep);

  const handleConfirm = () => {
    confirmPin();
    nextStep();
  };

  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>Project Location</h2>
        <p>Search for the property address or use GPS — anywhere in the world.</p>
      </div>

      <div className="sd-step-panel-body">
        <AddressSearchBar onLocationSelect={setLocation} isDisabled={false} />

        {location ? (
          <>
            <div className="sd-card" style={{ marginTop: 16 }}>
              <div className="sd-card-title">
                <MapPin size={14} /> Selected Location
              </div>
              <div className="sd-info-rows">
                <div className="sd-info-row">
                  <span>Address</span>
                  <strong style={{ maxWidth: 210, textAlign: "right", fontSize: 12, lineHeight: 1.4 }}>
                    {location.address}
                  </strong>
                </div>
                {location.city && (
                  <div className="sd-info-row">
                    <span>City</span>
                    <strong>{location.city}</strong>
                  </div>
                )}
                {(location.state || location.country) && (
                  <div className="sd-info-row">
                    <span>Region</span>
                    <strong>{[location.state, location.country].filter(Boolean).join(", ")}</strong>
                  </div>
                )}
                <div className="sd-info-row">
                  <span>Coordinates</span>
                  <strong style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {location.coordinates[1].toFixed(5)}, {location.coordinates[0].toFixed(5)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="sd-drawing-guide" style={{ marginTop: 14 }}>
              <div className="sd-drawing-guide-title">
                <Move size={14} /> Fine-tune the pin
              </div>
              <div className="sd-drawing-guide-text">
                Drag the marker on the map until it sits exactly on your roof,
                then confirm below.
              </div>
            </div>
          </>
        ) : (
          <div className="sd-empty-state" style={{ marginTop: 32 }}>
            <div className="sd-empty-state-icon">🌍</div>
            <h3>Find Your Property</h3>
            <p>
              Search for any address worldwide, or use GPS to detect your
              current location automatically.
            </p>
          </div>
        )}
      </div>

      <div className="sd-step-panel-footer">
        <div />
        <button className="sd-btn sd-btn-primary" onClick={handleConfirm} disabled={!location}>
          This pin is on my roof <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
