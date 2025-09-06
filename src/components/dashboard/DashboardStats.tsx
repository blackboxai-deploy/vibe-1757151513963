'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DashboardStatsProps {
  stats: {
    totalVehicles: number;
    activeVehicles: number;
    totalAlerts: number;
    criticalAlerts: number;
    avgSpeed: number;
    totalDistance: number;
    fuelConsumption: number;
    topSpeed: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const activePercentage = (stats.activeVehicles / Math.max(stats.totalVehicles, 1)) * 100;
  const criticalAlertPercentage = (stats.criticalAlerts / Math.max(stats.totalAlerts, 1)) * 100;

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: "🚗",
      color: "blue",
      subtitle: `${stats.activeVehicles} active`,
      progress: activePercentage,
      trend: "+5.2%",
      trendUp: true,
    },
    {
      title: "Active Alerts",
      value: stats.totalAlerts,
      icon: "🚨",
      color: stats.criticalAlerts > 0 ? "red" : "green",
      subtitle: `${stats.criticalAlerts} critical`,
      progress: criticalAlertPercentage,
      trend: "-12.3%",
      trendUp: false,
    },
    {
      title: "Average Speed",
      value: `${stats.avgSpeed}`,
      unit: "km/h",
      icon: "⚡",
      color: "purple",
      subtitle: `Top: ${stats.topSpeed} km/h`,
      progress: (stats.avgSpeed / 120) * 100,
      trend: "+2.1%",
      trendUp: true,
    },
    {
      title: "Total Distance",
      value: (stats.totalDistance / 1000).toFixed(1),
      unit: "K km",
      icon: "🛣️",
      color: "orange",
      subtitle: "This month",
      progress: 75,
      trend: "+8.7%",
      trendUp: true,
    },
    {
      title: "Fuel Efficiency",
      value: (100 - (stats.fuelConsumption / Math.max(stats.totalVehicles, 1))).toFixed(0),
      unit: "%",
      icon: "⛽",
      color: "green",
      subtitle: "Average level",
      progress: 100 - (stats.fuelConsumption / Math.max(stats.totalVehicles, 1)),
      trend: "+3.4%",
      trendUp: true,
    },
    {
      title: "System Uptime",
      value: "99.8",
      unit: "%",
      icon: "🔄",
      color: "blue",
      subtitle: "Last 30 days",
      progress: 99.8,
      trend: "+0.2%",
      trendUp: true,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        badge: "bg-blue-100 text-blue-800",
        progress: "bg-blue-600",
      },
      red: {
        bg: "bg-red-50",
        icon: "text-red-600",
        badge: "bg-red-100 text-red-800",
        progress: "bg-red-600",
      },
      green: {
        bg: "bg-green-50",
        icon: "text-green-600",
        badge: "bg-green-100 text-green-800",
        progress: "bg-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        badge: "bg-purple-100 text-purple-800",
        progress: "bg-purple-600",
      },
      orange: {
        bg: "bg-orange-50",
        icon: "text-orange-600",
        badge: "bg-orange-100 text-orange-800",
        progress: "bg-orange-600",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <span className={`text-lg ${colors.icon}`}>
                  {stat.icon}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Main Value */}
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  {stat.unit && (
                    <div className="text-sm text-gray-500">
                      {stat.unit}
                    </div>
                  )}
                  {stat.trend && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        stat.trendUp 
                          ? 'text-green-600 border-green-200' 
                          : 'text-red-600 border-red-200'
                      }`}
                    >
                      {stat.trendUp ? '↗' : '↘'} {stat.trend}
                    </Badge>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-xs text-gray-600">
                  {stat.subtitle}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Progress 
                    value={Math.min(stat.progress, 100)} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {Math.round(stat.progress)}%
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Status Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${colors.progress}`} />
          </Card>
        );
      })}
    </div>
  );
}