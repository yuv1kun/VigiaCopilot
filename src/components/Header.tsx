
import React from 'react';
import { Bell, Eye, Gauge, Shield, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="bg-vigia-card border-b border-border py-3 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-vigia-teal" />
            <h1 className="text-xl font-bold">Vigía <span className="text-vigia-teal">Safety Copilot</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className="flex items-center space-x-1" size="sm">
              <Gauge className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-1" size="sm">
              <Eye className="h-4 w-4" />
              <span>Monitoring</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-1" size="sm">
              <Wrench className="h-4 w-4" />
              <span>Maintenance</span>
            </Button>
            <Button variant="ghost" className="flex items-center space-x-1" size="sm">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </Button>
          </nav>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-vigia-warning rounded-full"></span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-vigia-teal flex items-center justify-center">
              <span className="text-xs font-medium">OP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
