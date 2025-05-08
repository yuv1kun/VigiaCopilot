
import React from 'react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'alert' | 'inactive';
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
  };
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  status, 
  icon,
  trend,
  className
}) => {
  const getStatusClass = () => {
    switch (status) {
      case 'normal':
        return 'status-normal';
      case 'warning':
        return 'status-warning';
      case 'alert':
        return status === 'alert' ? 'status-alert animate-alert-blink' : 'status-alert';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-normal';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.direction === 'up') {
      return (
        <div className="text-xs flex items-center text-vigia-warning">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(270 8 8)" />
          </svg>
          <span>{trend.value}%</span>
        </div>
      );
    }
    
    if (trend.direction === 'down') {
      return (
        <div className="text-xs flex items-center text-vigia-success">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 8 8)" />
          </svg>
          <span>{trend.value}%</span>
        </div>
      );
    }
    
    return (
      <div className="text-xs flex items-center text-vigia-muted">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{trend.value}%</span>
      </div>
    );
  };
  
  return (
    <div 
      className={cn(
        'vigia-card flex flex-col h-full', 
        getStatusClass(), 
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <div className="p-1">{icon}</div>
      </div>
      <div className="flex flex-col mt-auto">
        <div className="text-xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs uppercase opacity-70">Status: {status}</div>
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
