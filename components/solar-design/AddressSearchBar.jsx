"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function AddressSearchBar({ onLocationSelect, isDisabled }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Geocode search using Mapbox
  const searchAddress = useCallback(async (text) => {
    if (!text || text.length < 3 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json?access_token=${MAPBOX_TOKEN}&country=in&types=address,place,locality,neighborhood,postcode&limit=5`
      );
      const data = await res.json();

      if (data.features) {
        setSuggestions(
          data.features.map((f) => ({
            id: f.id,
            name: f.place_name,
            center: f.center, // [lng, lat]
            city: f.context?.find((c) => c.id.startsWith("place"))?.text || "",
            state: f.context?.find((c) => c.id.startsWith("region"))?.text || "",
            pincode: f.context?.find((c) => c.id.startsWith("postcode"))?.text || "",
          }))
        );
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 300);
  };

  // Select a suggestion
  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    onLocationSelect({
      address: suggestion.name,
      coordinates: suggestion.center,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
    });
  };

  // Use current GPS location
  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`
          );
          const data = await res.json();
          const feature = data.features?.[0];

          const loc = {
            address: feature?.place_name || `${latitude}, ${longitude}`,
            coordinates: [longitude, latitude],
            city: feature?.context?.find((c) => c.id.startsWith("place"))?.text || "",
            state: feature?.context?.find((c) => c.id.startsWith("region"))?.text || "",
            pincode: feature?.context?.find((c) => c.id.startsWith("postcode"))?.text || "",
          };

          setQuery(loc.address);
          onLocationSelect(loc);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          onLocationSelect({
            address: `${latitude}, ${longitude}`,
            coordinates: [longitude, latitude],
            city: "",
            state: "",
            pincode: "",
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (err) => {
        console.error("GPS error:", err);
        alert("Unable to get your location. Please allow location access.");
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="sd-search-wrapper" ref={wrapperRef}>
      <div className="sd-search-box">
        <Search size={16} className="sd-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="sd-search-input"
          placeholder="Enter your address, city, or pincode..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          disabled={isDisabled}
          id="address-search-input"
        />
        {isSearching && <Loader2 size={16} className="sd-search-spinner" />}
        {query && (
          <button className="sd-search-clear" onClick={clearInput}>
            <X size={14} />
          </button>
        )}
        <button
          className="sd-gps-btn"
          onClick={handleGPS}
          disabled={isGeolocating || isDisabled}
          title="Use current location"
        >
          {isGeolocating ? (
            <Loader2 size={16} className="sd-search-spinner" />
          ) : (
            <MapPin size={16} />
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="sd-search-dropdown">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                className="sd-search-result"
                onClick={() => handleSelect(s)}
              >
                <MapPin size={14} className="sd-result-icon" />
                <span className="sd-result-text">{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
