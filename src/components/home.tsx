import React, { useState, useEffect, useCallback } from "react";
import { Settings, RefreshCw, MapPin, Search } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simulate location permission check
  useEffect(() => {
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
    setIsSidebarOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBackFromDetail = () => {
    setShowDetail(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <div className="flex flex-col min-h-screen bg-[#1e1e42] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1e1e42]/80 backdrop-blur-lg p-4 flex items-center justify-between shadow-sm border-b border-[#2a2a5a]/30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-[#2a2a5a]/70 rounded-full p-2 transition-all duration-200"
            onClick={toggleSidebar}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Water Level Tracker
          </h1>
          {locationStatus === "loading" ? (
            <span className="text-xs text-gray-400 animate-pulse flex items-center">
              <MapPin size={14} className="mr-1" />
              Locating...
            </span>
          ) : locationStatus === "granted" ? (
            <span className="text-xs text-[#3a8cff] flex items-center">
              <MapPin size={14} className="mr-1" />
              Location active
            </span>
          ) : (
            <span className="text-xs text-[#ff3a8c] flex items-center">
              <MapPin size={14} className="mr-1" />
              Location access denied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`text-white hover:bg-[#2a2a5a]/70 rounded-full p-2 transition-all duration-200 ${isRefreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#2a2a5a]/70 rounded-full p-2 transition-all duration-200"
          >
            <Settings size={18} />
          </Button>
        </div>
      </header>

      {/* Main Content with Sidebar Layout */}
      <div className="flex flex-1 flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Sidebar for Search and Tabs */}
        <aside
          className={`lg:w-80 bg-[#1e1e42]/90 p-5 rounded-2xl border border-[#2a2a5a]/30 shadow-lg transition-all duration-300 lg:block ${
            isSidebarOpen
              ? "block absolute top-0 left-0 h-full z-40 w-64 bg-[#1e1e42]"
              : "hidden"
          }`}
        >
          <div className="flex justify-between items-center mb-6 lg:mb-6">
            <h2 className="text-lg font-medium">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-[#2a2a5a]/70 rounded-full p-2"
              onClick={toggleSidebar}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search water bodies..."
              className="w-full pl-10 pr-4 py-3 bg-[#2a2a5a]/20 border border-[#2a2a5a]/40 rounded-xl text-white placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-[#3a8cff]/40 focus:bg-[#2a2a5a]/30 transition-all duration-300 shadow-sm"
            />
          </div>
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 bg-[#2a2a5a]/20 rounded-xl p-1.5 gap-2">
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-[#ff3a8c] data-[state=active]:text-white rounded-lg py-2.5 font-medium transition-all duration-200 hover:bg-[#2a2a5a]/40 text-sm"
              >
                List View
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-[#ff3a8c] data-[state=active]:text-white rounded-lg py-2.5 font-medium transition-all duration-200 hover:bg-[#2a2a5a]/40 text-sm"
              >
                Map View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#1e1e42]/90 rounded-2xl border border-[#2a2a5a]/30 p-6 shadow-lg">
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="list" className="mt-0">
              {locationStatus === "denied" ? (
                <LocationDeniedMessage />
              ) : (
                <WaterBodyList
                  searchQuery={debouncedSearchQuery}
                  onSelectWaterBody={handleSelectWaterBody}
                />
              )}
            </TabsContent>
            <TabsContent value="map" className="mt-0">
              {locationStatus === "denied" ? (
                <LocationDeniedMessage />
              ) : (
                <MapView onSelectWaterBody={handleSelectWaterBody} />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a5a]/50 p-4 text-center text-xs text-gray-400 bg-[#1e1e42]/95">
        <p>Water Level Tracker © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

const LocationDeniedMessage = () => {
  return (
    <Card className="p-8 flex flex-col items-center justify-center text-center bg-[#2a2a5a]/20 border-[#2a2a5a]/40 rounded-2xl shadow-md">
      <MapPin size={48} className="text-gray-400 mb-4 animate-pulse" />
      <h3 className="text-lg font-medium mb-2">Location Access Required</h3>
      <p className="text-gray-400 mb-6 max-w-md text-sm">
        To show water bodies near you, we need access to your location. Please
        enable location services in your browser settings.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-[#ff3a8c] hover:bg-[#ff3a8c]/80 text-white py-2 px-6 rounded-lg transition-all duration-200 shadow-sm text-sm"
      >
        Try Again
      </Button>
    </Card>
  );
};

export default Home;
