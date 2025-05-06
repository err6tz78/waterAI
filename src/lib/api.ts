// API utilities for fetching water level data

export interface ApiWaterBody {
  uuid: string;
  number: string;
  shortname: string;
  longname: string;
  km: number;
  agency: string;
  longitude: number;
  latitude: number;
  water: {
    shortname: string;
    longname: string;
  };
  timeseries: Array<{
    shortname: string;
    longname: string;
    unit: string;
    equidistance: number;
    currentMeasurement: {
      timestamp: string;
      value: number;
      stateMnwMhw: string;
      stateNswHsw: string;
    };
    gaugeZero: {
      unit: string;
      value: number;
    };
  }>;
}

export interface WaterBody {
  id: string;
  name: string;
  currentLevel: number;
  normalLevel: number;
  trend: "rising" | "falling" | "stable";
  status: "normal" | "high" | "low";
  distance?: number;
  lastUpdated: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Transform API data to our app's format
export const transformApiData = (data: ApiWaterBody[]): WaterBody[] => {
  return data
    .filter((station) => station.timeseries && station.timeseries.length > 0)
    .map((station) => {
      const timeseries = station.timeseries[0];
      const currentMeasurement = timeseries?.currentMeasurement;

      // Skip stations without current measurements
      if (!currentMeasurement) return null;

      // Determine trend based on state indicators
      let trend: "rising" | "falling" | "stable" = "stable";
      if (currentMeasurement.stateNswHsw === "rising") {
        trend = "rising";
      } else if (currentMeasurement.stateNswHsw === "falling") {
        trend = "falling";
      }

      // Determine status based on state indicators
      let status: "normal" | "high" | "low" = "normal";
      if (
        currentMeasurement.stateMnwMhw === "above" ||
        currentMeasurement.stateNswHsw === "above"
      ) {
        status = "high";
      } else if (
        currentMeasurement.stateMnwMhw === "below" ||
        currentMeasurement.stateNswHsw === "below"
      ) {
        status = "low";
      }

      // Use gauge zero as normal level or default to 80% of current level
      const normalLevel =
        timeseries.gaugeZero?.value || currentMeasurement.value * 0.8;

      return {
        id: station.uuid,
        name: station.longname || station.shortname,
        currentLevel: currentMeasurement.value,
        normalLevel,
        trend,
        status,
        lastUpdated: currentMeasurement.timestamp,
        coordinates: {
          latitude: station.latitude,
          longitude: station.longitude,
        },
      };
    })
    .filter(Boolean) as WaterBody[];
};

// Fetch water bodies from the API
export const fetchWaterBodies = async (): Promise<WaterBody[]> => {
  try {
    const response = await fetch(
      "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json?includeTimeseries=true&includeCurrentMeasurement=true",
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ApiWaterBody[] = await response.json();
    return transformApiData(data);
  } catch (error) {
    console.error("Error fetching water bodies:", error);
    throw error;
  }
};

// Search water bodies by name
export const searchWaterBodies = (
  waterBodies: WaterBody[],
  query: string,
): WaterBody[] => {
  if (!query) return waterBodies;

  const lowerCaseQuery = query.toLowerCase();
  return waterBodies.filter((waterBody) =>
    waterBody.name.toLowerCase().includes(lowerCaseQuery),
  );
};
