"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type WorldMapFeature = {
  properties?: { name?: string };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

type WorldMapGeoJson = {
  features: WorldMapFeature[];
};

function getCountryCenter(
  worldMap: WorldMapGeoJson,
  countryName: string
): [number, number] | null {
  const feature = worldMap.features.find(
    (f: WorldMapFeature) =>
      f.properties?.name?.toLowerCase() === countryName.toLowerCase()
  );

  if (!feature) return null;

  const coordinates = feature.geometry.coordinates;

  const coords: number[][] =
    feature.geometry.type === "Polygon"
      ? (coordinates as number[][][])[0]
      : (coordinates as number[][][][])[0][0];

  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);

  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  return [avgLat, avgLng];
}

export default function CountryMap({
  selectedCountry,
}: {
  selectedCountry: string;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!selectedCountry) return;

    let cancelled = false;

    // Loaded lazily so the ~562KB GeoJSON never ships with the rest of the page
    import("@/world_map").then(({ world_map }) => {
      if (cancelled) return;
      const center = getCountryCenter(
        world_map as unknown as WorldMapGeoJson,
        selectedCountry
      );
      if (center) setPosition(center);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedCountry]);

  if (!position) {
    return (
      <p className="text-gray-500 mt-3 ml-2">
        Select a country to view it on the map
      </p>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={5}
      style={{ height: "400px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{selectedCountry}</Popup>
      </Marker>
    </MapContainer>
  );
}
