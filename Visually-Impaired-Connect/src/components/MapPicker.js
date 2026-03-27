import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Forces the map to recalculate its size after it mounts (fixes grey tiles). */
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

// Fix Leaflet's default marker icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom coloured icons
const makeIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const blueIcon = makeIcon("blue");
const violetIcon = makeIcon("violet");

/** Reverse-geocode a lat/lng using Nominatim (free, no API key). */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/** Inner component: listens for map clicks and calls the parent handler. */
function ClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

/**
 * MapPicker
 *
 * Props:
 *   originPin        – { lat, lng } | null
 *   destinationPin   – { lat, lng } | null
 *   onOriginChange   – ({ lat, lng, address }) => void
 *   onDestinationChange – ({ lat, lng, address }) => void
 */
const MapPicker = ({ originPin, destinationPin, onOriginChange, onDestinationChange }) => {
  // Track which pin the NEXT click should set
  const [nextPin, setNextPin] = useState("origin"); // "origin" | "destination"

  const handleMapClick = useCallback(
    async ({ lat, lng }) => {
      const address = await reverseGeocode(lat, lng);
      if (nextPin === "origin") {
        onOriginChange({ lat, lng, address });
        setNextPin("destination");
      } else {
        onDestinationChange({ lat, lng, address });
        setNextPin("origin");
      }
    },
    [nextPin, onOriginChange, onDestinationChange]
  );

  const modeLabel =
    nextPin === "origin"
      ? "📍 Click on the map to set your Pickup Location"
      : "🏁 Click on the map to set your Destination";

  const modeColor =
    nextPin === "origin" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200";

  return (
    <div className="space-y-2">
      {/* Mode badge */}
      <div className={`text-sm font-semibold px-4 py-2 rounded-xl border ${modeColor} flex items-center justify-between`}>
        <span>{modeLabel}</span>
        {(originPin || destinationPin) && (
          <div className="flex gap-2 text-xs">
            {originPin && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Origin ✓
              </span>
            )}
            {destinationPin && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Destination ✓
              </span>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md" style={{ height: 340 }}>
        <MapContainer
          center={[20.5937, 78.9629]} // centre of India
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <InvalidateSizeOnMount />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />

          {originPin && (
            <Marker position={[originPin.lat, originPin.lng]} icon={blueIcon}>
              <Popup>
                <strong>Pickup</strong>
                <br />
                {originPin.lat.toFixed(5)}, {originPin.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}

          {destinationPin && (
            <Marker position={[destinationPin.lat, destinationPin.lng]} icon={violetIcon}>
              <Popup>
                <strong>Destination</strong>
                <br />
                {destinationPin.lat.toFixed(5)}, {destinationPin.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Reset button */}
      {(originPin || destinationPin) && (
        <button
          type="button"
          onClick={() => {
            onOriginChange(null);
            onDestinationChange(null);
            setNextPin("origin");
          }}
          className="text-xs text-gray-400 hover:text-red-500 transition underline"
        >
          Reset pins
        </button>
      )}
    </div>
  );
};

export default MapPicker;
