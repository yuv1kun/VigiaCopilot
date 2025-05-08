
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <footer className="py-4 px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Vigía Safety Copilot v1.0.0 | Offshore Oil Rig Monitoring System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
