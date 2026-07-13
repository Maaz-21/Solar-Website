"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, X, Clock3 } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const RECENT_STORAGE_KEY = "sd-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(item) {
  try {
    const recent = getRecentSearches().filter((r) => r.id !== item.id);
    recent.unshift(item);
    localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // localStorage not available
  }
}

export default function AddressSearchBar({ onLocationSelect, isDisabled }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Geocode search using Mapbox — worldwide with India proximity bias
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
        )}.json?access_token=${MAPBOX_TOKEN}&proximity=ip&types=address,place,locality,neighborhood,postcode&limit=6`
      );
      const data = await res.json();

      if (data.features) {
        setSuggestions(
          data.features.map((f) => {
            const parts = f.place_name.split(", ");
            return {
              id: f.id,
              name: f.place_name,
              primary: parts[0] || f.text,
              secondary: parts.slice(1).join(", "),
              center: f.center,
              city:
                f.context?.find((c) => c.id.startsWith("place"))?.text || "",
              state:
                f.context?.find((c) => c.id.startsWith("region"))?.text || "",
              pincode:
                f.context?.find((c) => c.id.startsWith("postcode"))?.text || "",
              country:
                f.context?.find((c) => c.id.startsWith("country"))?.text || "",
            };
          })
        );
        setIsOpen(true);
        setShowRecent(false);
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
    if (!val) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 300);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    } else if (!query && recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  // Select a suggestion
  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setIsOpen(false);
    setShowRecent(false);

    const loc = {
      address: suggestion.name,
      coordinates: suggestion.center,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
    };

    saveRecentSearch({
      id: suggestion.id,
      name: suggestion.name,
      center: suggestion.center,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
    });
    setRecentSearches(getRecentSearches());
    onLocationSelect(loc);
  };

  // Select from recent
  const handleRecentSelect = (recent) => {
    setQuery(recent.name);
    setShowRecent(false);
    onLocationSelect({
      address: recent.name,
      coordinates: recent.center,
      city: recent.city || "",
      state: recent.state || "",
      pincode: recent.pincode || "",
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
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`
          );
          const data = await res.json();
          const feature = data.features?.[0];

          const loc = {
            address: feature?.place_name || `${latitude}, ${longitude}`,
            coordinates: [longitude, latitude],
            city:
              feature?.context?.find((c) => c.id.startsWith("place"))?.text ||
              "",
            state:
              feature?.context?.find((c) => c.id.startsWith("region"))?.text ||
              "",
            pincode:
              feature?.context?.find((c) => c.id.startsWith("postcode"))
                ?.text || "",
          };

          setQuery(loc.address);
          saveRecentSearch({
            id: `gps-${Date.now()}`,
            name: loc.address,
            center: loc.coordinates,
            city: loc.city,
            state: loc.state,
            pincode: loc.pincode,
          });
          setRecentSearches(getRecentSearches());
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
    setShowRecent(false);
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
          placeholder="Search any address worldwide..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
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
          <li className="sd-search-dropdown-section">Suggestions</li>
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                className="sd-search-result"
                onClick={() => handleSelect(s)}
              >
                <MapPin size={14} className="sd-result-icon" />
                <span className="sd-result-text">
                  <span className="sd-result-primary">{s.primary}</span>
                  {s.secondary && (
                    <span className="sd-result-secondary">{s.secondary}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && !isOpen && (
        <ul className="sd-search-dropdown">
          <li className="sd-search-dropdown-section">Recent Searches</li>
          {recentSearches.map((r) => (
            <li key={r.id}>
              <button
                className="sd-search-result"
                onClick={() => handleRecentSelect(r)}
              >
                <Clock3 size={14} className="sd-result-icon" />
                <span className="sd-result-text">
                  <span className="sd-result-primary">
                    {r.name.split(", ")[0]}
                  </span>
                  <span className="sd-result-secondary">
                    {r.name.split(", ").slice(1).join(", ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
