
import React, { useState } from 'react';
import Header from '@/components/Header';
import HistoricalPerformance from '@/components/HistoricalPerformance';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Analytics: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");

  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
          
          <Tabs 
            value={selectedEquipment} 
            onValueChange={setSelectedEquipment}
            className="mb-8"
          >
            <TabsList className="bg-vigia-muted/30 mb-4">
              <TabsTrigger value="all">All Equipment</TabsTrigger>
              <TabsTrigger value="pump-001">Primary Pump</TabsTrigger>
              <TabsTrigger value="comp-002">Main Compressor</TabsTrigger>
              <TabsTrigger value="pump-003">Secondary Pump</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-10">
              <HistoricalPerformance equipmentId="all" />
            </TabsContent>
            
            <TabsContent value="pump-001" className="space-y-10">
              <HistoricalPerformance equipmentId="pump-001" equipmentName="Primary Pump" />
            </TabsContent>
            
            <TabsContent value="comp-002" className="space-y-10">
              <HistoricalPerformance equipmentId="comp-002" equipmentName="Main Compressor" />
            </TabsContent>
            
            <TabsContent value="pump-003" className="space-y-10">
              <HistoricalPerformance equipmentId="pump-003" equipmentName="Secondary Pump" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="py-4 px-6 border-t border-border mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Vigía Safety Copilot v1.0.0 | Offshore Oil Rig Analytics System</p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
