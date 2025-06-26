// components/TripMap.tsx

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

import { world_map } from "@/world_map";

// fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

type TripMapProps = {
  coordinates: [number, number];
  city: string;
};
export const TripMap = ({ coordinates, city }: TripMapProps) => {
  return (
    <MapContainer
      center={coordinates}
      zoom={6}
      style={{ height: "400px", width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {coordinates && (
        <Marker position={coordinates}>
          <Popup>{city}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

function getCountryCenter(countryName: string): [number, number] | null {
  // @ts-expect-error
  const feature = world_map.features.find(
    (f: any) => f.properties?.name?.toLowerCase() === countryName.toLowerCase()
  );

  if (!feature) return null;

  const coordinates = feature.geometry.coordinates;

  // If it's a polygon (usually it is), take the first polygon
  const coords: number[][] =
    feature.geometry.type === "Polygon" ? coordinates[0] : coordinates[0][0]; // For MultiPolygon

  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);

  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  return [avgLat, avgLng];
}

export default function TripMapForGeneration({
  selectedCountry,
}: {
  selectedCountry: string;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (selectedCountry) {
      const center = getCountryCenter(selectedCountry);
      if (center) setPosition(center);
    }
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
