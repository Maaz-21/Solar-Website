"use client";

import { MapPin, Navigation, Clock3, ArrowRight } from "lucide-react";
import AddressSearchBar from "../AddressSearchBar";

export default function Step1_Location({
  location,
  onLocationSelect,
  onNext,
}) {
  return (
    <div className="sd-step-animate-in">
      <div className="sd-step-panel-header">
        <h2>📍 Project Location</h2>
        <p>Enter the property address where you want to install solar panels.</p>
      </div>

      <div className="sd-step-panel-body">
        <AddressSearchBar
          onLocationSelect={onLocationSelect}
          isDisabled={false}
        />

        {location && (
          <div className="sd-card" style={{ marginTop: 16 }}>
            <div className="sd-card-title">
              <MapPin size={14} /> Selected Location
            </div>
            <div className="sd-info-rows">
              <div className="sd-info-row">
                <span>Address</span>
                <strong style={{ maxWidth: 200, textAlign: "right", fontSize: 12, lineHeight: 1.4 }}>
                  {location.address}
                </strong>
              </div>
              {location.city && (
                <div className="sd-info-row">
                  <span>City</span>
                  <strong>{location.city}</strong>
                </div>
              )}
              {location.state && (
                <div className="sd-info-row">
                  <span>State</span>
                  <strong>{location.state}</strong>
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
        )}

        {!location && (
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
        <button
          className="sd-btn sd-btn-primary"
          onClick={onNext}
          disabled={!location}
        >
          Verify on Satellite <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
