
import React from 'react';
import Header from '@/components/Header';
import HistoricalPerformance from '@/components/HistoricalPerformance';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
          
          <div className="space-y-10">
            <HistoricalPerformance />
          </div>
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
