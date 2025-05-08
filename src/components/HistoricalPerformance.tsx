
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Calendar, Download, ChartLine } from 'lucide-react';

// Sample historical data for demonstration
const generateHistoricalData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pressure: 1000 + Math.random() * 300,
      temperature: 60 + Math.random() * 15,
      vibration: 0.5 + Math.random() * 1.8,
      efficiency: 75 + Math.random() * 20,
      runtime: 20 + Math.random() * 4,
    });
  }
  
  return data;
};

const weekData = generateHistoricalData(7);
const monthData = generateHistoricalData(30);
const yearData = generateHistoricalData(365);

const chartConfig = {
  pressure: { color: "#33C3F0" },
  temperature: { color: "#F97316" },
  vibration: { color: "#D946EF" },
  efficiency: { color: "#10B981" },
};

const HistoricalPerformance: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const currentData = timeRange === 'week' ? weekData : timeRange === 'month' ? monthData : yearData;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-vigia-teal" />
          Historical Performance Analysis
        </h2>
        <div className="flex items-center gap-3">
          <button className="text-xs flex items-center gap-1 text-vigia-teal hover:text-vigia-teal/80 transition-colors">
            <Calendar className="h-4 w-4" /> Custom Date Range
          </button>
          <button className="text-xs flex items-center gap-1 text-vigia-teal hover:text-vigia-teal/80 transition-colors">
            <Download className="h-4 w-4" /> Export Data
          </button>
        </div>
      </div>
      
      <Card className="bg-vigia-card border-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Equipment Performance Trends</CardTitle>
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
              <TabsList className="bg-vigia-muted/30">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ChartContainer className="h-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="pressure" 
                    name="Pressure (PSI)"
                    stroke="#33C3F0" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)"
                    stroke="#F97316" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="vibration" 
                    name="Vibration (mm/s)"
                    stroke="#D946EF" 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-vigia-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Efficiency Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    name="Efficiency (%)"
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-vigia-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Runtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="runtime" name="Runtime (hours)" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoricalPerformance;
