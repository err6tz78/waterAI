import React, { useState, useEffect, useRef } from "react";
import { Map, Pin, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for API station data
interface Station {
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  water: { name: string };
  status?: string;
  currentLevel?: number;
  distance?: number;
}

// Fallback data in case API fails
const fallbackWaterBodies: Station[] = [
  {
    uuid: "1",
    name: "Lake Geneva",
    latitude: 46.2044,
    longitude: 6.1432,
    water: { name: "Rhone" },
    status: "normal",
    currentLevel: 5.2,
    distance: 10.5,
  },
  {
    uuid: "2",
    name: "Lake Zurich",
    latitude: 47.3769,
    longitude: 8.5417,
    water: { name: "Limmat" },
    status: "high",
    currentLevel: 4.8,
    distance: 15.2,
  },
  {
    uuid: "3",
    name: "Lake Constance",
    latitude: 47.6593,
    longitude: 9.175,
    water: { name: "Rhine" },
    status: "low",
    currentLevel: 3.9,
    distance: 20.7,
  },
];

// Fetch stations from PegelOnline API
const fetchWaterBodies = async (): Promise<Station[]> => {
  try {
    const response = await fetch(
      "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json",
    );
    if (!response.ok) {
      throw new Error("Failed to fetch stations");
    }
    const data = await response.json();
    return data.map((station: any, index: number) => ({
      uuid: station.uuid,
      name: station.shortname || station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      water: { name: station.water?.name || "Unknown" },
      status: ["normal", "high", "low"][index % 3], // Mocked status
      currentLevel: 5.0 + Math.random() * 2, // Mocked level
      distance: Math.random() * 20, // Mocked distance
    }));
  } catch (error) {
    console.error("Error fetching stations:", error);
    return fallbackWaterBodies; // Use fallback data
  }
};

interface MapViewProps {
  onSelectWaterBody?: (waterBody: Station) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  searchQuery?: string;
}

const MapView = ({
  onSelectWaterBody = () => {},
  userLocation = null,
  searchQuery = "",
}: MapViewProps) => {
  const [waterBodies, setWaterBodies] = useState<Station[]>([]);
  const [selectedWaterBody, setSelectedWaterBody] = useState<Station | null>(
    null,
  );
  const [mapZoom, setMapZoom] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Leaflet map
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        leafletCSS.integrity =
          "sha512-Zcn6bj+R+Za6uA2gexzeoeZcJPIDvHihr1N8q2nxQ2zSkncLLr0eswb+kVhjilN3kNasU28n2cswOgQOlE/mLOg==";
        leafletCSS.crossOrigin = "anonymous";
        document.head.appendChild(leafletCSS);

        // Load Leaflet JS
        const leafletScript = document.createElement("script");
        leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletScript.integrity =
          "sha512-BwHfrr4cUH5zN1wBUEpknA2d6W2gWZ3jNaWwyXaSY8CP/D47U+6Ikf7nK3g7W7lZ0UR24SwNf0TIyOL4tcU1Nag==";
        leafletScript.crossOrigin = "anonymous";
        leafletScript.async = true;
        document.body.appendChild(leafletScript);

        leafletScript.onload = () => {
          if (mapContainerRef.current && !mapRef.current && window.L) {
            const L = window.L;
            const center = userLocation
              ? [userLocation.latitude, userLocation.longitude]
              : [51.1657, 10.4515]; // Germany center

            mapRef.current = L.map(mapContainerRef.current, {
              center,
              zoom: mapZoom,
              scrollWheelZoom: true,
              zoomControl: false,
            });

            // Use OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(mapRef.current);

            // Update zoom state
            mapRef.current.on("zoomend", () => {
              setMapZoom(mapRef.current.getZoom());
            });

            // Force map redraw
            setTimeout(() => {
              mapRef.current.invalidateSize();
            }, 100);
          }
        };

        leafletScript.onerror = () => {
          setError("Failed to load map resources. Please try again.");
        };
      } catch (err) {
        setError("Failed to initialize map. Please try again.");
        console.error(err);
      }
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  // Fetch and filter water bodies
  useEffect(() => {
    const loadWaterBodies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWaterBodies();
        const filteredData = data.filter((wb) =>
          wb.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setWaterBodies(filteredData);

        // Add markers to map
        if (mapRef.current) {
          const L = window.L;
          mapRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              mapRef.current.removeLayer(layer);
            }
          });

          filteredData.forEach((waterBody) => {
            const marker = L.marker([waterBody.latitude, waterBody.longitude], {
              icon: L.divIcon({
                className: "custom-marker",
                html: `<div class="w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(waterBody.status || "normal")} border-2 border-[#1e1e42] shadow-lg transform transition-transform duration-200 hover:scale-125"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.75.75 0 00.938 0l.028-.016.07-.04a16.5 16.5 0 00.52-.377c.318-.24.573-.529.775-.897.203-.368.342-.736.404-1.108a9 9 0 00-3.304-9.375l-.013-.013c-.438-.442-.974-.807-1.537-1.072a9.013 9.013 0 00-1.906-.614 8.996 8.996 0 00-3.88.073 9.043 9.043 0 00-3.468 1.723 9 9 0 00-2.488 2.976c-.24.517-.377 1.074-.404 1.633a9.055 9.055 0 00.253 2.474c.142.614.38 1.2.708 1.744.318.529.726.984 1.188 1.345.238.184.49.353.755.504l.07.04.028.016a.75.75 0 00.938 0l.028-.016.07-.04c.265-.151.517-.32.755-.504.462-.36.87-.816 1.188-1.345.328-.544.566-1.13.708-1.744a9.054 9.054 0 00.253-2.474 8.987 8.987 0 00-.404-1.633 9 9 0 00-2.488-2.976 9.043 9.043 0 00-3.468-1.723 8.996 8.996 0 00-3.88-.073 9.013 9.013 0 00-1.906.614c-.563.265-1.099.63-1.537 1.072l-.013.013a9 9 0 00-3.304 9.375c.062.372.201.74.404 1.108.202.368.457.657.775.897.198.149.403.29.61.424z" clip-rule="evenodd" /></svg></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
            })
              .addTo(mapRef.current)
              .bindPopup(
                `<div class="bg-[#2a2a5a]/95 text-white border-[#3a8cff]/40 rounded-lg p-3 shadow-lg"><p class="text-sm font-medium">${waterBody.name}</p><p class="text-xs text-gray-400">${waterBody.water.name}</p><p class="text-xs text-gray-400 capitalize">${waterBody.status || "normal"} level</p></div>`,
                { className: "custom-popup" },
              )
              .on("click", () => handlePinClick(waterBody));
          });

          // Redraw map
          mapRef.current.invalidateSize();
        }
      } catch (err) {
        setError("Failed to load stations. Using fallback data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWaterBodies();
  }, [searchQuery]);

  // Update map zoom when state changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapZoom);
    }
  }, [mapZoom]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "bg-[#ff3a8c] text-white";
      case "low":
        return "bg-[#f59e0b] text-white";
      default:
        return "bg-[#3a8cff] text-white";
    }
  };

  const handlePinClick = (waterBody: Station) => {
    setSelectedWaterBody(waterBody);
    if (mapRef.current) {
      mapRef.current.flyTo(
        [waterBody.latitude, waterBody.longitude],
        Math.max(mapZoom, 12),
        { duration: 0.5 },
      );
    }
  };

  const handleViewDetails = () => {
    if (selectedWaterBody) {
      onSelectWaterBody(selectedWaterBody);
    }
  };

  const handleCenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo(
        [userLocation.latitude, userLocation.longitude],
        mapZoom,
        { duration: 0.5 },
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e42] text-white font-sans">
      {/* Map Controls */}
      <div className="p-4 flex justify-between items-center bg-[#1e1e42]/95 backdrop-blur-md border-b border-[#2a2a5a]/30 shadow-sm">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
            className="border-[#2a2a5a]/50 bg-[#2a2a5a]/20 text-white hover:bg-[#2a2a5a]/70 rounded-xl px-6 py-3 transition-all duration-200 shadow-md text-sm font-medium"
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 5))}
            className="border-[#2a2a5a]/50 bg-[#2a2a5a]/20 text-white hover:bg-[#2a2a5a]/70 rounded-xl px-6 py-3 transition-all duration-200 shadow-md text-sm font-medium"
          >
            Zoom Out
          </Button>
        </div>
        {userLocation && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCenterMap}
            className="flex items-center gap-1 border-[#2a2a5a]/50 bg-[#2a2a5a]/20 text-white hover:bg-[#2a2a5a]/70 rounded-xl px-6 py-3 transition-all duration-200 shadow-md text-sm font-medium"
          >
            <MapPin size={16} />
            Center
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="m-4 p-4 bg-[#2a2a5a]/30 border border-red-500/50 rounded-xl flex items-center shadow-md">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      )}

      {/* Map Area */}
      <div className="relative flex-grow overflow-hidden bg-[#2a2a5a]/30 border-4 border-[#1e1e42]/95 rounded-2xl shadow-lg">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <Loader2 size={48} className="text-[#3a8cff] animate-spin" />
            <span className="text-gray-400 text-sm">Loading stations...</span>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-xl"
            style={{
              minHeight: "500px",
              height: "100%",
              position: "relative",
              zIndex: 0,
            }}
          />
        )}
      </div>

      {/* Selected Water Body Info */}
      {selectedWaterBody && (
        <Card className="m-4 shadow-md bg-[#1e1e42]/95 border-[#2a2a5a]/30 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-lg">
                  {selectedWaterBody.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${getStatusColor(selectedWaterBody.status || "normal").split(" ")[0]}`}
                  ></span>
                  <span className="text-sm capitalize">
                    {selectedWaterBody.status || "normal"} level
                  </span>
                  <span className="text-sm text-gray-400">
                    {selectedWaterBody.currentLevel?.toFixed(2) || "N/A"}m
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Water: {selectedWaterBody.water.name}
                </p>
                {selectedWaterBody.distance && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedWaterBody.distance.toFixed(1)}km away
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleViewDetails}
                className="bg-[#ff3a8c] hover:bg-[#ff3a8c]/80 text-white rounded-lg px-4 py-2 transition-all duration-200 shadow-sm text-sm"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapView;
