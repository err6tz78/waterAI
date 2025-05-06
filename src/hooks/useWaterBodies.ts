import { useState, useEffect } from "react";
import { fetchWaterBodies, searchWaterBodies, WaterBody } from "@/lib/api";

export function useWaterBodies(searchQuery: string = "") {
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>([]);
  const [filteredWaterBodies, setFilteredWaterBodies] = useState<WaterBody[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch water bodies from the API
  const loadWaterBodies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWaterBodies();
      setWaterBodies(data);
      setFilteredWaterBodies(searchWaterBodies(data, searchQuery));
    } catch (err) {
      setError("Failed to load water bodies. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWaterBodies();
    setIsRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    loadWaterBodies();
  }, []);

  // Filter water bodies when search query changes
  useEffect(() => {
    if (waterBodies.length > 0) {
      setFilteredWaterBodies(searchWaterBodies(waterBodies, searchQuery));
    }
  }, [searchQuery, waterBodies]);

  return {
    waterBodies,
    filteredWaterBodies,
    isLoading,
    isRefreshing,
    error,
    handleRefresh,
    loadWaterBodies,
  };
}
