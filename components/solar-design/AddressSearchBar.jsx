"use client";

/**
 * Worldwide address search — Mapbox Geocoding v6 (autocomplete) + GPS with
 * reverse geocoding, recent searches in localStorage.
 */

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
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* localStorage unavailable */
  }
}

/** Normalize a v6 feature into the app's location shape. */
function parseFeature(feature) {
  const props = feature.properties ?? {};
  const ctx = props.context ?? {};
  const coords = props.coordinates
    ? [props.coordinates.longitude, props.coordinates.latitude]
    : feature.geometry?.coordinates;
  return {
    id: feature.id ?? props.mapbox_id ?? `${coords?.[0]},${coords?.[1]}`,
    address: props.full_address ?? props.name ?? "",
    coordinates: coords,
    city: ctx.place?.name ?? ctx.locality?.name ?? "",
    state: ctx.region?.name ?? "",
    country: ctx.country?.name ?? "",
    pincode: ctx.postcode?.name ?? "",
  };
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

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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

  const searchAddress = useCallback(async (text) => {
    if (!text || text.length < 3 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const url =
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(text)}` +
        `&access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=6` +
        `&types=address,street,place,locality,neighborhood,postcode&proximity=ip`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features) {
        setSuggestions(
          data.features
            .map(parseFeature)
            .filter((f) => f.coordinates)
            .map((f) => ({
              ...f,
              primary: f.address.split(",")[0],
              secondary: f.address.split(",").slice(1).join(",").trim(),
            }))
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
    if (suggestions.length > 0) setIsOpen(true);
    else if (!query && recentSearches.length > 0) setShowRecent(true);
  };

  const emit = (loc) => {
    saveRecentSearch(loc);
    setRecentSearches(getRecentSearches());
    onLocationSelect({
      address: loc.address,
      coordinates: loc.coordinates,
      city: loc.city ?? "",
      state: loc.state ?? "",
      country: loc.country ?? "",
      pincode: loc.pincode ?? "",
    });
  };

  const handleSelect = (s) => {
    setQuery(s.address);
    setIsOpen(false);
    setShowRecent(false);
    emit(s);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let loc = {
          id: `gps-${longitude.toFixed(5)},${latitude.toFixed(5)}`,
          address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          coordinates: [longitude, latitude],
          city: "", state: "", country: "", pincode: "",
        };
        try {
          const url =
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}` +
            `&latitude=${latitude}&access_token=${MAPBOX_TOKEN}&limit=1`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.features?.[0]) {
            const parsed = parseFeature(data.features[0]);
            loc = { ...parsed, id: loc.id, coordinates: [longitude, latitude] };
          }
        } catch {
          /* keep raw coordinates */
        }
        setQuery(loc.address);
        emit(loc);
        setIsGeolocating(false);
      },
      () => {
        setIsGeolocating(false);
        alert("Unable to get your location. Please allow location access.");
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
          autoComplete="off"
        />
        {isSearching && <Loader2 size={16} className="sd-search-spinner" />}
        {query && (
          <button className="sd-search-clear" onClick={clearInput} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
        <button
          className="sd-gps-btn"
          onClick={handleGPS}
          disabled={isGeolocating || isDisabled}
          title="Use current location"
        >
          {isGeolocating ? <Loader2 size={16} className="sd-search-spinner" /> : <MapPin size={16} />}
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="sd-search-dropdown">
          <li className="sd-search-dropdown-section">Suggestions</li>
          {suggestions.map((s) => (
            <li key={s.id}>
              <button className="sd-search-result" onClick={() => handleSelect(s)}>
                <MapPin size={14} className="sd-result-icon" />
                <span className="sd-result-text">
                  <span className="sd-result-primary">{s.primary}</span>
                  {s.secondary && <span className="sd-result-secondary">{s.secondary}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showRecent && recentSearches.length > 0 && !isOpen && (
        <ul className="sd-search-dropdown">
          <li className="sd-search-dropdown-section">Recent Searches</li>
          {recentSearches.map((r) => (
            <li key={r.id}>
              <button className="sd-search-result" onClick={() => handleSelect({ ...r, primary: r.address })}>
                <Clock3 size={14} className="sd-result-icon" />
                <span className="sd-result-text">
                  <span className="sd-result-primary">{r.address?.split(",")[0]}</span>
                  <span className="sd-result-secondary">
                    {r.address?.split(",").slice(1).join(",").trim()}
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
