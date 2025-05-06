import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface WaterBodyDetailProps {
  waterBody?: {
    id: string;
    name: string;
    currentLevel: number;
    normalLevel: number;
    status: "normal" | "high" | "low";
    trend: "rising" | "falling" | "stable";
    location: string;
    coordinates: { lat: number; lng: number };
    lastUpdated: string;
    historicalData: Array<{ date: string; level: number }>;
  };
  onBack?: () => void;
}

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

interface ChartDataPoint {
  name: string;
  current: number;
  normal: number;
}

const CircularProgressBar = ({
  value,
  maxValue,
  color,
}: {
  value: number;
  maxValue: number;
  color: string;
}) => {
  const percentage = (value / maxValue) * 100;
  const data = [
    { name: "filled", value: percentage },
    { name: "empty", value: 100 - percentage },
  ];

  return (
    <div className="relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell key="filled" fill={color} />
            <Cell key="empty" fill="#2a2a5a" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-3xl font-bold">{value.toFixed(1)}</span>
        <span className="text-sm text-gray-300">meters</span>
      </div>
    </div>
  );
};

const WaterBodyDetail = ({
  waterBody = {
    id: "1",
    name: "Lake Michigan",
    currentLevel: 176.5,
    normalLevel: 175.8,
    status: "high" as const,
    trend: "rising" as const,
    location: "Chicago, IL",
    coordinates: { lat: 41.8781, lng: -87.6298 },
    lastUpdated: "2023-06-15T14:30:00Z",
    historicalData: [
      { date: "2023-06-01", level: 175.9 },
      { date: "2023-06-05", level: 176.1 },
      { date: "2023-06-10", level: 176.3 },
      { date: "2023-06-15", level: 176.5 },
    ],
  },
  onBack = () => {},
}: WaterBodyDetailProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("line");

  // Generate radar chart data
  const radarData: RadarDataPoint[] = [
    {
      subject: "Depth",
      value: waterBody.currentLevel,
      fullMark: waterBody.normalLevel * 1.5,
    },
    { subject: "Flow Rate", value: 65, fullMark: 100 },
    { subject: "Clarity", value: 78, fullMark: 100 },
    { subject: "Temperature", value: 22, fullMark: 30 },
    { subject: "Oxygen", value: 85, fullMark: 100 },
    { subject: "pH Level", value: 7.2, fullMark: 14 },
  ];

  // Generate line chart data from historical data
  const lineChartData = waterBody.historicalData.map((item) => ({
    name: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    current: item.level,
    normal: waterBody.normalLevel,
  }));

  // Generate bar chart data
  const barChartData = [
    { name: "Jan", current: 175.9, normal: 175.8 },
    { name: "Feb", current: 176.0, normal: 175.8 },
    { name: "Mar", current: 176.1, normal: 175.8 },
    { name: "Apr", current: 176.2, normal: 175.8 },
    { name: "May", current: 176.3, normal: 175.8 },
    { name: "Jun", current: 176.5, normal: 175.8 },
    { name: "Jul", current: 176.4, normal: 175.8 },
    { name: "Aug", current: 176.3, normal: 175.8 },
  ];

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: "normal" | "high" | "low") => {
    switch (status) {
      case "high":
        return "#ff3a8c"; // Pink
      case "low":
        return "#f59e0b"; // Amber
      default:
        return "#3a8cff"; // Blue
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: "rising" | "falling" | "stable") => {
    switch (trend) {
      case "rising":
        return <ChevronUp className="text-[#ff3a8c]" />;
      case "falling":
        return <ChevronDown className="text-[#3a8cff]" />;
      default:
        return null;
    }
  };

  // Calculate percentage difference from normal
  const percentDiff = (
    ((waterBody.currentLevel - waterBody.normalLevel) / waterBody.normalLevel) *
    100
  ).toFixed(1);
  const isAboveNormal = waterBody.currentLevel > waterBody.normalLevel;

  // Generate stats data for dashboard
  const statsData = [
    { label: "Item 01", value: "21", secondary: "8,991", tertiary: "209,739" },
    { label: "Item 02", value: "5", secondary: "204", tertiary: "904" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e42] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a5a]">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-[#2a2a5a]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">{waterBody.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-300">Robert Ross</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left column - Circular progress */}
          <Card className="bg-[#1e1e42] text-white border-[#2a2a5a] shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              <CircularProgressBar
                value={waterBody.currentLevel}
                maxValue={waterBody.normalLevel * 1.2}
                color={getStatusColor(waterBody.status)}
              />
              <div className="mt-4 text-center">
                <h2 className="text-3xl font-bold">
                  {waterBody.currentLevel.toFixed(2)}m
                </h2>
                <div className="flex items-center justify-center text-sm text-gray-300 mt-1">
                  <span>
                    {isAboveNormal ? "+" : ""}
                    {percentDiff}% from normal
                  </span>
                  {getTrendIcon(waterBody.trend)}
                </div>
              </div>

              {/* Stats table */}
              <div className="w-full mt-6 border border-[#2a2a5a] rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2a2a5a]">
                      <th className="p-2 text-left text-gray-400">ITEM 01</th>
                      <th className="p-2 text-right text-gray-400">21</th>
                      <th className="p-2 text-right text-gray-400">8,991</th>
                      <th className="p-2 text-right text-gray-400">209,739</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-left">ITEM 02</td>
                      <td className="p-2 text-right">5</td>
                      <td className="p-2 text-right">204</td>
                      <td className="p-2 text-right">904</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Gauge indicators */}
              <div className="w-full mt-6 flex flex-col items-center">
                <div className="flex justify-between w-full mb-2">
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 rounded-md bg-[#2a2a5a] text-white">
                      ITEM 01
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 rounded-md bg-[#ff3a8c] text-white">
                      ITEM 01
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 rounded-md bg-[#2a2a5a] text-white">
                      ITEM 01
                    </div>
                  </div>
                </div>

                <div className="w-full h-4 bg-[#2a2a5a] rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-1 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex justify-between w-full mt-2">
                  <div className="text-sm text-gray-400">25%</div>
                  <div className="text-sm text-gray-400">50%</div>
                  <div className="text-sm text-gray-400">100%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column - Radar chart */}
          <Card className="bg-[#1e1e42] text-white border-[#2a2a5a] shadow-lg">
            <CardContent className="p-6">
              <div className="h-[400px] rounded-md flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={radarData}
                  >
                    <PolarGrid stroke="#444" />
                    <PolarAngleAxis dataKey="subject" stroke="#888" />
                    <PolarRadiusAxis stroke="#888" />
                    <Radar
                      name="Current"
                      dataKey="value"
                      stroke="#ff3a8c"
                      fill="#ff3a8c"
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Reference"
                      dataKey="fullMark"
                      stroke="#3a8cff"
                      fill="#3a8cff"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Percentage indicators */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a2a5a"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ff3a8c"
                        strokeWidth="3"
                        strokeDasharray="25, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">25%</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold">01</h4>
                    <p className="text-xs text-gray-400">
                      Lorem ipsum dolor sit amet
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a2a5a"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ff3a8c"
                        strokeWidth="3"
                        strokeDasharray="50, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">50%</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold">02</h4>
                    <p className="text-xs text-gray-400">
                      Lorem ipsum dolor sit amet
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a2a5a"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ff3a8c"
                        strokeWidth="3"
                        strokeDasharray="75, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">75%</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold">03</h4>
                    <p className="text-xs text-gray-400">
                      Lorem ipsum dolor sit amet
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a2a5a"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ff3a8c"
                        strokeWidth="3"
                        strokeDasharray="100, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">100%</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-bold">04</h4>
                    <p className="text-xs text-gray-400">
                      Lorem ipsum dolor sit amet
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>10</span>
                    <span>20</span>
                    <span>30</span>
                    <span>40</span>
                    <span>50</span>
                    <span>60</span>
                    <span>70</span>
                    <span>80</span>
                  </div>
                  <div className="h-1 w-full bg-[#2a2a5a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3a8cff]"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="h-1 w-full bg-[#2a2a5a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff3a8c]"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="h-1 w-full bg-[#2a2a5a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b]"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart section */}
        <Card className="mb-6 bg-[#1e1e42] text-white border-[#2a2a5a] shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Data Visualization</CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-[300px]"
              >
                <TabsList className="bg-[#2a2a5a]">
                  <TabsTrigger
                    value="line"
                    className="data-[state=active]:bg-[#ff3a8c] data-[state=active]:text-white"
                  >
                    Line
                  </TabsTrigger>
                  <TabsTrigger
                    value="radar"
                    className="data-[state=active]:bg-[#ff3a8c] data-[state=active]:text-white"
                  >
                    Radar
                  </TabsTrigger>
                  <TabsTrigger
                    value="bar"
                    className="data-[state=active]:bg-[#ff3a8c] data-[state=active]:text-white"
                  >
                    Bar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] rounded-md flex items-center justify-center">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full h-full"
              >
                <TabsContent value="line" className="w-full h-full mt-0">
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="60%">
                      <LineChart
                        data={lineChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <XAxis dataKey="name" stroke="#8884d8" />
                        <YAxis stroke="#8884d8" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#2a2a5a",
                            border: "none",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="current"
                          stroke="#ff3a8c"
                          strokeWidth={3}
                          dot={{
                            stroke: "#ff3a8c",
                            strokeWidth: 2,
                            r: 4,
                            fill: "#ff3a8c",
                          }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="normal"
                          stroke="#3a8cff"
                          strokeWidth={3}
                          dot={{
                            stroke: "#3a8cff",
                            strokeWidth: 2,
                            r: 4,
                            fill: "#3a8cff",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="flex justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff3a8c]"></div>
                        <span className="text-sm text-gray-300">01</span>
                        <span className="text-sm text-gray-300 ml-4">
                          00:00:00
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">00:04:12</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">01:10:34</span>
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <div className="px-4 py-1 rounded-md bg-[#2a2a5a] text-white text-sm">
                        00:00:00
                      </div>
                      <div className="px-4 py-1 rounded-md bg-[#2a2a5a] text-white text-sm">
                        00:04:12
                      </div>
                      <div className="px-4 py-1 rounded-md bg-[#2a2a5a] text-white text-sm">
                        01:10:34
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <div className="px-4 py-1 rounded-md border border-[#2a2a5a] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md border border-[#2a2a5a] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md border border-[#2a2a5a] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md border border-[#2a2a5a] text-white text-sm">
                        +34.4%
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <div className="px-4 py-1 rounded-md bg-[#ff3a8c] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md bg-[#ff3a8c] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md bg-[#ff3a8c] text-white text-sm">
                        +34.4%
                      </div>
                      <div className="px-4 py-1 rounded-md bg-[#ff3a8c] text-white text-sm">
                        +34.4%
                      </div>
                    </div>

                    {/* Audio visualization */}
                    <div className="mt-4 flex items-end justify-center h-16 gap-1">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-[#ff3a8c]"
                          style={{
                            height: `${Math.max(15, Math.sin(i * 0.5) * 50 + 50)}%`,
                            opacity: i % 3 === 0 ? 0.5 : 1,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="radar" className="w-full h-full mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={radarData}
                    >
                      <PolarGrid stroke="#444" />
                      <PolarAngleAxis dataKey="subject" stroke="#888" />
                      <PolarRadiusAxis stroke="#888" />
                      <Radar
                        name="Current"
                        dataKey="value"
                        stroke="#ff3a8c"
                        fill="#ff3a8c"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="bar" className="w-full h-full mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <XAxis dataKey="name" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#2a2a5a",
                          border: "none",
                        }}
                      />
                      <Bar
                        dataKey="current"
                        fill="#ff3a8c"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="normal"
                        fill="#3a8cff"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaterBodyDetail;
