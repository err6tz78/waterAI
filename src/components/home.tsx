import React, { useState, useEffect, useCallback } from "react";
import { Settings, RefreshCw, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import SearchBar from "./SearchBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card } from "./ui/card";
import WaterBodyList from "./WaterBodyList";
import MapView from "./MapView";
import WaterBodyDetail from "./WaterBodyDetail";
import { WaterBody } from "@/lib/api";
import { debounce } from "@/lib/utils";

const Home = () => {
  const [locationStatus, setLocationStatus] = useState<
    "granted" | "denied" | "loading"
  >("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedWaterBody, setSelectedWaterBody] = useState<WaterBody | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("list");
  const [showDetail, setShowDetail] = useState(false);

  // Simulate location permission check
  React.useEffect(() => {
    setTimeout(() => {
      setLocationStatus("granted");
    }, 1000);
  }, []);

  // Debounce search query updates
  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    [],
  );

  // Update debounced search query when input changes
  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSelectWaterBody = (waterBody: WaterBody) => {
    setSelectedWaterBody(waterBody);
    setShowDetail(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBackFromDetail = () => {
    setShowDetail(false);
  };

  // If showing detail view, render the WaterBodyDetail component
  if (showDetail && selectedWaterBody) {
    return (
      <WaterBodyDetail
        waterBody={{
          id: selectedWaterBody.id,
          name: selectedWaterBody.name,
          currentLevel: selectedWaterBody.currentLevel,
          normalLevel: selectedWaterBody.normalLevel,
          status: selectedWaterBody.status,
          trend: selectedWaterBody.trend,
          location: `${selectedWaterBody.coordinates.latitude.toFixed(4)}, ${selectedWaterBody.coordinates.longitude.toFixed(4)}`,
          coordinates: {
            lat: selectedWaterBody.coordinates.latitude,
            lng: selectedWaterBody.coordinates.longitude,
          },
          lastUpdated: selectedWaterBody.lastUpdated,
          historicalData: [
            {
              date: new Date(
                Date.now() - 14 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              level: selectedWaterBody.normalLevel * 0.95,
            },
            {
              date: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              level: selectedWaterBody.normalLevel * 0.98,
            },
            {
              date: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              level: selectedWaterBody.normalLevel * 1.02,
            },
            {
              date: new Date(Date.now()).toISOString(),
              level: selectedWaterBody.currentLevel,
            },
          ],
        }}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Water Level Tracker
          </h1>
          <div className="ml-4 flex items-center">
            {locationStatus === "loading" ? (
              <span className="text-sm text-gray-400 animate-pulse flex items-center">
                <MapPin size={16} className="mr-1" />
                Locating...
              </span>
            ) : locationStatus === "granted" ? (
              <div className="flex items-center text-sm text-blue-400">
                <MapPin size={16} className="mr-1" />
                <span>Location active</span>
              </div>
            ) : (
              <span className="text-sm text-red-400 flex items-center">
                <MapPin size={16} className="mr-1" />
                Location access denied
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 ${isRefreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
          >
            <Settings size={20} />
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search water bodies..."
          className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Tabs
          defaultValue="list"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/50 rounded-lg p-1">
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md py-2 transition-all duration-200"
            >
              List View
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md py-2 transition-all duration-200"
            >
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-2">
            {locationStatus === "denied" ? (
              <LocationDeniedMessage />
            ) : (
              <WaterBodyList
                searchQuery={debouncedSearchQuery}
                onSelectWaterBody={handleSelectWaterBody}
              />
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-2">
            {locationStatus === "denied" ? (
              <LocationDeniedMessage />
            ) : (
              <MapView onSelectWaterBody={handleSelectWaterBody} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 p-4 text-center text-sm text-gray-400 bg-gray-900/80">
        <p>Water Level Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

const LocationDeniedMessage = () => {
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center bg-gray-800/50 border-gray-700/50 shadow-xl rounded-xl">
      <MapPin size={64} className="text-gray-400 mb-4 animate-pulse" />
      <h3 className="text-xl font-semibold text-white mb-2">
        Location Access Required
      </h3>
      <p className="text-gray-400 mb-6 max-w-md">
        To show water bodies near you, we need access to your location. Please
        enable location services in your browser settings.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
      >
        Try Again
      </Button>
    </Card>
  );
};

export default Home;
