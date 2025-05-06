import React, { useState, useEffect } from "react";
import { Map, Pin, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchWaterBodies, WaterBody } from "@/lib/api";

interface MapViewProps {
  onSelectWaterBody?: (waterBody: WaterBody) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const MapView = ({
  onSelectWaterBody = () => {},
  userLocation = null,
}: MapViewProps) => {
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(
    null,
  );
  const [mapZoom, setMapZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch water bodies from the API
  useEffect(() => {
    const loadWaterBodies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWaterBodies();
        setWaterBodies(data);
      } catch (err) {
        setError("Failed to load water bodies. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWaterBodies();
  }, []);

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

  const handlePinClick = (waterBody: WaterBody) => {
    setSelectedWaterBody(waterBody);
  };

  const handleViewDetails = () => {
    if (selectedWaterBody) {
      onSelectWaterBody(selectedWaterBody);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e42] text-white">
      {/* Map Controls */}
      <div className="p-2 flex justify-between items-center bg-[#1e1e42] border-b border-[#2a2a5a]">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
            className="border-[#2a2a5a] text-white hover:bg-[#2a2a5a]"
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 5))}
            className="border-[#2a2a5a] text-white hover:bg-[#2a2a5a]"
          >
            -
          </Button>
        </div>
        <div className="text-sm text-gray-400">Zoom: {mapZoom}</div>
        {userLocation && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-[#2a2a5a] text-white hover:bg-[#2a2a5a]"
          >
            <MapPin size={14} />
            Center
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="m-4 p-3 bg-[#2a2a5a] border border-red-500 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Map Area */}
      <div className="relative flex-grow overflow-hidden bg-[#2a2a5a] border-4 border-[#1e1e42]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={48} className="text-[#3a8cff] animate-spin" />
            <span className="absolute text-gray-400 mt-20">
              Loading water bodies...
            </span>
          </div>
        ) : (
          <>
            {/* Placeholder for actual map - would be replaced with a real map library */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Map size={64} className="text-gray-600" />
              <span className="absolute text-gray-400 mt-20">
                Map View (Integration Required)
              </span>
            </div>

            {/* Water Body Pins */}
            <TooltipProvider>
              {waterBodies.map((waterBody) => {
                // Normalize coordinates for display
                // This is a simplified approach - in a real app you'd use proper map projection
                const longitude = waterBody.coordinates.longitude;
                const latitude = waterBody.coordinates.latitude;

                const pinPositionStyle = {
                  left: `${((longitude + 180) / 360) * 100}%`,
                  top: `${((90 - latitude) / 180) * 100}%`,
                };

                return (
                  <div
                    key={waterBody.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={pinPositionStyle}
                    onClick={() => handlePinClick(waterBody)}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(waterBody.status)} border-2 border-[#1e1e42] shadow-md`}
                        >
                          <Pin size={14} className="text-current" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#2a2a5a] text-white border-[#3a8cff]">
                        <p>{waterBody.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </TooltipProvider>
          </>
        )}
      </div>

      {/* Selected Water Body Info */}
      {selectedWaterBody && (
        <Card className="m-2 shadow-md bg-[#1e1e42] border-[#2a2a5a] text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{selectedWaterBody.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${getStatusColor(selectedWaterBody.status).split(" ")[0]}`}
                  ></span>
                  <span className="text-sm capitalize">
                    {selectedWaterBody.status} level
                  </span>
                  <span className="text-sm text-gray-400">
                    {selectedWaterBody.currentLevel.toFixed(2)}m
                  </span>
                </div>
                {selectedWaterBody.distance && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedWaterBody.distance.toFixed(1)}km away
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={handleViewDetails}
                className="bg-[#ff3a8c] hover:bg-[#ff3a8c]/80 text-white"
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
