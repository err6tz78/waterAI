import React from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import WaterBodyCard from "./WaterBodyCard";
import { Button } from "./ui/button";
import { WaterBody } from "@/lib/api";
import { useWaterBodies } from "@/hooks/useWaterBodies";

interface WaterBodyListProps {
  onSelectWaterBody?: (waterBody: WaterBody) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  searchQuery?: string;
}

const WaterBodyList = ({
  onSelectWaterBody = () => {},
  userLocation = null,
  searchQuery = "",
}: WaterBodyListProps) => {
  const { filteredWaterBodies, isLoading, isRefreshing, error, handleRefresh } =
    useWaterBodies(searchQuery);

  return (
    <div className="flex flex-col w-full h-full bg-[#1e1e42] text-white">
      <div className="flex justify-between items-center mb-4 px-4 py-3 border-b border-[#2a2a5a]">
        <h2 className="text-lg font-semibold">Water Bodies</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-white hover:bg-[#2a2a5a]"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-[#2a2a5a] border border-red-500 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4 px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-[#2a2a5a] animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredWaterBodies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>
                {searchQuery
                  ? "No matching water bodies found."
                  : "No water bodies available."}
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="mt-4 border-[#2a2a5a] text-white hover:bg-[#2a2a5a]"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredWaterBodies.map((waterBody) => (
                <div
                  key={waterBody.id}
                  onClick={() => onSelectWaterBody(waterBody)}
                  className="cursor-pointer"
                >
                  <WaterBodyCard
                    id={waterBody.id}
                    name={waterBody.name}
                    currentLevel={waterBody.currentLevel}
                    maxLevel={waterBody.normalLevel}
                    trend={waterBody.trend}
                    status={waterBody.status}
                    distance={waterBody.distance || 0}
                    lastUpdated={waterBody.lastUpdated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaterBodyList;
