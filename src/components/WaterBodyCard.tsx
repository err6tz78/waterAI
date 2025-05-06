import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  DropletIcon,
} from "lucide-react";

interface WaterBodyCardProps {
  id: string;
  name: string;
  currentLevel: number;
  maxLevel: number;
  trend: "rising" | "falling" | "stable";
  status: "normal" | "high" | "low";
  distance: number;
  lastUpdated: string;
  onClick?: (id: string) => void;
}

const WaterBodyCard = ({
  id = "1",
  name = "Lake Example",
  currentLevel = 75,
  maxLevel = 100,
  trend = "stable",
  status = "normal",
  distance = 2.5,
  lastUpdated = "10 minutes ago",
  onClick,
}: WaterBodyCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "high":
        return "bg-[#ff3a8c] text-white";
      case "low":
        return "bg-[#f59e0b] text-white";
      default:
        return "bg-[#3a8cff] text-white";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "rising":
        return <ArrowUpIcon className="h-4 w-4 text-[#ff3a8c]" />;
      case "falling":
        return <ArrowDownIcon className="h-4 w-4 text-[#3a8cff]" />;
      default:
        return <ArrowRightIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return lastUpdated;
      }

      // If less than 24 hours ago, show relative time
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs < 24) {
        if (diffHrs < 1) {
          const mins = Math.round(diffMs / (1000 * 60));
          return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
        }
        return `${Math.round(diffHrs)} hour${Math.round(diffHrs) !== 1 ? "s" : ""} ago`;
      }

      // Otherwise show the date
      return date.toLocaleDateString();
    } catch (e) {
      return lastUpdated;
    }
  };

  return (
    <Card
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow bg-[#1e1e42] border-[#2a2a5a] text-white"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{name}</h3>
            <div className="flex items-center text-sm text-gray-400 mt-1">
              <span>{distance.toFixed(1)} km away</span>
              <span className="mx-2">•</span>
              <span>{formatDate(lastUpdated)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Badge className={`mb-1 ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <div className="flex items-center">
              <DropletIcon className="h-4 w-4 text-[#3a8cff] mr-1" />
              <span className="text-sm font-medium">
                {currentLevel.toFixed(2)}/{maxLevel.toFixed(2)}m
              </span>
              <span className="ml-1">{getTrendIcon()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterBodyCard;
