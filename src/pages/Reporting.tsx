
import React from 'react';
import Header from '@/components/Header';
import ComplianceDashboard from '@/components/reporting/ComplianceDashboard';

/**
 * Reporting page for the Automated Compliance & Reporting system
 * This page displays OSHA/NORSOK compliance status, metrics, and 
 * provides tools for audit trails, incident logging, and report generation.
 */
const Reporting: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-vigia-bg text-foreground">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">Automated Compliance & Reporting</h1>
          <ComplianceDashboard />
        </div>
      </main>
      <footer className="py-4 px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/17558/17558770.png" 
              alt="Vigía Logo" 
              className="h-4 w-4" 
            />
            <p>Vigía Safety Copilot v1.0.0 | Offshore Oil Rig Monitoring System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Reporting;
